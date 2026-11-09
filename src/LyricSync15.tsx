import { AbsoluteFill } from "remotion";
import { LyricSyncScene15, LYRIC_SYNC_15_LAST_FRAME } from "./scenes/LyricSyncScene15";
import { VIDEO_WIDTH, VIDEO_HEIGHT, FPS } from "./theme";
import { LYRIC_SYNC_HOLD_FRAMES } from "./lyricSyncDefaults";

// No <Audio> here on purpose — this render ships silent. The real song
// gets added back in the app the clip is uploaded to (TikTok, CapCut,
// etc.), where its bubbles' atFrame values already line up with the
// song's real timestamps starting at 0:00.
export const LYRIC_SYNC_15_FPS = FPS;
export const LYRIC_SYNC_15_WIDTH = VIDEO_WIDTH;
export const LYRIC_SYNC_15_HEIGHT = VIDEO_HEIGHT;
// No fixed duration requested — natural pacing, ends at the standard
// hold (8s) after the last line.
export const LYRIC_SYNC_15_DURATION = LYRIC_SYNC_15_LAST_FRAME + LYRIC_SYNC_HOLD_FRAMES;

export const LyricSync15: React.FC = () => {
  return (
    <AbsoluteFill>
      <LyricSyncScene15 />
    </AbsoluteFill>
  );
};
