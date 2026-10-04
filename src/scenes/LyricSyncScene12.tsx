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
// the user's twelfth uploaded clip with faster-whisper (small model,
// word_timestamps=True, biased with an initial_prompt built from these
// lines). "porrito" wrapped in ~..~ per WhatsApp's own strikethrough
// markdown syntax, per the user's request to have it appear crossed out
// (renderText in DarkChatLog.tsx already supports *bold* the same way).
//
// The final line "A lo mejor resulta mejor así" was cut: the source
// clip is 67.125s and its last ~13s (from the "na na" chorus onward)
// has no discernible sung words — verified by isolating and
// re-transcribing that tail segment on its own (still no real words,
// just a hallucinated "la la la..." loop) and by confirming there IS
// real audio content there (not silence, mean volume -13.1dB vs -11.5dB
// for the full track) so it's melodic humming/instrumental, not vocals
// with that lyric. This matches the user's own heads-up that the last
// phrase might not fit ("puede q sobre la última frase, fijate").
//
// Seconds -> frames at 30fps (the project's own fps), rounded to the
// nearest frame:
//   "Voy a salir a caminar solito"                          0.00s ->    0
//   "Sentarme en un parque a fumar un porrito"               5.54s ->  166
//   "Y mirar a las palomas comer el pan que la gente les tira" 10.02s -> 301
//   "Y reprimir el instinto asesino"                         18.52s ->  556
//   "Delante de un mimo de un clown"                         22.20s ->  666
//   "Hoy estoy down violento down radical"                   25.38s ->  761
//   "Pero tengo aprendido el papel principal"                29.64s ->  889
//   "Yo soy un loco"                                         36.29s -> 1089
//   "Que se dio cuenta"                                      38.02s -> 1141
//   "Que el tiempo es muy poco"                               41.21s -> 1236
//   "Yo soy un loco" (2nd chorus repeat)                     44.14s -> 1324
//   "Que se dio cuenta" (2nd chorus repeat)                  46.88s -> 1406
//   "Que el tiempo es muy poco" (2nd chorus repeat)          48.84s -> 1465
//   "Na na na na na na, na na na na na na na na na na"       54.52s -> 1636
//   "Na na na na na na, na na na na na"                      60.14s -> 1804
//
// No burn/delete effect — plain conversation. Uses AutoScrollChatLog
// with the shared lyric-sync layout defaults (locked in after Scene9).
export const BUBBLES: DarkBubble[] = [
  { from: "me", text: "Voy a salir a caminar solito", timestamp: "21:04", atFrame: 0 },
  { from: "me", text: "Sentarme en un parque a fumar un ~porrito~", timestamp: "21:04", atFrame: 166 },
  { from: "me", text: "Y mirar a las palomas comer el pan que la gente les tira", timestamp: "21:05", atFrame: 301 },
  { from: "me", text: "Y reprimir el instinto asesino", timestamp: "21:05", atFrame: 556 },
  { from: "me", text: "Delante de un mimo de un clown", timestamp: "21:06", atFrame: 666 },
  { from: "me", text: "Hoy estoy down violento down radical", timestamp: "21:06", atFrame: 761 },
  { from: "me", text: "Pero tengo aprendido el papel principal", timestamp: "21:07", atFrame: 889 },
  { from: "me", text: "Yo soy un loco", timestamp: "21:07", atFrame: 1089 },
  { from: "me", text: "Que se dio cuenta", timestamp: "21:08", atFrame: 1141 },
  { from: "me", text: "Que el tiempo es muy poco", timestamp: "21:08", atFrame: 1236 },
  { from: "me", text: "Yo soy un loco", timestamp: "21:09", atFrame: 1324 },
  { from: "me", text: "Que se dio cuenta", timestamp: "21:09", atFrame: 1406 },
  { from: "me", text: "Que el tiempo es muy poco", timestamp: "21:10", atFrame: 1465 },
  { from: "me", text: "Na na na na na na, na na na na na na na na na na", timestamp: "21:10", atFrame: 1636 },
  { from: "me", text: "Na na na na na na, na na na na na", timestamp: "21:11", atFrame: 1804 },
];

// Last bubble's entrance settles ~15-20 frames after its atFrame — the
// composition holds a few seconds past that so the final line is
// readable before the clip ends. No fixed duration requested, so this
// uses the shared hold default (video ends where the sung/matched
// audio ends, not where the full source clip ends).
export const LYRIC_SYNC_12_LAST_FRAME = 1804;

export const LyricSyncScene12: React.FC = () => {
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
