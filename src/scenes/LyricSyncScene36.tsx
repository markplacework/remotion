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

// New wallpaper format, continuing from LyricSync18Alt/19Alt/20-35.
const BACKGROUND_SRC = staticFile("/fake-chat/background-alt.png");

// User-supplied lines, exact wording — transcribed word-by-word from the
// user's thirty-sixth uploaded clip with faster-whisper (small model,
// word_timestamps=True, biased with an initial_prompt built from all 16
// typed lines). 14 of 16 matched cleanly in a single full-clip pass, in
// order. The final repeated "Y lo demás" / "Francamente no importa"
// (the chorus, already used once earlier) didn't match — the full clip
// is only 60.65s and the matched transcript already runs to 60.04s, so
// there isn't room left for two more lines. Isolated the 53s-60.65s tail
// and re-transcribed it alone, unbiased, to check: it transcribed
// cleanly as just "A prueba y error, la vida es un momento" ending at
// 60.08s, confirming the second chorus repeat isn't present in this
// clip — dropped rather than guessed, per the no-guessing rule.
//
// Seconds -> frames at 30fps (the project's own fps), rounded to the
// nearest frame:
//   "Día a día aprendiendo a ser"          0.00s ->    0
//   "Miro hacia atrás"                      4.46s ->  134
//   "Y todo el camino hecho"                7.82s ->  235
//   "Lo que pudo ser y lo que fue"         11.78s ->  353
//   "Mi oportunidad"                       17.00s ->  510
//   "De comenzar de nuevo"                 19.58s ->  587
//   "Y lo demás"                           24.02s ->  721
//   "Francamente no importa"               27.40s ->  822
//   "¿Quién fui todo este tiempo? No sé"   36.24s -> 1087
//   "¿Quién soy o seré?"                   40.86s -> 1226
//   "¿Habré cumplido un sueño?"            45.02s -> 1351
//   "Intentando la felicidad"              49.38s -> 1481
//   "A prueba y error"                     53.10s -> 1593
//   "La vida es un momento"                56.32s -> 1690
//
// No burn/delete effect — plain conversation, 14 lines (16 typed, minus
// the one repeated chorus pair confirmed absent from the clip). Uses
// AutoScrollChatLog with the shared lyric-sync layout defaults (locked
// in after Scene9).
export const BUBBLES: DarkBubble[] = [
  { from: "me", text: "Día a día aprendiendo a ser", timestamp: "22:04", atFrame: 0 },
  { from: "me", text: "Miro hacia atrás", timestamp: "22:04", atFrame: 134 },
  { from: "me", text: "Y todo el camino hecho", timestamp: "22:04", atFrame: 235 },
  { from: "me", text: "Lo que pudo ser y lo que fue", timestamp: "22:05", atFrame: 353 },
  { from: "me", text: "Mi oportunidad", timestamp: "22:05", atFrame: 510 },
  { from: "me", text: "De comenzar de nuevo", timestamp: "22:05", atFrame: 587 },
  { from: "me", text: "Y lo demás", timestamp: "22:06", atFrame: 721 },
  { from: "me", text: "Francamente no importa", timestamp: "22:06", atFrame: 822 },
  { from: "me", text: "¿Quién fui todo este tiempo? No sé", timestamp: "22:07", atFrame: 1087 },
  { from: "me", text: "¿Quién soy o seré?", timestamp: "22:07", atFrame: 1226 },
  { from: "me", text: "¿Habré cumplido un sueño?", timestamp: "22:08", atFrame: 1351 },
  { from: "me", text: "Intentando la felicidad", timestamp: "22:08", atFrame: 1481 },
  { from: "me", text: "A prueba y error", timestamp: "22:09", atFrame: 1593 },
  { from: "me", text: "La vida es un momento", timestamp: "22:09", atFrame: 1690 },
];

// Last bubble's entrance settles ~15-20 frames after its atFrame — the
// composition holds a few seconds past that so the final line is
// readable before the clip ends.
export const LYRIC_SYNC_36_LAST_FRAME = 1690;

export const LyricSyncScene36: React.FC = () => {
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
