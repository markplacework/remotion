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

// New wallpaper format, continuing from LyricSync18Alt/19Alt/20-33.
const BACKGROUND_SRC = staticFile("/fake-chat/background-alt.png");

// User-supplied lines, exact wording — transcribed word-by-word from
// the user's thirty-fourth uploaded clip with faster-whisper (small
// model, word_timestamps=True, biased with an initial_prompt built
// from these same 18 lines, incl. the repeated "Nada de nada" twice).
// 17 of 18 matched in the full-clip pass; the final repeated "Nada de
// nada" (60.46s-64.88s tail) didn't match on the first pass. Isolated
// and re-transcribed that tail on its own with "Nada de nada" as the
// bias prompt — it resolved cleanly right after the previous line
// ends, no gap — so used that timing instead of guessing or cutting.
// Seconds -> frames at 30fps (the project's own fps), rounded to the
// nearest frame:
//   "Dejaré que el tiempo cure todas las heridas"    0.00s ->    0
//   "Y aunque queme por dentro"                       5.14s ->  154
//   "Sé que voy a renacer"                            7.80s ->  234
//   "Cuando el cielo llora"                           11.70s ->  351
//   "Nunca nadie le pregunta dónde duele"             14.08s ->  422
//   "Por qué llueve, por qué deja de llover"          18.58s ->  557
//   "¿Qué es lo que pasa?"                            22.52s ->  676
//   "¡Si todavía estoy vivo!"                         25.02s ->  751
//   "¡Todavía respiro!"                               28.20s ->  846
//   "¿Cómo entregarme"                                31.88s ->  956
//   "En cada nuevo suspiro"                           33.70s -> 1011
//   "Después de ti?"                                  36.54s -> 1096
//   "Después de ti ya no hay nada"                    41.70s -> 1251
//   "Ya no queda más nada"                            45.42s -> 1363
//   "Nada de nada" (1st)                              48.50s -> 1455
//   "Después de ti es el olvido"                      52.24s -> 1567
//   "Un recuerdo perdido"                             57.84s -> 1735
//   "Nada de nada" (2nd)                              60.00s -> 1800
//
// No burn/delete effect — plain conversation, 18 lines. Uses
// AutoScrollChatLog with the shared lyric-sync layout defaults (locked
// in after Scene9).
export const BUBBLES: DarkBubble[] = [
  { from: "me", text: "Dejaré que el tiempo cure todas las heridas", timestamp: "20:04", atFrame: 0 },
  { from: "me", text: "Y aunque queme por dentro", timestamp: "20:04", atFrame: 154 },
  { from: "me", text: "Sé que voy a renacer", timestamp: "20:05", atFrame: 234 },
  { from: "me", text: "Cuando el cielo llora", timestamp: "20:05", atFrame: 351 },
  { from: "me", text: "Nunca nadie le pregunta dónde duele", timestamp: "20:06", atFrame: 422 },
  { from: "me", text: "Por qué llueve, por qué deja de llover", timestamp: "20:06", atFrame: 557 },
  { from: "me", text: "¿Qué es lo que pasa?", timestamp: "20:07", atFrame: 676 },
  { from: "me", text: "¡Si todavía estoy vivo!", timestamp: "20:07", atFrame: 751 },
  { from: "me", text: "¡Todavía respiro!", timestamp: "20:08", atFrame: 846 },
  { from: "me", text: "¿Cómo entregarme", timestamp: "20:08", atFrame: 956 },
  { from: "me", text: "En cada nuevo suspiro", timestamp: "20:09", atFrame: 1011 },
  { from: "me", text: "Después de ti?", timestamp: "20:09", atFrame: 1096 },
  { from: "me", text: "Después de ti ya no hay nada", timestamp: "20:10", atFrame: 1251 },
  { from: "me", text: "Ya no queda más nada", timestamp: "20:10", atFrame: 1363 },
  { from: "me", text: "Nada de nada", timestamp: "20:11", atFrame: 1455 },
  { from: "me", text: "Después de ti es el olvido", timestamp: "20:11", atFrame: 1567 },
  { from: "me", text: "Un recuerdo perdido", timestamp: "20:12", atFrame: 1735 },
  { from: "me", text: "Nada de nada", timestamp: "20:12", atFrame: 1800 },
];

// Last bubble's entrance settles ~15-20 frames after its atFrame — the
// composition holds a few seconds past that so the final line is
// readable before the clip ends.
export const LYRIC_SYNC_34_LAST_FRAME = 1800;

export const LyricSyncScene34: React.FC = () => {
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
