import { AbsoluteFill } from "remotion";
import { LyricSyncScene16 } from "./scenes/LyricSyncScene16";
import { VIDEO_WIDTH, VIDEO_HEIGHT, FPS } from "./theme";

// No <Audio> here on purpose — this render ships silent. The real song
// gets added back in the app the clip is uploaded to (TikTok, CapCut,
// etc.), where its bubbles' atFrame values already line up with the
// song's real timestamps starting at 0:00.
export const LYRIC_SYNC_16_FPS = FPS;
export const LYRIC_SYNC_16_WIDTH = VIDEO_WIDTH;
export const LYRIC_SYNC_16_HEIGHT = VIDEO_HEIGHT;
// User requested an exact fixed duration of 58 seconds so the music
// plays solo (no more bubbles) after the last line lands, instead of
// the standard natural-pacing hold.
export const LYRIC_SYNC_16_DURATION = 58 * LYRIC_SYNC_16_FPS;

export const LyricSync16: React.FC = () => {
  return (
    <AbsoluteFill>
      <LyricSyncScene16 />
    </AbsoluteFill>
  );
};
