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
// the user's eighteenth uploaded clip with faster-whisper (small
// model, word_timestamps=True, biased with an initial_prompt built
// from these same 11 lines). All 11 matched the transcript in full,
// no repeats, no gaps. The song then reprises the opening lines once
// more as an outro after the last line (not re-added as its own
// bubble — matches the pattern used for other songs whose outro
// repeats the intro).
// Seconds -> frames at 30fps (the project's own fps), rounded to the
// nearest frame:
//   "Estoy vencido porque el mundo me hizo así"     0.00s ->    0
//   "No puedo cambiar"                               4.30s ->  129
//   "Soy el remedio sin receta y tu amor"            7.00s ->  210
//   "Mi enfermedad"                                 11.10s ->  333
//   "Estoy vencido porque el cuerpo de los dos"     13.70s ->  411
//   "Es mi debilidad"                               18.38s ->  551
//   "Esta vez el dolor va a terminar"               22.00s ->  660
//   "Parece que la fiesta terminó"                  31.00s ->  930
//   "Perdidos en el túnel del amor"                 38.16s -> 1145
//   "Y dicen las hojas del libro que más leo yo"    44.02s -> 1321
//   "Esta vez el esclavo se escapó"                 49.42s -> 1483
//
// No burn/delete effect — plain conversation, 11 lines. Uses
// AutoScrollChatLog with the shared lyric-sync layout defaults (locked
// in after Scene9).
export const BUBBLES: DarkBubble[] = [
  { from: "me", text: "Estoy vencido porque el mundo me hizo así", timestamp: "22:47", atFrame: 0 },
  { from: "me", text: "No puedo cambiar", timestamp: "22:47", atFrame: 129 },
  { from: "me", text: "Soy el remedio sin receta y tu amor", timestamp: "22:48", atFrame: 210 },
  { from: "me", text: "Mi enfermedad", timestamp: "22:48", atFrame: 333 },
  { from: "me", text: "Estoy vencido porque el cuerpo de los dos", timestamp: "22:49", atFrame: 411 },
  { from: "me", text: "Es mi debilidad", timestamp: "22:49", atFrame: 551 },
  { from: "me", text: "Esta vez el dolor va a terminar", timestamp: "22:50", atFrame: 660 },
  { from: "me", text: "Parece que la fiesta terminó", timestamp: "22:50", atFrame: 930 },
  { from: "me", text: "Perdidos en el túnel del amor", timestamp: "22:51", atFrame: 1145 },
  { from: "me", text: "Y dicen las hojas del libro que más leo yo", timestamp: "22:51", atFrame: 1321 },
  { from: "me", text: "Esta vez el esclavo se escapó", timestamp: "22:52", atFrame: 1483 },
];

// Last bubble's entrance settles ~15-20 frames after its atFrame — the
// composition holds a few seconds past that so the final line is
// readable before the clip ends.
export const LYRIC_SYNC_18_LAST_FRAME = 1483;

export const LyricSyncScene18: React.FC = () => {
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
