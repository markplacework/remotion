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

// Rebuild of LyricSyncScene19 ("Me arde") with the new wallpaper
// format — same bubbles/margins/timings, only the background changes.
const BACKGROUND_SRC = staticFile("/fake-chat/background-alt.png");

// Same BUBBLES/timings as LyricSyncScene19.tsx — see that file for the
// full seconds -> frames derivation notes.
export const BUBBLES: DarkBubble[] = [
  { from: "me", text: "Me arde, me arde, es tarde para curarme", timestamp: "17:38", atFrame: 59 },
  { from: "me", text: "Me arde, me quema, dejé la sangre en la arena", timestamp: "17:38", atFrame: 293 },
  { from: "me", text: "Me arde, me está quemando, estoy disimulando", timestamp: "17:39", atFrame: 569 },
  { from: "me", text: "Como el fuego sobre la superficie del mar", timestamp: "17:39", atFrame: 784 },
  { from: "me", text: "Como el viento caliente del desierto", timestamp: "17:40", atFrame: 934 },
  { from: "me", text: "Me quema, me quema, saber, que no vas a volver", timestamp: "17:40", atFrame: 1037 },
];

// Last bubble's entrance settles ~15-20 frames after its atFrame — the
// composition holds a few seconds past that so the final line is
// readable before the clip ends.
export const LYRIC_SYNC_19_ALT_LAST_FRAME = 1037;

export const LyricSyncScene19Alt: React.FC = () => {
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
