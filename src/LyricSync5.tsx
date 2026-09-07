import { AbsoluteFill } from "remotion";
import { LyricSyncScene5, LYRIC_SYNC_5_LAST_FRAME } from "./scenes/LyricSyncScene5";
import { VIDEO_WIDTH, VIDEO_HEIGHT, FPS } from "./theme";

// No <Audio> here on purpose — this render ships silent. The real song
// gets added back in the app the clip is uploaded to (TikTok, CapCut,
// etc.), where its bubbles' atFrame values already line up with the
// song's real timestamps starting at 0:00.
export const LYRIC_SYNC_5_FPS = FPS;
export const LYRIC_SYNC_5_WIDTH = VIDEO_WIDTH;
export const LYRIC_SYNC_5_HEIGHT = VIDEO_HEIGHT;
// No fixed duration requested — natural pacing, ends 3s after the
// last line.
export const LYRIC_SYNC_5_DURATION = LYRIC_SYNC_5_LAST_FRAME + 3 * FPS;

export const LyricSync5: React.FC = () => {
  return (
    <AbsoluteFill>
      <LyricSyncScene5 />
    </AbsoluteFill>
  );
};
