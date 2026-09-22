import { AbsoluteFill, Img, staticFile } from "remotion";
import { AutoScrollChatLog } from "../components/AutoScrollChatLog";
import type { DarkBubble } from "../components/DarkChatLog";
import {
  LYRIC_SYNC_CANVAS_TOP_MARGIN,
  LYRIC_SYNC_CANVAS_LEFT_MARGIN,
  LYRIC_SYNC_CONTENT_WIDTH,
  LYRIC_SYNC_VIEWPORT_HEIGHT,
  LYRIC_SYNC_SCALE,
} from "../lyricSyncDefaults";

// New wallpaper format, continuing from LyricSync18Alt/19Alt/20.
const BACKGROUND_SRC = staticFile("/fake-chat/background-alt.png");

// User-supplied lines, exact wording — transcribed word-by-word from
// the user's twenty-first uploaded clip with faster-whisper (small
// model, word_timestamps=True, biased with an initial_prompt built
// from all 22 lines the user gave, including the repeated second
// chorus). Only the first 14 lines matched the transcript; the clip
// (63.53s) runs out ~9.5s after "Yo camino todo y veo" (54.02s), which
// is nowhere near enough time to fit the remaining 8 lines at the
// song's established pace (the first chorus took ~24s for 6 similar
// lines). Verified by isolating and re-transcribing that tail segment
// with a prompt biased toward the missing lines — it still didn't
// produce anything resembling the full remaining lyrics, and confirmed
// there IS real audio there (mean volume -28.6dB vs -24.8dB overall,
// not silence), just not a clean second chorus repeat within this
// clip's length. So the video was cut after line 14 rather than
// guessing timestamps for the rest.
// Seconds -> frames at 30fps (the project's own fps), rounded to the
// nearest frame:
//   "Muerdo del anzuelo, y vuelvo"              0.00s ->    0
//   "A empezar de nuevo, cada vez"               4.44s ->  133
//   "Tengo en la mano, la carta"                10.00s ->  300
//   "Para jugar el juego"                       14.34s ->  430
//   "Cuando quieras"                            17.66s ->  530
//   "Caminando, caminándote"                    20.28s ->  608
//   "Mi calle que quizás"                       24.12s ->  724
//   "Yo pueda cambiar"                          28.68s ->  860
//   "Esperando, esperándote"                    35.02s -> 1051
//   "Costumbres argentinas de"                  37.82s -> 1135
//   "Decir, \"no\""                              41.42s -> 1243
//   "El problema es otra vez la situación"      44.02s -> 1321
//   "Cada vez peor del corazón"                 48.84s -> 1465
//   "Yo camino todo y veo"                      54.02s -> 1621
//
// No burn/delete effect — plain conversation. Uses AutoScrollChatLog
// with the shared lyric-sync layout defaults (locked in after Scene9).
export const BUBBLES: DarkBubble[] = [
  { from: "me", text: "Muerdo del anzuelo, y vuelvo", timestamp: "16:03", atFrame: 0 },
  { from: "me", text: "A empezar de nuevo, cada vez", timestamp: "16:03", atFrame: 133 },
  { from: "me", text: "Tengo en la mano, la carta", timestamp: "16:04", atFrame: 300 },
  { from: "me", text: "Para jugar el juego", timestamp: "16:04", atFrame: 430 },
  { from: "me", text: "Cuando quieras", timestamp: "16:05", atFrame: 530 },
  { from: "me", text: "Caminando, caminándote", timestamp: "16:05", atFrame: 608 },
  { from: "me", text: "Mi calle que quizás", timestamp: "16:06", atFrame: 724 },
  { from: "me", text: "Yo pueda cambiar", timestamp: "16:06", atFrame: 860 },
  { from: "me", text: "Esperando, esperándote", timestamp: "16:07", atFrame: 1051 },
  { from: "me", text: "Costumbres argentinas de", timestamp: "16:07", atFrame: 1135 },
  { from: "me", text: "Decir, \"no\"", timestamp: "16:08", atFrame: 1243 },
  { from: "me", text: "El problema es otra vez la situación", timestamp: "16:08", atFrame: 1321 },
  { from: "me", text: "Cada vez peor del corazón", timestamp: "16:09", atFrame: 1465 },
  { from: "me", text: "Yo camino todo y veo", timestamp: "16:09", atFrame: 1621 },
];

// Last bubble's entrance settles ~15-20 frames after its atFrame — the
// composition holds a few seconds past that so the final line is
// readable before the clip ends.
export const LYRIC_SYNC_21_LAST_FRAME = 1621;

export const LyricSyncScene21: React.FC = () => {
  return (
    <AbsoluteFill>
      <Img
        src={BACKGROUND_SRC}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
      <AbsoluteFill
        style={{
          alignItems: "flex-start",
          justifyContent: "flex-start",
          paddingTop: LYRIC_SYNC_CANVAS_TOP_MARGIN,
          paddingLeft: LYRIC_SYNC_CANVAS_LEFT_MARGIN,
        }}
      >
        <div style={{ transform: `scale(${LYRIC_SYNC_SCALE})`, transformOrigin: "top left" }}>
          <AutoScrollChatLog
            bubbles={BUBBLES}
            viewportHeight={LYRIC_SYNC_VIEWPORT_HEIGHT}
            width={LYRIC_SYNC_CONTENT_WIDTH}
            dateLabel="Hoy"
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
