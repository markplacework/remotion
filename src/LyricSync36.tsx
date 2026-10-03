import { AbsoluteFill } from "remotion";
import { LyricSyncScene36, LYRIC_SYNC_36_LAST_FRAME } from "./scenes/LyricSyncScene36";
import { VIDEO_WIDTH, VIDEO_HEIGHT, FPS } from "./theme";
import { LYRIC_SYNC_HOLD_FRAMES } from "./lyricSyncDefaults";

// No <Audio> here on purpose — this render ships silent. The real song
// gets added back in the app the clip is uploaded to (TikTok, CapCut,
// etc.), where its bubbles' atFrame values already line up with the
// song's real timestamps starting at 0:00.
export const LYRIC_SYNC_36_FPS = FPS;
export const LYRIC_SYNC_36_WIDTH = VIDEO_WIDTH;
export const LYRIC_SYNC_36_HEIGHT = VIDEO_HEIGHT;
// Standard 8s hold after the last line plus 10s more on request, so
// the remix keeps playing a while after the final bubble.
export const LYRIC_SYNC_36_DURATION = LYRIC_SYNC_36_LAST_FRAME + LYRIC_SYNC_HOLD_FRAMES + 10 * FPS;

export const LyricSync36: React.FC = () => {
  return (
    <AbsoluteFill>
      <LyricSyncScene36 />
    </AbsoluteFill>
  );
};
