import { AbsoluteFill, Img, staticFile } from "remotion";
import { AutoScrollChatLog } from "../components/AutoScrollChatLog";
import type { DarkBubble } from "../components/DarkChatLog";
import {
  LYRIC_SYNC_CANVAS_TOP_MARGIN,
  LYRIC_SYNC_CANVAS_LEFT_MARGIN,
  LYRIC_SYNC_CONTENT_WIDTH,
  LYRIC_SYNC_VIEWPORT_HEIGHT,
  LYRIC_SYNC_SCALE,
} from "../lyricSyncDefaults";

// Same real WhatsApp dark-mode wallpaper doodle used by the other
// lyric-sync scenes — generic (not song-specific), reused as-is.
const BACKGROUND_SRC = staticFile("/fake-chat/background.png");

// Shorter cut of LyricSyncScene11: starts at "Aunque casi te confieso"
// (original atFrame 952) through the end of the song, and runs to the
// end of the video from there on. All atFrame values below are the
// originals from LyricSyncScene11 minus 952, so the first bubble now
// lands at frame 0. Text/timestamps are unchanged (same transcription,
// same alignment run — just re-based to a new start).
export const BUBBLES: DarkBubble[] = [
  { from: "me", text: "Aunque casi te confieso", timestamp: "18:09", atFrame: 0 },
  { from: "me", text: "Que también he sido un perro", timestamp: "18:09", atFrame: 160 },
  { from: "me", text: "Compañero", timestamp: "18:10", atFrame: 227 },
  { from: "me", text: "Un perro ideal", timestamp: "18:10", atFrame: 255 },
  { from: "me", text: "Que aprendió a ladrar", timestamp: "18:11", atFrame: 309 },
  { from: "me", text: "Y a volver al hogar", timestamp: "18:11", atFrame: 373 },
  { from: "me", text: "Para poder comer", timestamp: "18:12", atFrame: 445 },
  { from: "me", text: "Flaca, no me claves", timestamp: "18:12", atFrame: 600 },
  { from: "me", text: "Tus puñales por la espalda", timestamp: "18:13", atFrame: 714 },
  { from: "me", text: "Tan profundo, no me duelen", timestamp: "18:13", atFrame: 850 },
  { from: "me", text: "No me hacen mal", timestamp: "18:14", atFrame: 977 },
  { from: "me", text: "Lejos, en el centro", timestamp: "18:14", atFrame: 1134 },
  { from: "me", text: "De la tierra, las raíces", timestamp: "18:15", atFrame: 1236 },
  { from: "me", text: "Del amor, donde estaban", timestamp: "18:15", atFrame: 1366 },
  { from: "me", text: "Quedarán", timestamp: "18:16", atFrame: 1494 },
];

// Last bubble's entrance settles ~15-20 frames after its atFrame — the
// composition holds a few seconds past that so the final line is
// readable before the clip ends.
export const LYRIC_SYNC_11_SHORT_LAST_FRAME = 1494;

export const LyricSyncScene11Short: React.FC = () => {
  return (
    <AbsoluteFill>
      <Img
        src={BACKGROUND_SRC}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
      <AbsoluteFill
        style={{
          alignItems: "flex-start",
          justifyContent: "flex-start",
          paddingTop: LYRIC_SYNC_CANVAS_TOP_MARGIN,
          paddingLeft: LYRIC_SYNC_CANVAS_LEFT_MARGIN,
        }}
      >
        <div style={{ transform: `scale(${LYRIC_SYNC_SCALE})`, transformOrigin: "top left" }}>
          <AutoScrollChatLog
            bubbles={BUBBLES}
            viewportHeight={LYRIC_SYNC_VIEWPORT_HEIGHT}
            width={LYRIC_SYNC_CONTENT_WIDTH}
            dateLabel="Hoy"
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
