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

// New wallpaper format, continuing from LyricSync18Alt/19Alt/20-24.
const BACKGROUND_SRC = staticFile("/fake-chat/background-alt.png");

// User-supplied lines, exact wording — transcribed word-by-word from
// the user's twenty-fifth uploaded clip with faster-whisper (small
// model, word_timestamps=True, biased with an initial_prompt built
// from these same 17 lines). All 17 matched the transcript in full —
// the forward-cursor difflib matching correctly resolved the repeated
// "De esperar" / "No existe el olvido" phrases to their own distinct
// later occurrences.
// Seconds -> frames at 30fps (the project's own fps), rounded to the
// nearest frame:
//   "Un hombre de frente a una ventana"        0.00s ->    0
//   "Súper lúcida la mirada"                    6.60s ->  198
//   "Recorre el paisaje y no"                   9.90s ->  297
//   "No es su interior, es luna"               12.96s ->  389
//   "Son sombras lejanas del bosque"           17.00s ->  510
//   "Es algo raro en las estrellas"            20.08s ->  602
//   "Sonidos que inducen temor"                23.52s ->  706
//   "Y también melancolía de esperar"          26.34s ->  790
//   "De esperar"                               30.84s ->  925
//   "De esperar que ella vuelva"               33.26s ->  998
//   "Y le diga acá estoy mi amor"              36.30s -> 1089
//   "No existe el olvido"                      40.14s -> 1204
//   "Acá estoy mi amor de vuelta"              42.72s -> 1282
//   "He venido"                                46.02s -> 1381
//   "Lo puedes creer"                          47.78s -> 1433
//   "No existe el olvido, mi amor"             50.22s -> 1507
//   "No existe"                                53.04s -> 1591
//
// No burn/delete effect — plain conversation, 17 lines. Uses
// AutoScrollChatLog with the shared lyric-sync layout defaults (locked
// in after Scene9).
export const BUBBLES: DarkBubble[] = [
  { from: "me", text: "Un hombre de frente a una ventana", timestamp: "22:41", atFrame: 0 },
  { from: "me", text: "Súper lúcida la mirada", timestamp: "22:41", atFrame: 198 },
  { from: "me", text: "Recorre el paisaje y no", timestamp: "22:42", atFrame: 297 },
  { from: "me", text: "No es su interior, es luna", timestamp: "22:42", atFrame: 389 },
  { from: "me", text: "Son sombras lejanas del bosque", timestamp: "22:43", atFrame: 510 },
  { from: "me", text: "Es algo raro en las estrellas", timestamp: "22:43", atFrame: 602 },
  { from: "me", text: "Sonidos que inducen temor", timestamp: "22:44", atFrame: 706 },
  { from: "me", text: "Y también melancolía de esperar", timestamp: "22:44", atFrame: 790 },
  { from: "me", text: "De esperar", timestamp: "22:45", atFrame: 925 },
  { from: "me", text: "De esperar que ella vuelva", timestamp: "22:45", atFrame: 998 },
  { from: "me", text: "Y le diga acá estoy mi amor", timestamp: "22:46", atFrame: 1089 },
  { from: "me", text: "No existe el olvido", timestamp: "22:46", atFrame: 1204 },
  { from: "me", text: "Acá estoy mi amor de vuelta", timestamp: "22:47", atFrame: 1282 },
  { from: "me", text: "He venido", timestamp: "22:47", atFrame: 1381 },
  { from: "me", text: "Lo puedes creer", timestamp: "22:48", atFrame: 1433 },
  { from: "me", text: "No existe el olvido, mi amor", timestamp: "22:48", atFrame: 1507 },
  { from: "me", text: "No existe", timestamp: "22:49", atFrame: 1591 },
];

// Last bubble's entrance settles ~15-20 frames after its atFrame — the
// composition holds a few seconds past that so the final line is
// readable before the clip ends.
export const LYRIC_SYNC_25_LAST_FRAME = 1591;

export const LyricSyncScene25: React.FC = () => {
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
