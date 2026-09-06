import { AbsoluteFill } from "remotion";
import { LyricSyncScene3 } from "./scenes/LyricSyncScene3";
import { VIDEO_WIDTH, VIDEO_HEIGHT, FPS } from "./theme";

// No <Audio> here on purpose — this render ships silent. The real song
// gets added back in the app the clip is uploaded to (TikTok, CapCut,
// etc.), where its bubbles' atFrame/burnStart values already line up
// with the song's real timestamps starting at 0:00.
export const LYRIC_SYNC_3_FPS = FPS;
export const LYRIC_SYNC_3_WIDTH = VIDEO_WIDTH;
export const LYRIC_SYNC_3_HEIGHT = VIDEO_HEIGHT;
// Fixed total length requested: 45s.
export const LYRIC_SYNC_3_DURATION = 45 * FPS;

export const LyricSync3: React.FC = () => {
  return (
    <AbsoluteFill>
      <LyricSyncScene3 />
    </AbsoluteFill>
  );
};
