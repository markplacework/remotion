import { AbsoluteFill } from "remotion";
import { LyricSyncScene25Trimmed, LYRIC_SYNC_25_TRIMMED_LAST_FRAME } from "./scenes/LyricSyncScene25Trimmed";
import { VIDEO_WIDTH, VIDEO_HEIGHT, FPS } from "./theme";
import { LYRIC_SYNC_HOLD_FRAMES } from "./lyricSyncDefaults";

// No <Audio> here on purpose — this render ships silent, same as every
// other lyric-sync composition.
export const LYRIC_SYNC_25_TRIMMED_FPS = FPS;
export const LYRIC_SYNC_25_TRIMMED_WIDTH = VIDEO_WIDTH;
export const LYRIC_SYNC_25_TRIMMED_HEIGHT = VIDEO_HEIGHT;
// No fixed duration requested — natural pacing, ends at the standard
// hold (8s) after the last line.
export const LYRIC_SYNC_25_TRIMMED_DURATION = LYRIC_SYNC_25_TRIMMED_LAST_FRAME + LYRIC_SYNC_HOLD_FRAMES;

export const LyricSync25Trimmed: React.FC = () => {
  return (
    <AbsoluteFill>
      <LyricSyncScene25Trimmed />
    </AbsoluteFill>
  );
};
