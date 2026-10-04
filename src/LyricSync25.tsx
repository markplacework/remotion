import { AbsoluteFill } from "remotion";
import { LyricSyncScene25, LYRIC_SYNC_25_LAST_FRAME } from "./scenes/LyricSyncScene25";
import { VIDEO_WIDTH, VIDEO_HEIGHT, FPS } from "./theme";
import { LYRIC_SYNC_HOLD_FRAMES } from "./lyricSyncDefaults";

// No <Audio> here on purpose — this render ships silent. The real song
// gets added back in the app the clip is uploaded to (TikTok, CapCut,
// etc.), where its bubbles' atFrame values already line up with the
// song's real timestamps starting at 0:00.
export const LYRIC_SYNC_25_FPS = FPS;
export const LYRIC_SYNC_25_WIDTH = VIDEO_WIDTH;
export const LYRIC_SYNC_25_HEIGHT = VIDEO_HEIGHT;
// No fixed duration requested — natural pacing, ends at the standard
// hold (8s) after the last line.
export const LYRIC_SYNC_25_DURATION = LYRIC_SYNC_25_LAST_FRAME + LYRIC_SYNC_HOLD_FRAMES;

export const LyricSync25: React.FC = () => {
  return (
    <AbsoluteFill>
      <LyricSyncScene25 />
    </AbsoluteFill>
  );
};
