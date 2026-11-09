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
// the user's seventeenth uploaded clip with faster-whisper (small
// model, word_timestamps=True, biased with an initial_prompt built
// from these same 17 lines, incl. the repeated closing line twice).
// All 17 matched the transcript in full, no gaps. The final line ("La
// que se cuenta por ahí") is sung twice — the forward-cursor difflib
// matching correctly resolved each repeat to its own distinct later
// occurrence (49.96s and 58.08s).
// Seconds -> frames at 30fps (the project's own fps), rounded to the
// nearest frame:
//   "Gran alfombra roja"                            0.00s ->    0
//   "Olvidar es divino"                              1.82s ->   55
//   "Y fuerte la fuerza del destino"                 4.36s ->  131
//   "Cuerda floja"                                   7.24s ->  217
//   "Al moscardón"                                    9.68s ->  290
//   "Y eso que parece un corazón"                   12.06s ->  362
//   "Parece que mi cámara lenta"                    14.52s ->  436
//   "Ya perdió la cuenta y no está contenta"        18.48s ->  554
//   "Mi muñeco vudú se perdió en la tormenta"       22.70s ->  681
//   "Con mil alfileres clavados"                    27.24s ->  817
//   "En mi corazón en venta"                        30.02s ->  901
//   "Que nadie viene a comprarlo"                   34.44s -> 1033
//   "Mi corazón en venta"                           37.64s -> 1129
//   "Dicen que se revienta"                         42.64s -> 1279
//   "Qué versión violenta"                          45.38s -> 1361
//   "La que se cuenta por ahí" (1st)                49.96s -> 1499
//   "La que se cuenta por ahí" (2nd, repeated)      58.08s -> 1742
//
// No burn/delete effect — plain conversation, 17 lines. Uses
// AutoScrollChatLog with the shared lyric-sync layout defaults (locked
// in after Scene9).
export const BUBBLES: DarkBubble[] = [
  { from: "me", text: "Gran alfombra roja", timestamp: "19:22", atFrame: 0 },
  { from: "me", text: "Olvidar es divino", timestamp: "19:22", atFrame: 55 },
  { from: "me", text: "Y fuerte la fuerza del destino", timestamp: "19:23", atFrame: 131 },
  { from: "me", text: "Cuerda floja", timestamp: "19:23", atFrame: 217 },
  { from: "me", text: "Al moscardón", timestamp: "19:24", atFrame: 290 },
  { from: "me", text: "Y eso que parece un corazón", timestamp: "19:24", atFrame: 362 },
  { from: "me", text: "Parece que mi cámara lenta", timestamp: "19:25", atFrame: 436 },
  { from: "me", text: "Ya perdió la cuenta y no está contenta", timestamp: "19:25", atFrame: 554 },
  { from: "me", text: "Mi muñeco vudú se perdió en la tormenta", timestamp: "19:26", atFrame: 681 },
  { from: "me", text: "Con mil alfileres clavados", timestamp: "19:26", atFrame: 817 },
  { from: "me", text: "En mi corazón en venta", timestamp: "19:27", atFrame: 901 },
  { from: "me", text: "Que nadie viene a comprarlo", timestamp: "19:27", atFrame: 1033 },
  { from: "me", text: "Mi corazón en venta", timestamp: "19:28", atFrame: 1129 },
  { from: "me", text: "Dicen que se revienta", timestamp: "19:28", atFrame: 1279 },
  { from: "me", text: "Qué versión violenta", timestamp: "19:29", atFrame: 1361 },
  { from: "me", text: "La que se cuenta por ahí", timestamp: "19:29", atFrame: 1499 },
  { from: "me", text: "La que se cuenta por ahí", timestamp: "19:30", atFrame: 1742 },
];

// Last bubble's entrance settles ~15-20 frames after its atFrame — the
// composition holds a few seconds past that so the final line is
// readable before the clip ends.
export const LYRIC_SYNC_17_LAST_FRAME = 1742;

export const LyricSyncScene17: React.FC = () => {
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
