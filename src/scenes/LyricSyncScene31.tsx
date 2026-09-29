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

// New wallpaper format, continuing from LyricSync18Alt/19Alt/20-30.
const BACKGROUND_SRC = staticFile("/fake-chat/background-alt.png");

// User-supplied lines, exact wording — transcribed word-by-word from
// the user's thirty-first uploaded clip with faster-whisper (small
// model, word_timestamps=True, biased with an initial_prompt built
// from these same 7 lines). This is a different clip of the same song
// as LyricSyncScene28 (shares the "Y por las noches..." chorus) but
// with a different opening couplet and ending. All 7 matched.
// Seconds -> frames at 30fps (the project's own fps), rounded to the
// nearest frame:
//   "El conjuro de un cuento de amor"           0.00s ->    0
//   "Quizá me atrapó, lo puedo sentir"           3.14s ->   94
//   "Y por las noches puedo sentir su calor"     9.94s ->  298
//   "Su dulce magia me hace perder la razón"    17.30s ->  519
//   "Y de mis sueños creo que un día escapó"    25.78s ->  773
//   "Para esconderse dentro de mi corazón"      32.94s ->  988
//   "Uoh-oh, no"                                42.62s -> 1279
//
// No burn/delete effect — plain conversation, 7 lines. Uses
// AutoScrollChatLog with the shared lyric-sync layout defaults (locked
// in after Scene9).
export const BUBBLES: DarkBubble[] = [
  { from: "me", text: "El conjuro de un cuento de amor", timestamp: "01:58", atFrame: 0 },
  { from: "me", text: "Quizá me atrapó, lo puedo sentir", timestamp: "01:58", atFrame: 94 },
  { from: "me", text: "Y por las noches puedo sentir su calor", timestamp: "01:59", atFrame: 298 },
  { from: "me", text: "Su dulce magia me hace perder la razón", timestamp: "01:59", atFrame: 519 },
  { from: "me", text: "Y de mis sueños creo que un día escapó", timestamp: "02:00", atFrame: 773 },
  { from: "me", text: "Para esconderse dentro de mi corazón", timestamp: "02:00", atFrame: 988 },
  { from: "me", text: "Uoh-oh, no", timestamp: "02:01", atFrame: 1279 },
];

// Last bubble's entrance settles ~15-20 frames after its atFrame — the
// composition holds a few seconds past that so the final line is
// readable before the clip ends.
export const LYRIC_SYNC_31_LAST_FRAME = 1279;

export const LyricSyncScene31: React.FC = () => {
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
