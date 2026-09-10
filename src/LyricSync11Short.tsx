import { AbsoluteFill } from "remotion";
import { LyricSyncScene11Short, LYRIC_SYNC_11_SHORT_LAST_FRAME } from "./scenes/LyricSyncScene11Short";
import { VIDEO_WIDTH, VIDEO_HEIGHT, FPS } from "./theme";
import { LYRIC_SYNC_HOLD_FRAMES } from "./lyricSyncDefaults";

// No <Audio> here on purpose — this render ships silent. The real song
// gets added back in the app the clip is uploaded to (TikTok, CapCut,
// etc.), where the bubbles' atFrame values already line up with the
// song starting at "Aunque casi te confieso" instead of 0:00.
export const LYRIC_SYNC_11_SHORT_FPS = FPS;
export const LYRIC_SYNC_11_SHORT_WIDTH = VIDEO_WIDTH;
export const LYRIC_SYNC_11_SHORT_HEIGHT = VIDEO_HEIGHT;
// No fixed duration requested — natural pacing, ends at the standard
// hold (8s) after the last line.
export const LYRIC_SYNC_11_SHORT_DURATION = LYRIC_SYNC_11_SHORT_LAST_FRAME + LYRIC_SYNC_HOLD_FRAMES;

export const LyricSync11Short: React.FC = () => {
  return (
    <AbsoluteFill>
      <LyricSyncScene11Short />
    </AbsoluteFill>
  );
};
