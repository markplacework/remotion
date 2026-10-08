"""Wave Music · precise lyric sync.

Given a song and its known lyrics, returns when each line and each word
is sung, in the format the Wave Music app already uses:

    { "starts": [line start, ...],
      "words":  [{ "text": line, "words": [{ "text", "d0", "d1" }] }],   # d0/d1 relative to the line start
      "matched": int, "total": int }

Steps:
  1. Demucs (htdemucs) isolates the vocals, so drums and guitars stop
     confusing the speech models.
  2. Whisper (via WhisperX) transcribes the vocals. Its words are only
     used to find roughly where each lyric line is sung (fuzzy, monotonic
     match against the lyrics, same idea as js/ai-sync.js).
  3. WhisperX forced alignment (wav2vec2, Spanish by default) places the
     *known* lyric text, line by line, inside that window. That gives
     word boundaries from the audio itself instead of Whisper's guesses,
     which drift a lot on held notes.

Pure Python with no Modal imports, so it runs the same on a Modal GPU
(app.py) or on a laptop CPU (test_demo.py).
"""

from __future__ import annotations

import dataclasses
import re
import subprocess
import unicodedata

import numpy as np

ASR_SR = 16000


# ---------- audio ----------
def load_audio(path: str, sr: int, channels: int) -> np.ndarray:
    """Decode any format ffmpeg reads into float32 [channels, samples]."""
    out = subprocess.run(
        ["ffmpeg", "-nostdin", "-v", "error", "-i", path, "-f", "f32le", "-ac", str(channels), "-ar", str(sr), "-"],
        capture_output=True,
        check=True,
    ).stdout
    return np.frombuffer(out, np.float32).reshape(-1, channels).T.copy()


# ---------- text matching (port of js/ai-sync.js) ----------
def norm(s: str) -> str:
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if not unicodedata.combining(c) or c == "̃")
    s = unicodedata.normalize("NFC", s)
    return re.sub(r"[^a-z0-9ñ]", "", s)


def _lev(a: str, b: str) -> int:
    if not a or not b:
        return max(len(a), len(b))
    prev = list(range(len(b) + 1))
    for i in range(1, len(a) + 1):
        cur = [i]
        for j in range(1, len(b) + 1):
            cur.append(min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] != b[j - 1])))
        prev = cur
    return prev[-1]


def sim(a: str, b: str) -> float:
    return 1.0 if a == b else 1 - _lev(a, b) / max(len(a), len(b), 1)


def match_words(lyric: list[str], sung: list[str]) -> list[int | None]:
    """Monotonic fuzzy alignment: for each lyric word, the index of the sung
    word it matches (or None). Skipping a sung word (ad-libs, repeats) is
    cheap; leaving a lyric word unmatched costs more."""
    n, m = len(lyric), len(sung)
    GAP_L, GAP_T = 1.0, 0.55
    cost = np.zeros((n + 1, m + 1), np.float32)
    move = np.zeros((n + 1, m + 1), np.uint8)  # 1 diag, 2 skip lyric, 3 skip sung
    cost[1:, 0] = np.arange(1, n + 1) * GAP_L
    move[1:, 0] = 2
    cost[0, 1:] = np.arange(1, m + 1) * GAP_T
    move[0, 1:] = 3
    S = np.array([[sim(a, b) for b in sung] for a in lyric], np.float32).reshape(n, m)
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            s = S[i - 1, j - 1]
            d = cost[i - 1, j - 1] + (1 - s if s >= 0.5 else 1.6)
            u = cost[i - 1, j] + GAP_L
            l = cost[i, j - 1] + GAP_T
            cost[i, j], move[i, j] = min((d, 1), (u, 2), (l, 3))
    out: list[int | None] = [None] * n
    i, j = n, m
    while i > 0 or j > 0:
        mv = move[i, j]
        if mv == 1:
            if S[i - 1, j - 1] >= 0.5:
                out[i - 1] = j - 1
            i, j = i - 1, j - 1
        elif mv == 2:
            i -= 1
        else:
            j -= 1
    return out


