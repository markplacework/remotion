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
// Last message's atFrame plus a 3s hold so it's readable before the cut.
export const LYRIC_SYNC_DURATION = LYRIC_SYNC_LAST_FRAME + 3 * FPS;

export const LyricSync: React.FC = () => {
  return (
    <AbsoluteFill>
      <LyricSyncScene />
    </AbsoluteFill>
  );
};
