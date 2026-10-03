import { AbsoluteFill } from "remotion";
import { LyricSyncScene21, LYRIC_SYNC_21_LAST_FRAME } from "./scenes/LyricSyncScene21";
import { VIDEO_WIDTH, VIDEO_HEIGHT, FPS } from "./theme";
import { LYRIC_SYNC_HOLD_FRAMES } from "./lyricSyncDefaults";

// No <Audio> here on purpose — this render ships silent. The real song
// gets added back in the app the clip is uploaded to (TikTok, CapCut,
// etc.), where its bubbles' atFrame values already line up with the
// song's real timestamps starting at 0:00.
export const LYRIC_SYNC_21_FPS = FPS;
export const LYRIC_SYNC_21_WIDTH = VIDEO_WIDTH;
export const LYRIC_SYNC_21_HEIGHT = VIDEO_HEIGHT;
// No fixed duration requested — natural pacing, ends at the standard
// hold (8s) after the last matched line. The clip was cut after 14 of
// the 22 lines the user gave — see LyricSyncScene21.tsx for why.
export const LYRIC_SYNC_21_DURATION = LYRIC_SYNC_21_LAST_FRAME + LYRIC_SYNC_HOLD_FRAMES;

export const LyricSync21: React.FC = () => {
  return (
    <AbsoluteFill>
      <LyricSyncScene21 />
    </AbsoluteFill>
  );
};
