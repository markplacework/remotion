import { AbsoluteFill } from "remotion";
import { LyricSyncScene24Short, LYRIC_SYNC_24_SHORT_LAST_FRAME } from "./scenes/LyricSyncScene24Short";
import { VIDEO_WIDTH, VIDEO_HEIGHT, FPS } from "./theme";
import { LYRIC_SYNC_HOLD_FRAMES } from "./lyricSyncDefaults";

// No <Audio> here on purpose — this render ships silent, same as every
// other lyric-sync composition.
export const LYRIC_SYNC_24_SHORT_FPS = FPS;
export const LYRIC_SYNC_24_SHORT_WIDTH = VIDEO_WIDTH;
export const LYRIC_SYNC_24_SHORT_HEIGHT = VIDEO_HEIGHT;
// No fixed duration requested — natural pacing, ends at the standard
// hold (8s) after the last line.
export const LYRIC_SYNC_24_SHORT_DURATION = LYRIC_SYNC_24_SHORT_LAST_FRAME + LYRIC_SYNC_HOLD_FRAMES;

export const LyricSync24Short: React.FC = () => {
  return (
    <AbsoluteFill>
      <LyricSyncScene24Short />
    </AbsoluteFill>
  );
};
