# Audio assets

All files here are already wired into `src/WapiAd.tsx` via
`src/audio/soundDesign.ts`. What's included:

- `voice-1.mp3` … `voice-5.mp3` — narration, one line per scene, Argentine
  Spanish (voseo).
- `music.mp3` — soft ambient pad, full 15s, low volume under the voice-over.
- `tick.mp3` — subtle transition tick, played just before each scene cut.
- `ding.mp3` — short confirmation chime, timed to the CTA card landing.

## How these were generated

This sandbox's network egress is locked to an allowlist (npm/pypi only) —
no access to ElevenLabs, Google/Azure TTS, or any stock-music/SFX host. So:

- **Voice-over**: synthesized locally with `espeak-ng` (`es-419` voice) and
  time-stretched with ffmpeg's `atempo` to fit each scene. It is
  understandable and reasonably paced, but it is a synthetic placeholder,
  not a natural human-sounding VO.
- **Music & SFX**: synthesized from scratch with ffmpeg's `sine` generator
  and volume-envelope expressions (no samples, so no copyright risk).

## Swapping in a real voice-over

Replace `voice-1.mp3` … `voice-5.mp3` with real recordings (or output from
ElevenLabs/Azure/Google Cloud TTS/a human VO) and redeploy — no code
changes needed as long as each file starts near its scene's `from` frame
in `src/audio/soundDesign.ts` and comfortably fits the ~2.5-3s window.
The script, in order:

1. "¿Vendés por WhatsApp?"
2. "Catálogo de productos: fácil y profesional."
3. "Pedidos ordenados, directo por WhatsApp."
4. "Arman su pedido, y vos vendés más fácil."
5. "Probá Wapi gratis, quince días."

If you'd rather keep the music/SFX and only regenerate the voice, just
touch the `voice-*.mp3` files — everything else can stay as is.
