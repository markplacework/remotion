import { AbsoluteFill } from "remotion";
import { LyricSyncScene8, LYRIC_SYNC_8_LAST_FRAME } from "./scenes/LyricSyncScene8";
import { VIDEO_WIDTH, VIDEO_HEIGHT, FPS } from "./theme";

// No <Audio> here on purpose — this render ships silent. The real song
// gets added back in the app the clip is uploaded to (TikTok, CapCut,
// etc.), where its bubbles' atFrame values already line up with the
// song's real timestamps starting at 0:00.
export const LYRIC_SYNC_8_FPS = FPS;
export const LYRIC_SYNC_8_WIDTH = VIDEO_WIDTH;
export const LYRIC_SYNC_8_HEIGHT = VIDEO_HEIGHT;
// No fixed duration requested — natural pacing, ends 3s after the
// last line.
export const LYRIC_SYNC_8_DURATION = LYRIC_SYNC_8_LAST_FRAME + 3 * FPS;

export const LyricSync8: React.FC = () => {
  return (
    <AbsoluteFill>
      <LyricSyncScene8 />
    </AbsoluteFill>
  );
};
