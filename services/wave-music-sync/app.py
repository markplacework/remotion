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

Free stock media (Pixabay), on a small CPU container of its own
(builder-ai92--wave-music-sync-media.modal.run):

GET /search?q=...&kind=video|photo&page=1
    answers { items: [{ id, kind, thumb, src, w, h, duration, user, page }],
    total }. Results are cached for 24 h, as Pixabay asks.
GET /sample/<style>.mp4
    the sample background picked for each style (Pixabay clips, cropped
    to 540x960, in the "wave-samples" volume). No token: they are public.
POST /comments (image?, lyrics, title, artist)
    viewer comments for the Live / Stream styles, written by OpenAI
    (gpt-4o-mini) from one frame of the background and the lyrics:
    { comments: [{ name, msg }] }. Key in the Modal secret "openai".
GET /file?url=...
    streams a Pixabay file back with CORS headers, so the app can use it as
    a background (and record it) like an uploaded file.
The Pixabay key lives in the Modal secret "PIXEBAY".

The endpoints require `Authorization: Bearer <token>`. The token lives in
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


# ---------------------------------------------------------------------------
# Free stock media: Pixabay search, behind our token (CPU only, no GPU)
# ---------------------------------------------------------------------------
media_image = modal.Image.debian_slim(python_version="3.11").pip_install("fastapi[standard]==0.115.6", "httpx==0.28.1", "python-multipart==0.0.20")
media_cache = modal.Dict.from_name("wave-pixabay-cache", create_if_missing=True)
samples = modal.Volume.from_name("wave-samples", create_if_missing=True)
CACHE_SECONDS = 24 * 3600
PIXABAY_HOSTS = ("pixabay.com", "cdn.pixabay.com")


def _pixabay_key() -> str:
    # the secret's variable name is whatever was typed in the dashboard
    for k, v in os.environ.items():
        if ("PIXABAY" in k.upper() or "PIXEBAY" in k.upper()) and v:
            return v
    raise RuntimeError("Falta la clave de Pixabay")


def _items(kind: str, hits: list) -> list:
    out = []
    for h in hits:
        if kind == "video":
            v = h.get("videos", {})
            # ~960 px is plenty behind lyrics and loads fast; fall back to whatever exists
            pick = next((v[q] for q in ("small", "medium", "tiny", "large") if v.get(q, {}).get("url")), None)
            if not pick:
                continue
            out.append({
                "id": h["id"], "kind": "video", "thumb": pick.get("thumbnail") or v.get("tiny", {}).get("thumbnail", ""),
                "src": pick["url"], "w": pick.get("width", 0), "h": pick.get("height", 0),
                "duration": h.get("duration", 0), "user": h.get("user", ""), "page": h.get("pageURL", ""),
            })
        else:
            out.append({
                "id": h["id"], "kind": "photo", "thumb": h.get("webformatURL", ""), "src": h.get("largeImageURL") or h.get("webformatURL", ""),
                "w": h.get("imageWidth", 0), "h": h.get("imageHeight", 0), "duration": 0,
                "user": h.get("user", ""), "page": h.get("pageURL", ""),
            })
    # vertical first: they fill a 9:16 frame without cropping
    out.sort(key=lambda it: 0 if it["h"] > it["w"] else 1)
    return out


