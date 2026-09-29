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

// Same wallpaper as LyricSyncScene28.tsx.
const BACKGROUND_SRC = staticFile("/fake-chat/background-alt.png");

// Shorter cut of LyricSyncScene28: starts at "A aprender el hechizo
// ideal" (original atFrame 923) through the end. All atFrame values
// below are the originals from LyricSyncScene28 minus 923, so the
// first bubble now lands at frame 0. Text/timestamps unchanged.
export const BUBBLES: DarkBubble[] = [
  { from: "me", text: "A aprender el hechizo ideal", timestamp: "00:44", atFrame: 0 },
  { from: "me", text: "Que junte los sueños con la realidad", timestamp: "00:45", atFrame: 111 },
  { from: "me", text: "Y por las noches puedo sentir su calor", timestamp: "00:45", atFrame: 321 },
  { from: "me", text: "Su dulce magia me hace perder la razón", timestamp: "00:46", atFrame: 531 },
  { from: "me", text: "Y de mis sueños creo que un día escapó", timestamp: "00:46", atFrame: 821 },
  { from: "me", text: "Para esconderse dentro de mi corazón", timestamp: "00:47", atFrame: 1007 },
  { from: "me", text: "Uoh-oh-oh", timestamp: "00:47", atFrame: 1267 },
];

// Last bubble's entrance settles ~15-20 frames after its atFrame — the
// composition holds a few seconds past that so the final line is
// readable before the clip ends.
export const LYRIC_SYNC_28_SHORT_LAST_FRAME = 1267;

export const LyricSyncScene28Short: React.FC = () => {
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
