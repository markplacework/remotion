import { AbsoluteFill } from "remotion";
import { LyricSyncScene23 } from "./scenes/LyricSyncScene23";
import { VIDEO_WIDTH, VIDEO_HEIGHT, FPS } from "./theme";

// No <Audio> here on purpose — this render ships silent. The real song
// gets added back in the app the clip is uploaded to (TikTok, CapCut,
// etc.), where its bubbles' atFrame values already line up with the
// song's real timestamps starting at 0:00.
export const LYRIC_SYNC_23_FPS = FPS;
export const LYRIC_SYNC_23_WIDTH = VIDEO_WIDTH;
export const LYRIC_SYNC_23_HEIGHT = VIDEO_HEIGHT;
// User requested: same duration as the original source clip (64.13s)
// plus 5 extra seconds, instead of the standard hold-based default.
const SOURCE_CLIP_DURATION_SECONDS = 64.132993;
export const LYRIC_SYNC_23_DURATION = Math.round((SOURCE_CLIP_DURATION_SECONDS + 5) * LYRIC_SYNC_23_FPS);

export const LyricSync23: React.FC = () => {
  return (
    <AbsoluteFill>
      <LyricSyncScene23 />
    </AbsoluteFill>
  );
};
