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

// New wallpaper format, continuing from LyricSync18Alt/19Alt/20/21/22/23.
const BACKGROUND_SRC = staticFile("/fake-chat/background-alt.png");

// User-supplied lines, exact wording — transcribed word-by-word from
// the user's twenty-fourth uploaded clip with faster-whisper (small
// model, word_timestamps=True, biased with an initial_prompt built
// from these same 14 lines). All 14 matched the transcript in full,
// no repeats, no gaps.
// Seconds -> frames at 30fps (the project's own fps), rounded to the
// nearest frame:
//   "Te vas, amor"                                              0.00s ->    0
//   "Si así lo quieres, ¿qué puedo yo hacer?"                    1.62s ->   49
//   "Tu vanidad no te deja entender"                             6.44s ->  193
//   "Que en la pobreza se sabe querer"                           9.44s ->  283
//   "Quiero llorar"                                             15.98s ->  479
//   "Y me destroza que pienses así"                             17.82s ->  535
//   "Y más que ahora me quedé sin ti"                           21.86s ->  656
//   "Me duele lo que tú vas a sufrir"                           26.12s ->  784
//   "Pero recuerda, nadie es perfecto y tú lo verás"            32.58s ->  977
//   "Más de mil cosas mejores tendrás"                          39.06s -> 1172
//   "Pero cariño sincero jamás"                                 42.54s -> 1276
//   "Vete olvidando de esto que hoy dejas y que cambiarás"      48.14s -> 1444
//   "Por la aventura que tú ya verás"                           54.88s -> 1646
//   "Será tu cárcel y nunca saldrás"                            58.96s -> 1769
//
// No burn/delete effect — plain conversation, 14 lines. Uses
// AutoScrollChatLog with the shared lyric-sync layout defaults (locked
// in after Scene9).
export const BUBBLES: DarkBubble[] = [
  { from: "me", text: "Te vas, amor", timestamp: "19:11", atFrame: 0 },
  { from: "me", text: "Si así lo quieres, ¿qué puedo yo hacer?", timestamp: "19:11", atFrame: 49 },
  { from: "me", text: "Tu vanidad no te deja entender", timestamp: "19:12", atFrame: 193 },
  { from: "me", text: "Que en la pobreza se sabe querer", timestamp: "19:12", atFrame: 283 },
  { from: "me", text: "Quiero llorar", timestamp: "19:13", atFrame: 479 },
  { from: "me", text: "Y me destroza que pienses así", timestamp: "19:13", atFrame: 535 },
  { from: "me", text: "Y más que ahora me quedé sin ti", timestamp: "19:14", atFrame: 656 },
  { from: "me", text: "Me duele lo que tú vas a sufrir", timestamp: "19:14", atFrame: 784 },
  { from: "me", text: "Pero recuerda, nadie es perfecto y tú lo verás", timestamp: "19:15", atFrame: 977 },
  { from: "me", text: "Más de mil cosas mejores tendrás", timestamp: "19:15", atFrame: 1172 },
  { from: "me", text: "Pero cariño sincero jamás", timestamp: "19:16", atFrame: 1276 },
  { from: "me", text: "Vete olvidando de esto que hoy dejas y que cambiarás", timestamp: "19:16", atFrame: 1444 },
  { from: "me", text: "Por la aventura que tú ya verás", timestamp: "19:17", atFrame: 1646 },
  { from: "me", text: "Será tu cárcel y nunca saldrás", timestamp: "19:17", atFrame: 1769 },
];

// Last bubble's entrance settles ~15-20 frames after its atFrame — the
// composition holds a few seconds past that so the final line is
// readable before the clip ends.
export const LYRIC_SYNC_24_LAST_FRAME = 1769;

export const LyricSyncScene24: React.FC = () => {
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
