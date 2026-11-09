import { AbsoluteFill } from "remotion";
import { LyricSyncScene8, LYRIC_SYNC_8_LAST_FRAME } from "./scenes/LyricSyncScene8";
import { VIDEO_WIDTH, VIDEO_HEIGHT, FPS } from "./theme";

// No <Audio> here on purpose — this render ships silent. The real song
// gets added back in the app the clip is uploaded to (TikTok, CapCut,
// etc.), where its bubbles' atFrame values already line up with the
// song's real timestamps starting at 0:00.
export const LYRIC_SYNC_8_FPS = FPS;
export const LYRIC_SYNC_8_WIDTH = VIDEO_WIDTH;
export const LYRIC_SYNC_8_HEIGHT = VIDEO_HEIGHT;
// Natural-length pacing (ends after the last line) — a 3s hold plus
// 5s more, now the standing default for every lyric-sync clip unless
// told otherwise.
export const LYRIC_SYNC_8_DURATION = LYRIC_SYNC_8_LAST_FRAME + 8 * FPS;

export const LyricSync8: React.FC = () => {
  return (
    <AbsoluteFill>
      <LyricSyncScene8 />
    </AbsoluteFill>
  );
};
