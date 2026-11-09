import { AbsoluteFill } from "remotion";
import { LyricSyncScene32, LYRIC_SYNC_32_LAST_FRAME } from "./scenes/LyricSyncScene32";
import { VIDEO_WIDTH, VIDEO_HEIGHT, FPS } from "./theme";
import { LYRIC_SYNC_HOLD_FRAMES } from "./lyricSyncDefaults";

// No <Audio> here on purpose — this render ships silent. The real song
// gets added back in the app the clip is uploaded to (TikTok, CapCut,
// etc.), where its bubbles' atFrame values already line up with the
// song's real timestamps starting where this clip is trimmed to begin
// (14.0s into the original source — see LyricSyncScene32.tsx).
export const LYRIC_SYNC_32_FPS = FPS;
export const LYRIC_SYNC_32_WIDTH = VIDEO_WIDTH;
export const LYRIC_SYNC_32_HEIGHT = VIDEO_HEIGHT;
// No fixed duration requested — natural pacing, ends at the standard
// hold (8s) after the last line.
export const LYRIC_SYNC_32_DURATION = LYRIC_SYNC_32_LAST_FRAME + LYRIC_SYNC_HOLD_FRAMES;

export const LyricSync32: React.FC = () => {
  return (
    <AbsoluteFill>
      <LyricSyncScene32 />
    </AbsoluteFill>
  );
};
