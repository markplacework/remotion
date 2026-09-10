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

// User-supplied lines, in the exact wording given (already correctly
// accented/capitalized, no fixes needed) — transcribed word-by-word
// from the user's eleventh uploaded clip with faster-whisper (small
// model, word_timestamps=True, biased with an initial_prompt built
// from these same 29 lines). All 29 matched the transcript in full.
// Seconds -> frames at 30fps (the project's own fps), rounded to the
// nearest frame:
//   "Entre no me olvides"                     0.00s ->    0
//   "Me dejé nuestros abriles"                 1.92s ->   58
//   "Olvidados"                                4.12s ->  124
//   "En el fondo del placard"                  5.26s ->  158
//   "Del cuarto de invitados"                  7.42s ->  223
//   "Eran tiempos dorados"                     9.78s ->  293
//   "De un pasado mejor"                      11.84s ->  355
//   "Aunque casi me equivoco"                 16.58s ->  497
//   "Y te digo poco a poco"                   19.54s ->  586
//   "No me mientas"                           21.54s ->  646
//   "No me digas la verdad"                   22.96s ->  689
//   "No te quedes callada"                    24.80s ->  744
//   "No levantes la voz"                      27.18s ->  815
//   "Ni me pidas perdón"                      29.38s ->  881
//   "Aunque casi te confieso"                 31.74s ->  952
//   "Que también he sido un perro"            37.08s -> 1112
//   "Compañero"                               39.30s -> 1179
//   "Un perro ideal"                          40.22s -> 1207
//   "Que aprendió a ladrar"                   42.02s -> 1261
//   "Y a volver al hogar"                     44.16s -> 1325
//   "Para poder comer"                        46.58s -> 1397
//   "Flaca, no me claves"                     51.72s -> 1552
//   "Tus puñales por la espalda"              55.54s -> 1666
//   "Tan profundo, no me duelen"              60.06s -> 1802
//   "No me hacen mal"                         64.30s -> 1929
//   "Lejos, en el centro"                     69.52s -> 2086
//   "De la tierra, las raíces"                72.94s -> 2188
//   "Del amor, donde estaban"                 77.26s -> 2318
//   "Quedarán"                                81.52s -> 2446
//
// No burn/delete effect — plain conversation, 29 short lines (the
// longest lyric-sync scene yet), uses AutoScrollChatLog with the
// shared lyric-sync layout defaults (locked in after Scene9).
export const BUBBLES: DarkBubble[] = [
  { from: "me", text: "Entre no me olvides", timestamp: "18:02", atFrame: 0 },
  { from: "me", text: "Me dejé nuestros abriles", timestamp: "18:02", atFrame: 58 },
  { from: "me", text: "Olvidados", timestamp: "18:03", atFrame: 124 },
  { from: "me", text: "En el fondo del placard", timestamp: "18:03", atFrame: 158 },
  { from: "me", text: "Del cuarto de invitados", timestamp: "18:04", atFrame: 223 },
  { from: "me", text: "Eran tiempos dorados", timestamp: "18:04", atFrame: 293 },
  { from: "me", text: "De un pasado mejor", timestamp: "18:05", atFrame: 355 },
  { from: "me", text: "Aunque casi me equivoco", timestamp: "18:05", atFrame: 497 },
  { from: "me", text: "Y te digo poco a poco", timestamp: "18:06", atFrame: 586 },
  { from: "me", text: "No me mientas", timestamp: "18:06", atFrame: 646 },
  { from: "me", text: "No me digas la verdad", timestamp: "18:07", atFrame: 689 },
  { from: "me", text: "No te quedes callada", timestamp: "18:07", atFrame: 744 },
  { from: "me", text: "No levantes la voz", timestamp: "18:08", atFrame: 815 },
  { from: "me", text: "Ni me pidas perdón", timestamp: "18:08", atFrame: 881 },
  { from: "me", text: "Aunque casi te confieso", timestamp: "18:09", atFrame: 952 },
  { from: "me", text: "Que también he sido un perro", timestamp: "18:09", atFrame: 1112 },
  { from: "me", text: "Compañero", timestamp: "18:10", atFrame: 1179 },
  { from: "me", text: "Un perro ideal", timestamp: "18:10", atFrame: 1207 },
  { from: "me", text: "Que aprendió a ladrar", timestamp: "18:11", atFrame: 1261 },
  { from: "me", text: "Y a volver al hogar", timestamp: "18:11", atFrame: 1325 },
  { from: "me", text: "Para poder comer", timestamp: "18:12", atFrame: 1397 },
  { from: "me", text: "Flaca, no me claves", timestamp: "18:12", atFrame: 1552 },
  { from: "me", text: "Tus puñales por la espalda", timestamp: "18:13", atFrame: 1666 },
  { from: "me", text: "Tan profundo, no me duelen", timestamp: "18:13", atFrame: 1802 },
  { from: "me", text: "No me hacen mal", timestamp: "18:14", atFrame: 1929 },
  { from: "me", text: "Lejos, en el centro", timestamp: "18:14", atFrame: 2086 },
  { from: "me", text: "De la tierra, las raíces", timestamp: "18:15", atFrame: 2188 },
  { from: "me", text: "Del amor, donde estaban", timestamp: "18:15", atFrame: 2318 },
  { from: "me", text: "Quedarán", timestamp: "18:16", atFrame: 2446 },
];

// Last bubble's entrance settles ~15-20 frames after its atFrame — the
// composition holds a few seconds past that so the final line is
// readable before the clip ends.
export const LYRIC_SYNC_11_LAST_FRAME = 2446;

export const LyricSyncScene11: React.FC = () => {
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
