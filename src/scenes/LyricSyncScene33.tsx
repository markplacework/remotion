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

// New wallpaper format, continuing from LyricSync18Alt/19Alt/20-32.
const BACKGROUND_SRC = staticFile("/fake-chat/background-alt.png");

// User-supplied lines, exact wording — transcribed word-by-word from
// the user's thirty-third uploaded clip with faster-whisper (small
// model, word_timestamps=True, biased with an initial_prompt built
// from these same 11 lines). All 11 matched the transcript in full,
// with the forward-only cursor correctly resolving the repeated "para
// volverte a ver." to its own later position. The song continues past
// the last given line ("Te quiero, no me preguntes por qué, puedo
// dejar muchas cosas para volverte a ver." repeated twice) — not part
// of the lines the user gave, so no extra bubbles were added for it.
// Seconds -> frames at 30fps (the project's own fps), rounded to the
// nearest frame:
//   "No me arrepiento"                     0.00s ->    0
//   "de haber venido hasta acá,"            1.58s ->   47
//   "de haber viajado una hora"             5.40s ->  162
//   "para volverte a ver." (1st)            8.44s ->  253
//   "Y si estoy solo,"                     13.20s ->  396
//   "voy escuchando tu voz,"                16.24s ->  487
//   "puedo dejar muchas cosas"              19.50s ->  585
//   "para volverte a ver." (2nd)           22.26s ->  668
//   "Y cuando llega la noche"              27.92s ->  838
//   "me late el corazón,"                  31.34s ->  940
//   "y cuando llega esa noche..."          34.32s -> 1030
//
// No burn/delete effect — plain conversation, 11 lines. Uses
// AutoScrollChatLog with the shared lyric-sync layout defaults (locked
// in after Scene9).
export const BUBBLES: DarkBubble[] = [
  { from: "me", text: "No me arrepiento", timestamp: "22:08", atFrame: 0 },
  { from: "me", text: "de haber venido hasta acá,", timestamp: "22:08", atFrame: 47 },
  { from: "me", text: "de haber viajado una hora", timestamp: "22:09", atFrame: 162 },
  { from: "me", text: "para volverte a ver.", timestamp: "22:09", atFrame: 253 },
  { from: "me", text: "Y si estoy solo,", timestamp: "22:10", atFrame: 396 },
  { from: "me", text: "voy escuchando tu voz,", timestamp: "22:10", atFrame: 487 },
  { from: "me", text: "puedo dejar muchas cosas", timestamp: "22:11", atFrame: 585 },
  { from: "me", text: "para volverte a ver.", timestamp: "22:11", atFrame: 668 },
  { from: "me", text: "Y cuando llega la noche", timestamp: "22:12", atFrame: 838 },
  { from: "me", text: "me late el corazón,", timestamp: "22:12", atFrame: 940 },
  { from: "me", text: "y cuando llega esa noche...", timestamp: "22:13", atFrame: 1030 },
];

// Last bubble's entrance settles ~15-20 frames after its atFrame — the
// composition holds a few seconds past that so the final line is
// readable before the clip ends.
export const LYRIC_SYNC_33_LAST_FRAME = 1030;

export const LyricSyncScene33: React.FC = () => {
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
