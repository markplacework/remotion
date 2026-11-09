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

// New wallpaper format, continuing from LyricSync18Alt/19Alt/20-28.
const BACKGROUND_SRC = staticFile("/fake-chat/background-alt.png");

// User-supplied lines, exact wording (incl. the "¡bah!" exclamation
// and the "rock 'n' roll" apostrophes) — transcribed word-by-word from
// the user's twenty-ninth uploaded clip with faster-whisper (small
// model, word_timestamps=True, biased with an initial_prompt built
// from these same 7 lines). All 7 matched the transcript in full, no
// repeats, no gaps.
// Seconds -> frames at 30fps (the project's own fps), rounded to the
// nearest frame:
//   "Ella fue, por esa vez"              1.50s ->   45
//   "Mi héroe vivo, ¡bah!"                5.32s ->  160
//   "Fue mi único héroe en este lío"      9.94s ->  298
//   "La más linda del amor"              16.72s ->  502
//   "Que un tonto ha visto soñar"        19.92s ->  598
//   "Metió, metió mi rock 'n' roll"      24.10s ->  723
//   "Bajo este pulso"                    27.46s ->  824
//
// No burn/delete effect — plain conversation, 7 lines. Uses
// AutoScrollChatLog with the shared lyric-sync layout defaults (locked
// in after Scene9).
export const BUBBLES: DarkBubble[] = [
  { from: "me", text: "Ella fue, por esa vez", timestamp: "23:12", atFrame: 45 },
  { from: "me", text: "Mi héroe vivo, ¡bah!", timestamp: "23:12", atFrame: 160 },
  { from: "me", text: "Fue mi único héroe en este lío", timestamp: "23:13", atFrame: 298 },
  { from: "me", text: "La más linda del amor", timestamp: "23:13", atFrame: 502 },
  { from: "me", text: "Que un tonto ha visto soñar", timestamp: "23:14", atFrame: 598 },
  { from: "me", text: "Metió, metió mi rock 'n' roll", timestamp: "23:14", atFrame: 723 },
  { from: "me", text: "Bajo este pulso", timestamp: "23:15", atFrame: 824 },
];

// Last bubble's entrance settles ~15-20 frames after its atFrame — the
// composition holds a few seconds past that so the final line is
// readable before the clip ends.
export const LYRIC_SYNC_29_LAST_FRAME = 824;

export const LyricSyncScene29: React.FC = () => {
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
