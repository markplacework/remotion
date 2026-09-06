import { AbsoluteFill } from "remotion";
import { LyricSyncScene4, LYRIC_SYNC_4_LAST_FRAME } from "./scenes/LyricSyncScene4";
import { VIDEO_WIDTH, VIDEO_HEIGHT, FPS } from "./theme";

// No <Audio> here on purpose — this render ships silent. The real song
// gets added back in the app the clip is uploaded to (TikTok, CapCut,
// etc.), where its bubbles' atFrame values already line up with the
// song's real timestamps starting at 0:00.
export const LYRIC_SYNC_4_FPS = FPS;
export const LYRIC_SYNC_4_WIDTH = VIDEO_WIDTH;
export const LYRIC_SYNC_4_HEIGHT = VIDEO_HEIGHT;
// No fixed duration requested this time — ends a few seconds after
// the last line, same natural-length pacing as the very first
// LyricSync clip.
export const LYRIC_SYNC_4_DURATION = LYRIC_SYNC_4_LAST_FRAME + 3 * FPS;

export const LyricSync4: React.FC = () => {
  return (
    <AbsoluteFill>
      <LyricSyncScene4 />
    </AbsoluteFill>
  );
};
