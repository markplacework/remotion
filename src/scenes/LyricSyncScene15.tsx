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

// Same real WhatsApp dark-mode wallpaper doodle used by the other
// lyric-sync scenes — generic (not song-specific), reused as-is.
const BACKGROUND_SRC = staticFile("/fake-chat/background.png");

// User-supplied lines, exact wording (incl. "habían dejado" as typed —
// the sung line actually repeats "había" singular the second time, but
// bubble text always uses the user's exact typed lyrics, never the
// raw transcript) — transcribed word-by-word from the user's fifteenth
// uploaded clip with faster-whisper (small model, word_timestamps=True,
// biased with an initial_prompt built from these same 8 lines). 7 of 8
// lines matched in full; line 3 matched its first 10 of 12 words
// (stops at "me" since the sung word there is "había" not "habían") —
// harmless, since only the line's start time is used and the next
// line still aligned correctly right after.
// Seconds -> frames at 30fps (the project's own fps), rounded to the
// nearest frame:
//   "Nunca dormí tan poco, tal vez viva demasiado"                0.00s ->    0
//   "No reconozco el punto justo donde hay que frenar"            5.58s ->  167
//   "Me preguntaba lo que había dado y lo que me habían dejado"  15.00s ->  450
//   "Me respondieron que en la vida hay que aceptar"             21.10s ->  633
//   "De cualquier modo que te toque está bien"                   30.78s ->  923
//   "De cualquier modo que te toque está mal"                    34.72s -> 1042
//   "Mejor abrir los ojos para saber"                            38.54s -> 1156
//   "Lo que te gustaría ser"                                     41.66s -> 1250
//
// No burn/delete effect — plain conversation, 8 lines. Uses
// AutoScrollChatLog with the shared lyric-sync layout defaults (locked
// in after Scene9).
export const BUBBLES: DarkBubble[] = [
  { from: "me", text: "Nunca dormí tan poco, tal vez viva demasiado", timestamp: "01:12", atFrame: 0 },
  { from: "me", text: "No reconozco el punto justo donde hay que frenar", timestamp: "01:12", atFrame: 167 },
  { from: "me", text: "Me preguntaba lo que había dado y lo que me habían dejado", timestamp: "01:13", atFrame: 450 },
  { from: "me", text: "Me respondieron que en la vida hay que aceptar", timestamp: "01:13", atFrame: 633 },
  { from: "me", text: "De cualquier modo que te toque está bien", timestamp: "01:14", atFrame: 923 },
  { from: "me", text: "De cualquier modo que te toque está mal", timestamp: "01:14", atFrame: 1042 },
  { from: "me", text: "Mejor abrir los ojos para saber", timestamp: "01:15", atFrame: 1156 },
  { from: "me", text: "Lo que te gustaría ser", timestamp: "01:15", atFrame: 1250 },
];

// Last bubble's entrance settles ~15-20 frames after its atFrame — the
// composition holds a few seconds past that so the final line is
// readable before the clip ends.
export const LYRIC_SYNC_15_LAST_FRAME = 1250;

export const LyricSyncScene15: React.FC = () => {
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
