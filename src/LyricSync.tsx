import { AbsoluteFill } from "remotion";
import { LyricSyncScene, LYRIC_SYNC_LAST_FRAME } from "./scenes/LyricSyncScene";
import { VIDEO_WIDTH, VIDEO_HEIGHT, FPS } from "./theme";

// No <Audio> here on purpose — this render ships silent. The real song
// gets added back in the app the clip is uploaded to (TikTok, CapCut,
// etc.), where its bubbles' atFrame values already line up with the
// song's real timestamps starting at 0:00.
export const LYRIC_SYNC_FPS = FPS;
export const LYRIC_SYNC_WIDTH = VIDEO_WIDTH;
export const LYRIC_SYNC_HEIGHT = VIDEO_HEIGHT;
// Last message's atFrame plus an 8s hold (3s to read it + 5s extra
// requested on top of the original cut) before the clip ends.
export const LYRIC_SYNC_DURATION = LYRIC_SYNC_LAST_FRAME + 8 * FPS;

export const LyricSync: React.FC = () => {
  return (
    <AbsoluteFill>
      <LyricSyncScene />
    </AbsoluteFill>
  );
};
