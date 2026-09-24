import { AbsoluteFill } from "remotion";
import { LyricSyncScene22 } from "./scenes/LyricSyncScene22";
import { VIDEO_WIDTH, VIDEO_HEIGHT, FPS } from "./theme";

// No <Audio> here on purpose — this render ships silent, same as every
// other lyric-sync composition. A companion trimmed+faded audio clip
// is delivered alongside this render (not baked in) for the user to
// drop under it in CapCut/TikTok.
export const LYRIC_SYNC_22_FPS = FPS;
export const LYRIC_SYNC_22_WIDTH = VIDEO_WIDTH;
export const LYRIC_SYNC_22_HEIGHT = VIDEO_HEIGHT;
// Custom fixed duration for this song: trimmed tightly to start almost
// exactly at the first lyric (12.1s in the source) and, per the user's
// special request for this one, run a little past the last lyric into
// the melodic outro (to 58.0s in the source) instead of an abrupt cut
// or the standard 8s hold — meant to be paired with a companion audio
// clip that fades out over its last 3 seconds.
export const LYRIC_SYNC_22_DURATION = Math.round((58.0 - 12.1) * LYRIC_SYNC_22_FPS);

export const LyricSync22: React.FC = () => {
  return (
    <AbsoluteFill>
      <LyricSyncScene22 />
    </AbsoluteFill>
  );
};
