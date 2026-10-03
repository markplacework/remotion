import { AbsoluteFill } from "remotion";
import { LyricSyncScene36Spotify } from "./scenes/LyricSyncScene36Spotify";
import { LYRIC_SYNC_36_DURATION } from "./LyricSync36";
import { VIDEO_WIDTH, VIDEO_HEIGHT, FPS } from "./theme";

// No <Audio> here on purpose — this render ships silent. The real song
// gets added back in the app the clip is uploaded to (TikTok, CapCut,
// etc.), where its lines' atFrame values already line up with the
// song's real timestamps starting at 0:00.
export const LYRIC_SYNC_36_SPOTIFY_FPS = FPS;
export const LYRIC_SYNC_36_SPOTIFY_WIDTH = VIDEO_WIDTH;
export const LYRIC_SYNC_36_SPOTIFY_HEIGHT = VIDEO_HEIGHT;
// Same length as the WhatsApp version (including its extra 10s hold).
export const LYRIC_SYNC_36_SPOTIFY_DURATION = LYRIC_SYNC_36_DURATION;

export const LyricSync36Spotify: React.FC = () => {
  return (
    <AbsoluteFill>
      <LyricSyncScene36Spotify />
    </AbsoluteFill>
  );
};
