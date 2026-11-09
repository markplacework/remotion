import { AbsoluteFill } from "remotion";
import { LyricSyncScene19Alt, LYRIC_SYNC_19_ALT_LAST_FRAME } from "./scenes/LyricSyncScene19Alt";
import { VIDEO_WIDTH, VIDEO_HEIGHT, FPS } from "./theme";
import { LYRIC_SYNC_HOLD_FRAMES } from "./lyricSyncDefaults";

// No <Audio> here on purpose — this render ships silent, same as every
// other lyric-sync composition.
export const LYRIC_SYNC_19_ALT_FPS = FPS;
export const LYRIC_SYNC_19_ALT_WIDTH = VIDEO_WIDTH;
export const LYRIC_SYNC_19_ALT_HEIGHT = VIDEO_HEIGHT;
export const LYRIC_SYNC_19_ALT_DURATION = LYRIC_SYNC_19_ALT_LAST_FRAME + LYRIC_SYNC_HOLD_FRAMES;

export const LyricSync19Alt: React.FC = () => {
  return (
    <AbsoluteFill>
      <LyricSyncScene19Alt />
    </AbsoluteFill>
  );
};
