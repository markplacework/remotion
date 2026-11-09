import { AbsoluteFill } from "remotion";
import { LyricSyncScene12, LYRIC_SYNC_12_LAST_FRAME } from "./scenes/LyricSyncScene12";
import { VIDEO_WIDTH, VIDEO_HEIGHT, FPS } from "./theme";
import { LYRIC_SYNC_HOLD_FRAMES } from "./lyricSyncDefaults";

// No <Audio> here on purpose — this render ships silent. The real song
// gets added back in the app the clip is uploaded to (TikTok, CapCut,
// etc.), where its bubbles' atFrame values already line up with the
// song's real timestamps starting at 0:00.
export const LYRIC_SYNC_12_FPS = FPS;
export const LYRIC_SYNC_12_WIDTH = VIDEO_WIDTH;
export const LYRIC_SYNC_12_HEIGHT = VIDEO_HEIGHT;
// No fixed duration requested — natural pacing, ends at the standard
// hold (8s) after the last matched line (the source clip's final ~13s
// has no discernible vocals, so it's cut rather than guessed at).
export const LYRIC_SYNC_12_DURATION = LYRIC_SYNC_12_LAST_FRAME + LYRIC_SYNC_HOLD_FRAMES;

export const LyricSync12: React.FC = () => {
  return (
    <AbsoluteFill>
      <LyricSyncScene12 />
    </AbsoluteFill>
  );
};