def _fill(values: list[float | None], lo: float, hi: float) -> list[float]:
    """Linear interpolation over None gaps, anchored at lo/hi at the ends."""
    out = list(values)
    k = 0
    while k < len(out):
        if out[k] is not None:
            k += 1
            continue
        a = k - 1
        b = k
        while b < len(out) and out[b] is None:
            b += 1
        ta = out[a] if a >= 0 else lo
        tb = out[b] if b < len(out) else hi
        for q in range(a + 1, b):
            out[q] = ta + (tb - ta) * (q - a) / (b - a)
        k = b
    return out  # type: ignore[return-value]


# ---------- pipeline ----------
@dataclasses.dataclass
class Options:
    language: str = "es"
    whisper_model: str = "large-v3"
    separate: bool = True  # Demucs on/off (off = "Whisper solo" comparison)
    forced: bool = True  # forced alignment on/off


class Pipeline:
    def __init__(self, device: str = "cuda", whisper_model: str = "large-v3", demucs_repo: str | None = None,
                 language: str = "es", compute_type: str | None = None):
        import torch
        import whisperx
        from demucs.pretrained import get_model

        self.device = device
        self.language = language
        # htdemucs is a single model; its signature is 955717e8
        if demucs_repo:
            from pathlib import Path

            self.demucs = get_model("955717e8", repo=Path(demucs_repo))
        else:
            self.demucs = get_model("htdemucs")
        self.demucs.eval()
        compute_type = compute_type or ("float16" if device == "cuda" else "int8")
        self.asr = whisperx.load_model(whisper_model, device, compute_type=compute_type, language=language)
        self.align_model, self.align_meta = whisperx.load_align_model(language_code=language, device=device)
        self._torch = torch
        self._wx = whisperx

    # 1. vocals
    def vocals(self, path: str) -> np.ndarray:
        import torch
        import torchaudio.functional as AF
        from demucs.apply import apply_model

        sr = self.demucs.samplerate
        wav = torch.from_numpy(load_audio(path, sr, 2))
        ref = wav.mean(0)
        mu, sd = ref.mean(), ref.std() + 1e-8
        with torch.no_grad():
            src = apply_model(self.demucs, ((wav - mu) / sd)[None], device=self.device, split=True, overlap=0.25,
                              progress=False)[0]
        voc = (src[self.demucs.sources.index("vocals")] * sd + mu).mean(0)
        return AF.resample(voc.cpu(), sr, ASR_SR).numpy().astype(np.float32)

    # 2. rough word times from Whisper
    def transcribe(self, audio: np.ndarray, prompt: str) -> list[dict]:
        opts = self.asr.options
        try:
            self.asr.options = dataclasses.replace(opts, initial_prompt=prompt[:600])
        except TypeError:  # older faster-whisper: NamedTuple options
            self.asr.options = opts._replace(initial_prompt=prompt[:600])
        try:
            res = self.asr.transcribe(audio, batch_size=16, language=self.language)
        finally:
            self.asr.options = opts
        segs = [s for s in res["segments"] if s.get("text", "").strip()]
        if not segs:
            return []
        al = self._wx.align(segs, self.align_model, self.align_meta, audio, self.device, return_char_alignments=False)
        words = []
        for s in al["segments"]:
            for w in s.get("words", []):
                if "start" in w and norm(w["word"]):
                    words.append({"text": w["word"], "start": float(w["start"]), "end": float(w["end"])})
        return words

    # 3. forced alignment of the known lyrics, line by line
    def force(self, audio: np.ndarray, line_words: list[list[str]], windows: list[tuple[float, float]]):
        out = []
        for ws, (a, b) in zip(line_words, windows):
            if not ws or b - a < 0.2:
                out.append([None] * len(ws))
                continue
            seg = [{"text": " ".join(ws), "start": a, "end": b}]
            try:
                al = self._wx.align(seg, self.align_model, self.align_meta, audio, self.device,
                                    return_char_alignments=False)
                got = [w for s in al["segments"] for w in s.get("words", [])]
            except Exception:  # noqa: BLE001 - one odd line must not kill the song
                got = []
            if len(got) != len(ws):
                out.append([None] * len(ws))
                continue
            out.append([(float(w["start"]), float(w["end"])) if "start" in w else None for w in got])
        return out

    def run(self, path: str, lines: list[str], separate: bool = True, forced: bool = True) -> dict:
        lines = [re.sub(r"\s+", " ", l).strip() for l in lines]
        line_words = [l.split(" ") if l else [] for l in lines]
        flat = [(li, w) for li, ws in enumerate(line_words) for w in ws]

        audio = self.vocals(path) if separate else load_audio(path, ASR_SR, 1)[0]
        duration = len(audio) / ASR_SR
        sung = self.transcribe(audio, " ".join(lines))

        # rough per-word times from the transcript match
        hit = match_words([norm(w) for _, w in flat], [norm(w["text"]) for w in sung]) if sung else [None] * len(flat)
        rough: list[list[tuple[float, float] | None]] = [[None] * len(ws) for ws in line_words]
        k = 0
        for li, ws in enumerate(line_words):
            for wi in range(len(ws)):
                j = hit[k]
                if j is not None:
                    rough[li][wi] = (sung[j]["start"], sung[j]["end"])
                k += 1

        # rough line spans, gaps interpolated between neighbours
        r0 = [next((t[0] for t in r if t), None) for r in rough]
        r1 = [next((t[1] for t in reversed(r) if t), None) for r in rough]
        s0 = _fill(r0, 0.0, duration)
        s1 = [r1[i] if r1[i] is not None else (s0[i + 1] if i + 1 < len(s0) else duration) for i in range(len(s0))]

        times = rough
        if forced:
            # search window: the rough span plus up to 2 s of air on each
            # side, but not into the neighbouring lines' rough spans
            windows = []
            for i in range(len(lines)):
                prev_end = s1[i - 1] if i > 0 else 0.0
                next_start = s0[i + 1] if i + 1 < len(lines) else duration
                a = max(0.0, min(max(s0[i] - 2.0, prev_end - 0.2), s0[i] - 0.3))
                b = min(duration, max(min(s1[i] + 2.0, next_start + 0.2), s1[i] + 0.3))
                windows.append((a, max(b, a + 0.5)))
            fa = self.force(audio, line_words, windows)
            # keep forced times; fall back to the rough ones word by word
            times = [[f or r for f, r in zip(fl, rl)] for fl, rl in zip(fa, rough)]

        return self._format(lines, line_words, times, duration, matched=sum(t is not None for r in times for t in r))

    @staticmethod
    def _format(lines, line_words, times, duration, matched):
        # line starts: first timed word; empty lines spread between neighbours
        starts = _fill([next((t[0] for t in r if t), None) for r in times], 0.0, duration)
        for i in range(1, len(starts)):
            starts[i] = max(starts[i], starts[i - 1])

        # words in order, no word longer than 1.2 s (held notes), none under 80 ms
        last = -1.0
        clean = []
        for r in times:
            row = []
            for t in r:
                if t is None:
                    row.append(None)
                    continue
                t0 = max(t[0], last + 0.04)
                t1 = min(max(t[1], t0 + 0.08), t0 + 1.2)
                last = t0
                row.append((t0, t1))
            clean.append(row)

        words = []
        for li, (line, ws, row) in enumerate(zip(lines, line_words, clean)):
            s = starts[li]
            e = starts[li + 1] if li + 1 < len(starts) else duration
            known = list(row)
            for k in range(len(ws)):
                if known[k]:
                    continue
                a = k - 1
                while a >= 0 and not known[a]:
                    a -= 1
                b = k + 1
                while b < len(ws) and not known[b]:
                    b += 1
                ta = known[a][1] if a >= 0 else s
                tb = known[b][0] if b < len(ws) else min(e, ta + 0.4 * (b - a))
                step = (tb - ta) / (b - a)
                for q in range(a + 1, b):
                    known[q] = (ta + step * (q - a - 1), ta + step * (q - a))
            words.append({
                "text": line,
                "words": [{"text": w, "d0": round(max(0.0, t[0] - s), 3), "d1": round(max(0.05, t[1] - s), 3)}
                          for w, t in zip(ws, known)],
            })
        return {
            "starts": [round(x, 3) for x in starts],
            "words": words,
            "matched": matched,
            "total": sum(len(ws) for ws in line_words),
            "duration": round(duration, 3),
        }
