import { AbsoluteFill } from "remotion";
import { SpotifyLyrics } from "../components/SpotifyLyrics";
import {
  LYRIC_SYNC_CANVAS_TOP_MARGIN,
  LYRIC_SYNC_CANVAS_BOTTOM_MARGIN,
  LYRIC_SYNC_CANVAS_LEFT_MARGIN,
  LYRIC_SYNC_SAFE_RIGHT_EDGE,
} from "../lyricSyncDefaults";
import { BUBBLES } from "./LyricSyncScene36";

// One-off Spotify-lyrics-style version of LyricSync36, requested for
// this song only (the WhatsApp format stays the default). Same text and
// the same atFrame values as the WhatsApp scene — imported, not copied,
// so the two can never drift apart — and the same TikTok-safe margins.
const LINES = BUBBLES.map(({ text, atFrame }) => ({ text, atFrame }));

// Flat, muted color like the ones Spotify pulls from the cover art.
const BACKGROUND = "#4a3d8f";
const LABEL_SIZE = 30;
const LABEL_GAP = 36;

export const LyricSyncScene36Spotify: React.FC = () => {
  const width = LYRIC_SYNC_SAFE_RIGHT_EDGE - LYRIC_SYNC_CANVAS_LEFT_MARGIN;
  const height = 1920 - LYRIC_SYNC_CANVAS_TOP_MARGIN - LYRIC_SYNC_CANVAS_BOTTOM_MARGIN;
  return (
    <AbsoluteFill style={{ background: BACKGROUND }}>
      {/* Soft darkening toward the bottom, as on Spotify's lyrics card. */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.28) 100%)" }} />
      <div
        style={{
          position: "absolute",
          top: LYRIC_SYNC_CANVAS_TOP_MARGIN,
          left: LYRIC_SYNC_CANVAS_LEFT_MARGIN,
          width,
        }}
      >
        <div
          style={{
            fontFamily: 'Poppins, "Helvetica Neue", Helvetica, Arial, sans-serif',
            fontWeight: 700,
            fontSize: LABEL_SIZE,
            color: "rgba(255,255,255,0.9)",
            marginBottom: LABEL_GAP,
          }}
        >
          Letra
        </div>
        <SpotifyLyrics lines={LINES} width={width} height={height - LABEL_SIZE * 1.5 - LABEL_GAP} anchorY={220} />
      </div>
    </AbsoluteFill>
  );
};
