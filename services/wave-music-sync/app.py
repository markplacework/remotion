"""Wave Music · precise lyric sync on Modal (GPU).

    modal deploy services/wave-music-sync/app.py

Exposes two web endpoints (POST, multipart form):

POST /  — lyric sync
    audio   the song file (mp3, wav, m4a...)
    lyrics  the lyrics, one line per row
    language optional, default "es"
and answers with the JSON the app already uses:
    { starts: [...], words: [{ text, words: [{ text, d0, d1 }] }], matched, total, duration }

POST /transcribe — Captions
    audio   the audio of a video (any format ffmpeg reads)
and answers { words: [{ text, start, end }], duration }: every spoken word
with its time, for the app to cut into subtitles.

POST /stems — Remove Vocal
    audio   the song file
    stem    "instrumental" (default) or "vocals"
and answers with that stem as an MP3. Asking for both stems of the same
song separates it once (cached on the warm container).

The endpoint requires `Authorization: Bearer <token>`. The token lives in
the Modal secret "wave-music-sync-token" (key WAVE_SYNC_TOKEN), so every
redeploy keeps it:
    modal secret create wave-music-sync-token WAVE_SYNC_TOKEN=...
"""

import os

import modal

APP_NAME = "wave-music-sync"
WHISPER_MODEL = "large-v3"
LANGUAGES = ["es"]  # alignment models baked into the image; others download on first use

image = (
    modal.Image.from_registry("nvidia/cuda:12.8.1-cudnn-runtime-ubuntu22.04", add_python="3.11")
    .apt_install("ffmpeg")
    .pip_install(
        "torch==2.8.0",
        "torchaudio==2.8.0",
        "whisperx==3.8.6",
        "demucs==4.1.0",
        "fastapi[standard]==0.115.6",
        "python-multipart==0.0.20",
    )
    .env({"HF_HUB_ENABLE_HF_TRANSFER": "0"})
    .add_local_python_source("pipeline", copy=True)
)


def download_models():
    """Bake every model into the image so cold starts don't download."""
    import whisperx
    from demucs.pretrained import get_model
    from pipeline import ALIGN_MODELS

    get_model("htdemucs")
    whisperx.load_model(WHISPER_MODEL, "cpu", compute_type="int8", language="es")
    for lang in LANGUAGES:
        whisperx.load_align_model(language_code=lang, device="cpu", model_name=ALIGN_MODELS.get(lang))


image = image.run_function(download_models)

app = modal.App(APP_NAME, image=image)

secrets = [modal.Secret.from_name("wave-music-sync-token", required_keys=["WAVE_SYNC_TOKEN"])]

MAX_BYTES = 60 * 1024 * 1024


@app.cls(gpu="A10G", timeout=900, scaledown_window=300, secrets=secrets)
@modal.concurrent(max_inputs=1)
class Syncer:
    @modal.enter()
    def load(self):
        from pipeline import Pipeline

        self.pipe = Pipeline(device="cuda", whisper_model=WHISPER_MODEL)

    def _run(self, audio: bytes, filename: str, lines: list[str], separate=True, forced=True, refine=True) -> dict:
        import tempfile

        suffix = os.path.splitext(filename or "")[1] or ".mp3"
        with tempfile.NamedTemporaryFile(suffix=suffix) as f:
            f.write(audio)
            f.flush()
            return self.pipe.run(f.name, lines, separate=separate, forced=forced, refine=refine)

    def _stem(self, audio: bytes, filename: str, stem: str) -> bytes:
        import tempfile

        suffix = os.path.splitext(filename or "")[1] or ".mp3"
        with tempfile.NamedTemporaryFile(suffix=suffix) as f:
            f.write(audio)
            f.flush()
            return self.pipe.stem_mp3(f.name, stem)

    def _speech(self, audio: bytes, filename: str) -> dict:
        import tempfile

        suffix = os.path.splitext(filename or "")[1] or ".wav"
        with tempfile.NamedTemporaryFile(suffix=suffix) as f:
            f.write(audio)
            f.flush()
            return self.pipe.speech(f.name)

    @modal.method()
    def stems(self, audio: bytes, filename: str = "song.mp3", stem: str = "instrumental") -> bytes:
        """Python entry point for tests."""
        return self._stem(audio, filename, stem)

    @modal.method()
    def sync(self, audio: bytes, lines: list[str], filename: str = "song.mp3", separate: bool = True,
             forced: bool = True, refine: bool = True) -> dict:
        """Python entry point (used by test_demo.py for the comparisons)."""
        return self._run(audio, filename, lines, separate, forced, refine)

    @modal.asgi_app()
    def web(self):
        from fastapi import FastAPI, File, Form, Header, HTTPException, Response, UploadFile
        from fastapi.middleware.cors import CORSMiddleware

        api = FastAPI(title="Wave Music sync")
        # the app is a static page opened from anywhere (file://, previews)
        api.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["POST", "GET"], allow_headers=["*"])

        @api.get("/")
        def health():
            return {"ok": True, "service": APP_NAME, "auth": bool(os.environ.get("WAVE_SYNC_TOKEN"))}

        @api.post("/")
        async def sync(
            audio: UploadFile = File(...),
            lyrics: str = Form(...),
            language: str = Form("es"),
            authorization: str = Header(""),
        ):
            token = os.environ.get("WAVE_SYNC_TOKEN")
            if token and authorization != f"Bearer {token}":
                raise HTTPException(401, "Token inválido")
            if language != self.pipe.language:
                raise HTTPException(400, f"Idioma no soportado todavía: {language}")
            lines = [l.strip() for l in lyrics.splitlines() if l.strip()]
            if not lines:
                raise HTTPException(400, "Falta la letra")
            data = await audio.read()
            if not data:
                raise HTTPException(400, "Falta el audio")
            if len(data) > MAX_BYTES:
                raise HTTPException(413, "El audio pesa más de 60 MB")
            try:
                return self._run(data, audio.filename, lines)
            except Exception as e:  # noqa: BLE001
                raise HTTPException(500, f"No se pudo sincronizar: {e}") from e

        @api.post("/transcribe")
        async def transcribe(audio: UploadFile = File(...), authorization: str = Header("")):
            token = os.environ.get("WAVE_SYNC_TOKEN")
            if token and authorization != f"Bearer {token}":
                raise HTTPException(401, "Token inválido")
            data = await audio.read()
            if not data:
                raise HTTPException(400, "Falta el audio")
            if len(data) > MAX_BYTES:
                raise HTTPException(413, "El audio pesa más de 60 MB")
            try:
                return self._speech(data, audio.filename)
            except Exception as e:  # noqa: BLE001
                raise HTTPException(500, f"No se pudo transcribir: {e}") from e

        @api.post("/stems")
        async def stems(
            audio: UploadFile = File(...),
            stem: str = Form("instrumental"),
            authorization: str = Header(""),
        ):
            token = os.environ.get("WAVE_SYNC_TOKEN")
            if token and authorization != f"Bearer {token}":
                raise HTTPException(401, "Token inválido")
            if stem not in ("instrumental", "vocals"):
                raise HTTPException(400, "stem tiene que ser instrumental o vocals")
            data = await audio.read()
            if not data:
                raise HTTPException(400, "Falta el audio")
            if len(data) > MAX_BYTES:
                raise HTTPException(413, "El audio pesa más de 60 MB")
            try:
                mp3 = self._stem(data, audio.filename, stem)
            except Exception as e:  # noqa: BLE001
                raise HTTPException(500, f"No se pudo separar la voz: {e}") from e
            return Response(content=mp3, media_type="audio/mpeg")

        return api
