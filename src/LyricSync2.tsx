import { AbsoluteFill } from "remotion";
import { LyricSyncScene2 } from "./scenes/LyricSyncScene2";
import { VIDEO_WIDTH, VIDEO_HEIGHT, FPS } from "./theme";

// No <Audio> here on purpose — this render ships silent. The real song
// gets added back in the app the clip is uploaded to (TikTok, CapCut,
// etc.), where its bubbles' atFrame values already line up with the
// song's real timestamps starting at 0:00.
export const LYRIC_SYNC_2_FPS = FPS;
export const LYRIC_SYNC_2_WIDTH = VIDEO_WIDTH;
export const LYRIC_SYNC_2_HEIGHT = VIDEO_HEIGHT;
// Fixed total length requested: 45s.
export const LYRIC_SYNC_2_DURATION = 45 * FPS;

export const LyricSync2: React.FC = () => {
  return (
    <AbsoluteFill>
      <LyricSyncScene2 />
    </AbsoluteFill>
  );
};
