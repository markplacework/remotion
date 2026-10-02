import { AbsoluteFill } from "remotion";
import { LyricSyncScene9 } from "./scenes/LyricSyncScene9";
import { VIDEO_WIDTH, VIDEO_HEIGHT, FPS } from "./theme";

// No <Audio> here on purpose — this render ships silent. The real song
// gets added back in the app the clip is uploaded to (TikTok, CapCut,
// etc.), where its bubbles' atFrame values already line up with the
// song's real timestamps starting at 0:00.
export const LYRIC_SYNC_9_FPS = FPS;
export const LYRIC_SYNC_9_WIDTH = VIDEO_WIDTH;
export const LYRIC_SYNC_9_HEIGHT = VIDEO_HEIGHT;
// Explicitly requested to match the uploaded clip's own exact runtime
// (00:01:02.53) instead of the usual natural-length + 8s hold —
// measured directly off that file's own duration.
export const LYRIC_SYNC_9_DURATION = Math.round(62.53 * FPS);

export const LyricSync9: React.FC = () => {
  return (
    <AbsoluteFill>
      <LyricSyncScene9 />
    </AbsoluteFill>
  );
};