@app.function(image=media_image, secrets=[*secrets, modal.Secret.from_name("PIXEBAY"), modal.Secret.from_name("openai")], volumes={"/samples": samples}, scaledown_window=900, timeout=120)
@modal.concurrent(max_inputs=20)
@modal.asgi_app()
def media():
    import time
    from urllib.parse import urlparse

    import httpx
    from fastapi import FastAPI, File, Form, Header, HTTPException, Query, Response, UploadFile
    from fastapi.middleware.cors import CORSMiddleware

    api = FastAPI(title="Wave Studio media")
    api.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["GET", "POST"], allow_headers=["*"])

    def check(authorization: str):
        token = os.environ.get("WAVE_SYNC_TOKEN")
        if token and authorization != f"Bearer {token}":
            raise HTTPException(401, "Token inválido")

    @api.get("/")
    def health():
        return {"ok": True, "service": "wave-media"}

    @api.post("/comments")
    async def comments(
        image: UploadFile | None = File(None),
        lyrics: str = Form(""),
        title: str = Form(""),
        artist: str = Form(""),
        authorization: str = Header(""),
    ):
        import base64
        import json

        check(authorization)
        key = next((v for k, v in os.environ.items() if "OPENAI" in k.upper() and v), "")
        if not key:
            raise HTTPException(503, "Falta la clave de OpenAI")
        prompt = (
            "Sos el chat de un video en vivo de TikTok donde suena una canción. Escribí 18 comentarios "
            "cortos y naturales de espectadores argentinos/latinos (máx. 8 palabras, informales, algunos con un emoji). "
            "Mezclá: comentarios sobre lo que se ve en la imagen (el lugar, el paisaje, la situación; si es un lugar, "
            "alguno pregunta dónde es), comentarios sobre la canción (que es un temazo, que la aman, citando una frase "
            "corta de la letra entre «»), y saludos o reacciones del público. Sin insultos, sin datos personales, "
            "sin nombres de marcas. Nombres de usuario inventados estilo redes (minúsculas, puntos o guiones bajos). "
            'Respondé solo JSON: {"comments":[{"name":"...","msg":"..."}]}.\n\n'
            f"Canción: {title or 'sin título'} · {artist or 'artista'}\nLetra:\n{lyrics[:2500] or '(sin letra)'}"
        )
        content = [{"type": "text", "text": prompt}]
        if image is not None:
            data = await image.read()
            if data and len(data) < 4 * 1024 * 1024:
                content.append({"type": "image_url", "image_url": {"url": "data:image/jpeg;base64," + base64.b64encode(data).decode(), "detail": "low"}})
        r = httpx.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {key}"},
            json={"model": "gpt-4o-mini", "messages": [{"role": "user", "content": content}], "response_format": {"type": "json_object"}, "temperature": 0.9, "max_tokens": 900},
            timeout=60,
        )
        if r.status_code == 401:
            raise HTTPException(502, "La clave de OpenAI no es válida")
        if r.status_code == 429:
            raise HTTPException(429, "OpenAI está saturado o sin crédito, probá en un rato")
        if r.status_code != 200:
            raise HTTPException(502, f"OpenAI respondió {r.status_code}")
        try:
            out = json.loads(r.json()["choices"][0]["message"]["content"])
            items = [{"name": str(c.get("name", ""))[:18], "msg": str(c.get("msg", ""))[:60]} for c in out.get("comments", []) if c.get("msg")]
        except Exception as e:  # noqa: BLE001
            raise HTTPException(502, "La IA devolvió algo inesperado") from e
        return {"comments": items[:24]}

    @api.get("/sample/{name}")
    def sample(name: str):
        import re

        from fastapi.responses import FileResponse

        m = re.fullmatch(r"([a-z]{2,20})\.mp4", name)
        path = f"/samples/{m.group(1)}.mp4" if m else ""
        if not path or not os.path.exists(path):
            raise HTTPException(404, "No hay video de ejemplo para ese estilo")
        return FileResponse(path, media_type="video/mp4", headers={"Cache-Control": "public, max-age=86400"})

    @api.get("/search")
    def search(q: str = Query("", max_length=100), kind: str = "video", page: int = 1, authorization: str = Header("")):
        check(authorization)
        if kind not in ("video", "photo"):
            raise HTTPException(400, "kind tiene que ser video o photo")
        q = q.strip().lower()
        page = max(1, min(page, 10))
        ck = f"{kind}|{q}|{page}|60"
        hit = media_cache.get(ck)
        if hit and time.time() - hit["at"] < CACHE_SECONDS:
            return hit["data"]
        params = {"key": _pixabay_key(), "q": q, "page": page, "per_page": 60, "safesearch": "true", "lang": "es"}
        if kind == "photo":
            params.update(image_type="photo", orientation="vertical")
            url = "https://pixabay.com/api/"
        else:
            url = "https://pixabay.com/api/videos/"
        r = httpx.get(url, params=params, timeout=20)
        if r.status_code == 429:
            raise HTTPException(429, "Demasiadas búsquedas, probá en un minuto")
        if r.status_code != 200:
            raise HTTPException(502, f"Pixabay respondió {r.status_code}")
        body = r.json()
        data = {"items": _items(kind, body.get("hits", [])), "total": body.get("totalHits", 0)}
        media_cache[ck] = {"at": time.time(), "data": data}
        return data

    @api.get("/file")
    def file(url: str, authorization: str = Header("")):
        check(authorization)
        host = urlparse(url).hostname or ""
        if urlparse(url).scheme != "https" or not any(host == h or host.endswith("." + h) for h in PIXABAY_HOSTS):
            raise HTTPException(400, "Solo archivos de Pixabay")
        r = httpx.get(url, timeout=60, follow_redirects=True)
        if r.status_code != 200:
            raise HTTPException(502, f"No se pudo bajar el archivo ({r.status_code})")
        if len(r.content) > 80 * 1024 * 1024:
            raise HTTPException(413, "El archivo es demasiado grande")
        return Response(content=r.content, media_type=r.headers.get("content-type", "application/octet-stream"),
                        headers={"Cache-Control": "public, max-age=86400"})

    return api
