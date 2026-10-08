"""Compare sync methods on the demo song.

    # on Modal (after `modal deploy app.py`), GPU:
    modal run services/wave-music-sync/test_demo.py

    # locally on CPU, same pipeline code (slow, no Modal needed):
    python services/wave-music-sync/test_demo.py --local [--demucs-repo DIR] [--model large-v3]

Three methods, same lyrics and song (public/fake-chat/song.mp3):
  demo           the hand-checked times stored in public/wave-music/js/demo.js
  whisper solo   Whisper on the full mix + fuzzy lyric match (what the
                 OpenAI provider does today, with open Whisper weights)
  modal          Demucs vocals + Whisper window + WhisperX forced alignment
Also prints, per line, the vocal onset measured from the Demucs vocals'
loudness, as a reference that doesn't come from any Whisper model.
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SONG = ROOT / "public/fake-chat/song.mp3"
DEMO_JS = ROOT / "public/wave-music/js/demo.js"


def demo_data():
    src = DEMO_JS.read_text()
    lines = re.findall(r'^\s*"(.*)",\s*$', src.split("lyrics: [", 1)[1].split("]", 1)[0], re.M)
    starts = json.loads(re.search(r"starts: (\[[^\]]*\])", src).group(1))
    return lines, starts


def vocal_onsets(vocals, starts_hint, sr=16000):
    """First moment the isolated vocal gets loud, searched from 1.5 s before
    each hinted line start (but after the previous line's hint)."""
    import numpy as np

    hop = int(sr * 0.01)
    rms = np.sqrt(np.convolve(vocals ** 2, np.ones(hop * 3) / (hop * 3), "same"))[::hop]
    db = 20 * np.log10(rms + 1e-6)
    thr = np.percentile(db, 90) - 20
    out = []
    for i, h in enumerate(starts_hint):
        lo = max(0.0, h - 1.5, (starts_hint[i - 1] + 0.5) if i else 0.0)
        hi = h + 1.5
        seg = db[int(lo * 100):int(hi * 100)]
        k = next((k for k, v in enumerate(seg) if v > thr), None)
        out.append(round(lo + k / 100, 2) if k is not None else None)
    return out


def report(lines, demo, whisper, modal, onsets):
    def f(x):
        return "  —  " if x is None else f"{x:6.2f}"

    print("\nLine starts (s)")
    print(f"{'#':>2}  {'demo':>6} {'whisper':>7} {'modal':>6} {'onset':>6}  line")
    for i, l in enumerate(lines):
        print(f"{i + 1:>2}  {f(demo[i])} {f(whisper['starts'][i]):>7} {f(modal['starts'][i])} {f(onsets[i])}  {l}")

    def mae(a, b):
        pairs = [(x, y) for x, y in zip(a, b) if x is not None and y is not None]
        return sum(abs(x - y) for x, y in pairs) / len(pairs) if pairs else float("nan")

    print("\nMean |difference| vs vocal onset:")
    for name, st in (("demo", demo), ("whisper solo", whisper["starts"]), ("modal", modal["starts"])):
        print(f"  {name:13s} {mae(st, onsets):.2f} s")
    print(f"\nWords timed: whisper solo {whisper['matched']}/{whisper['total']}, modal {modal['matched']}/{modal['total']}")

    print("\nWord times, modal (absolute s):")
    for i, w in enumerate(modal["words"]):
        s = modal["starts"][i]
        print("  " + "  ".join(f"{x['text']}@{s + x['d0']:.2f}-{s + x['d1']:.2f}" for x in w["words"]))
    print("\nWord times, whisper solo (absolute s):")
    for i, w in enumerate(whisper["words"]):
        s = whisper["starts"][i]
        print("  " + "  ".join(f"{x['text']}@{s + x['d0']:.2f}-{s + x['d1']:.2f}" for x in w["words"]))


def run_local(argv):
    import argparse

    sys.path.insert(0, str(Path(__file__).parent))
    from pipeline import Pipeline

    ap = argparse.ArgumentParser()
    ap.add_argument("--local", action="store_true")
    ap.add_argument("--demucs-repo")
    ap.add_argument("--model", default="large-v3")
    ap.add_argument("--out", default="")
    a = ap.parse_args(argv)
    lines, demo = demo_data()
    p = Pipeline(device="cpu", whisper_model=a.model, demucs_repo=a.demucs_repo)
    whisper = p.run(str(SONG), lines, separate=False, forced=False)
    modal = p.run(str(SONG), lines)
    onsets = vocal_onsets(p.vocals(str(SONG)), demo)
    report(lines, demo, whisper, modal, onsets)
    if a.out:
        Path(a.out).write_text(json.dumps({"demo": demo, "whisper": whisper, "modal": modal, "onsets": onsets}, indent=1))


if __name__ == "__main__":
    run_local(sys.argv[1:])
else:
    # `modal run test_demo.py`: call the deployed GPU class
    import modal

    app = modal.App("wave-music-sync-test")

    @app.local_entrypoint()
    def main():
        lines, demo = demo_data()
        Syncer = modal.Cls.from_name("wave-music-sync", "Syncer")
        audio = SONG.read_bytes()
        s = Syncer()
        whisper = s.sync.remote(audio, lines, separate=False, forced=False)
        modal_r = s.sync.remote(audio, lines)
        # the loudness reference needs local vocals; run --local for it
        report(lines, demo, whisper, modal_r, [None] * len(lines))
