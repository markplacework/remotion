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

// User-supplied lines, exact wording — transcribed word-by-word from
// the user's thirteenth uploaded clip with faster-whisper (small
// model, word_timestamps=True, biased with an initial_prompt built
// from these same 8 lines). All 8 matched the transcript in full, no
// repeats, no gaps.
// Seconds -> frames at 30fps (the project's own fps), rounded to the
// nearest frame:
//   "Perdiendo imagen, a tu lado estoy mi vida"    0.00s ->   0
//   "Mañana será un nuevo punto de partida"        3.10s ->  93
//   "Soy vagabundo de tu lado mas profundo"        7.62s -> 229
//   "Por un segundo de tu cuerpo doy el mundo"    10.94s -> 328
//   "Que más quisiera que pasar la vida entera"   15.34s -> 460
//   "Como estudiante el día de la primavera"      18.76s -> 563
//   "Siempre viajando en un asiento de primera"   23.36s -> 701
//   "El comandante de tu balsa de madera"         26.32s -> 790
//
// No burn/delete effect — plain conversation, only 8 short lines. Uses
// AutoScrollChatLog with the shared lyric-sync layout defaults (locked
// in after Scene9).
export const BUBBLES: DarkBubble[] = [
  { from: "me", text: "Perdiendo imagen, a tu lado estoy mi vida", timestamp: "22:31", atFrame: 0 },
  { from: "me", text: "Mañana será un nuevo punto de partida", timestamp: "22:31", atFrame: 93 },
  { from: "me", text: "Soy vagabundo de tu lado mas profundo", timestamp: "22:32", atFrame: 229 },
  { from: "me", text: "Por un segundo de tu cuerpo doy el mundo", timestamp: "22:32", atFrame: 328 },
  { from: "me", text: "Que más quisiera que pasar la vida entera", timestamp: "22:33", atFrame: 460 },
  { from: "me", text: "Como estudiante el día de la primavera", timestamp: "22:33", atFrame: 563 },
  { from: "me", text: "Siempre viajando en un asiento de primera", timestamp: "22:34", atFrame: 701 },
  { from: "me", text: "El comandante de tu balsa de madera", timestamp: "22:34", atFrame: 790 },
];

// Last bubble's entrance settles ~15-20 frames after its atFrame — the
// composition holds a few seconds past that so the final line is
// readable before the clip ends.
export const LYRIC_SYNC_13_LAST_FRAME = 790;

export const LyricSyncScene13: React.FC = () => {
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
