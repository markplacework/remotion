import { AbsoluteFill } from "remotion";
import { LyricSyncScene28, LYRIC_SYNC_28_LAST_FRAME } from "./scenes/LyricSyncScene28";
import { VIDEO_WIDTH, VIDEO_HEIGHT, FPS } from "./theme";
import { LYRIC_SYNC_HOLD_FRAMES } from "./lyricSyncDefaults";

// No <Audio> here on purpose — this render ships silent. The real song
// gets added back in the app the clip is uploaded to (TikTok, CapCut,
// etc.), where its bubbles' atFrame values already line up with the
// song's real timestamps starting at 0:00.
export const LYRIC_SYNC_28_FPS = FPS;
export const LYRIC_SYNC_28_WIDTH = VIDEO_WIDTH;
export const LYRIC_SYNC_28_HEIGHT = VIDEO_HEIGHT;
// No fixed duration requested — natural pacing, ends at the standard
// hold (8s) after the last matched line. The repeated 4-line chorus
// at the end of the source clip was cut — see LyricSyncScene28.tsx
// for why.
export const LYRIC_SYNC_28_DURATION = LYRIC_SYNC_28_LAST_FRAME + LYRIC_SYNC_HOLD_FRAMES;

export const LyricSync28: React.FC = () => {
  return (
    <AbsoluteFill>
      <LyricSyncScene28 />
    </AbsoluteFill>
  );
};
