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

// New wallpaper format, continuing from LyricSync18Alt/19Alt/20/21/22.
const BACKGROUND_SRC = staticFile("/fake-chat/background-alt.png");

// User-supplied lines, exact wording — transcribed word-by-word from
// the user's twenty-third uploaded clip with faster-whisper (small
// model, word_timestamps=True, biased with an initial_prompt built
// from these same 16 lines, incl. the repeated closing line twice).
// All 16 matched the transcript in full — the forward-cursor difflib
// matching correctly resolved the repeated "Mucho más fuerte sin tu
// amor" to two distinct later occurrences (23.04s and 57.0s).
// Seconds -> frames at 30fps (the project's own fps), rounded to the
// nearest frame:
//   "No razonar"                              0.00s ->    0
//   "Desaparecer"                              2.40s ->   72
//   "Cuando tenías que estar"                  6.22s ->  187
//   "Te echaste a correr"                      9.64s ->  289
//   "Lo que hiciste en mí"                    13.66s ->  410
//   "No tiene perdón"                         15.92s ->  478
//   "Y yo sé que me siento"                   20.10s ->  603
//   "Mucho más fuerte sin tu amor" (1st)      23.04s ->  691
//   "Mucho tiempo atrás"                      34.08s -> 1022
//   "Me hiciste sentir"                       36.60s -> 1098
//   "Que nuestro amor era más"                40.20s -> 1206
//   "Y de esa forma viví"                     44.26s -> 1328
//   "No sé más quién soy"                     47.28s -> 1418
//   "¿De qué te reís?"                        49.96s -> 1499
//   "Y ahora sé que me siento"                53.34s -> 1600
//   "Mucho más fuerte sin tu amor" (2nd)      57.00s -> 1710
//
// No burn/delete effect — plain conversation, 16 lines. Uses
// AutoScrollChatLog with the shared lyric-sync layout defaults (locked
// in after Scene9).
export const BUBBLES: DarkBubble[] = [
  { from: "me", text: "No razonar", timestamp: "14:20", atFrame: 0 },
  { from: "me", text: "Desaparecer", timestamp: "14:20", atFrame: 72 },
  { from: "me", text: "Cuando tenías que estar", timestamp: "14:21", atFrame: 187 },
  { from: "me", text: "Te echaste a correr", timestamp: "14:21", atFrame: 289 },
  { from: "me", text: "Lo que hiciste en mí", timestamp: "14:22", atFrame: 410 },
  { from: "me", text: "No tiene perdón", timestamp: "14:22", atFrame: 478 },
  { from: "me", text: "Y yo sé que me siento", timestamp: "14:23", atFrame: 603 },
  { from: "me", text: "Mucho más fuerte sin tu amor", timestamp: "14:23", atFrame: 691 },
  { from: "me", text: "Mucho tiempo atrás", timestamp: "14:24", atFrame: 1022 },
  { from: "me", text: "Me hiciste sentir", timestamp: "14:24", atFrame: 1098 },
  { from: "me", text: "Que nuestro amor era más", timestamp: "14:25", atFrame: 1206 },
  { from: "me", text: "Y de esa forma viví", timestamp: "14:25", atFrame: 1328 },
  { from: "me", text: "No sé más quién soy", timestamp: "14:26", atFrame: 1418 },
  { from: "me", text: "¿De qué te reís?", timestamp: "14:26", atFrame: 1499 },
  { from: "me", text: "Y ahora sé que me siento", timestamp: "14:27", atFrame: 1600 },
  { from: "me", text: "Mucho más fuerte sin tu amor", timestamp: "14:27", atFrame: 1710 },
];

// Last bubble's entrance settles ~15-20 frames after its atFrame. This
// scene uses a fixed total duration (source clip length + 5s) set in
// LyricSync23.tsx, not the standard hold-based default.
export const LYRIC_SYNC_23_LAST_FRAME = 1710;

export const LyricSyncScene23: React.FC = () => {
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
