import { AbsoluteFill } from "remotion";
import { LyricSyncScene30Avanti, LYRIC_SYNC_30_AVANTI_LAST_FRAME } from "./scenes/LyricSyncScene30Avanti";
import { VIDEO_WIDTH, VIDEO_HEIGHT, FPS } from "./theme";
import { LYRIC_SYNC_HOLD_FRAMES } from "./lyricSyncDefaults";

// No <Audio> here on purpose — this render ships silent, same as every
// other lyric-sync composition.
export const LYRIC_SYNC_30_AVANTI_FPS = FPS;
export const LYRIC_SYNC_30_AVANTI_WIDTH = VIDEO_WIDTH;
export const LYRIC_SYNC_30_AVANTI_HEIGHT = VIDEO_HEIGHT;
// No fixed duration requested — natural pacing, ends at the standard
// hold (8s) after the last line.
export const LYRIC_SYNC_30_AVANTI_DURATION = LYRIC_SYNC_30_AVANTI_LAST_FRAME + LYRIC_SYNC_HOLD_FRAMES;

export const LyricSync30Avanti: React.FC = () => {
  return (
    <AbsoluteFill>
      <LyricSyncScene30Avanti />
    </AbsoluteFill>
  );
};
