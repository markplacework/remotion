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

// Same wallpaper as LyricSyncScene24.tsx.
const BACKGROUND_SRC = staticFile("/fake-chat/background-alt.png");

// Shorter cut of LyricSyncScene24: starts at "Quiero llorar" (original
// atFrame 479) through the end of the song. All atFrame values below
// are the originals from LyricSyncScene24 minus 479, so the first
// bubble now lands at frame 0. Text/timestamps unchanged.
export const BUBBLES: DarkBubble[] = [
  { from: "me", text: "Quiero llorar", timestamp: "19:13", atFrame: 0 },
  { from: "me", text: "Y me destroza que pienses así", timestamp: "19:13", atFrame: 56 },
  { from: "me", text: "Y más que ahora me quedé sin ti", timestamp: "19:14", atFrame: 177 },
  { from: "me", text: "Me duele lo que tú vas a sufrir", timestamp: "19:14", atFrame: 305 },
  { from: "me", text: "Pero recuerda, nadie es perfecto y tú lo verás", timestamp: "19:15", atFrame: 498 },
  { from: "me", text: "Más de mil cosas mejores tendrás", timestamp: "19:15", atFrame: 693 },
  { from: "me", text: "Pero cariño sincero jamás", timestamp: "19:16", atFrame: 797 },
  { from: "me", text: "Vete olvidando de esto que hoy dejas y que cambiarás", timestamp: "19:16", atFrame: 965 },
  { from: "me", text: "Por la aventura que tú ya verás", timestamp: "19:17", atFrame: 1167 },
  { from: "me", text: "Será tu cárcel y nunca saldrás", timestamp: "19:17", atFrame: 1290 },
];

// Last bubble's entrance settles ~15-20 frames after its atFrame — the
// composition holds a few seconds past that so the final line is
// readable before the clip ends.
export const LYRIC_SYNC_24_SHORT_LAST_FRAME = 1290;

export const LyricSyncScene24Short: React.FC = () => {
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
