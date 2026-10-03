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

// New wallpaper format, continuing from LyricSync18Alt/19Alt/20-27.
const BACKGROUND_SRC = staticFile("/fake-chat/background-alt.png");

// User-supplied lines, exact wording — transcribed word-by-word from
// the user's twenty-eighth uploaded clip with faster-whisper (small
// model, word_timestamps=True, biased with an initial_prompt built
// from all 18 lines the user gave, including the repeated 4-line
// chorus at the end). The first 13 lines plus "Uoh-oh-oh" matched
// cleanly. The repeated chorus after that (the last 4 lines) did NOT
// match — verified this isn't a timing coincidence: isolating that
// tail (73s-95.6s) and re-transcribing it, both with a chorus-biased
// prompt and fully unbiased, produced no real words (unbiased pass
// hallucinated English filler like "For the sun" with near-zero
// confidence and absurd multi-second word spans, the classic pattern
// for wordless vocalizing/humming rather than clearly sung lyrics).
// There IS real audio there (tail mean volume -13.1dB vs -12.0dB for
// the whole track, not silence) — it's just not a clean match for the
// exact repeated lines, so no bubbles were added for it.
// Seconds -> frames at 30fps (the project's own fps), rounded to the
// nearest frame:
//   "¿Cómo escapar?"                                  0.00s ->    0
//   "Nada real me importa conocer"                     3.74s ->  112
//   "Solo esperaré hasta dormir"                       7.36s ->  221
//   "Estoy aquí"                                      16.64s ->  499
//   "Frente al gran espejo para convencer"            18.96s ->  569
//   "A los duendes que dirán"                         23.40s ->  702
//   "Cómo llegar"                                     29.14s ->  874
//   "A aprender el hechizo ideal"                     30.78s ->  923
//   "Que junte los sueños con la realidad"            34.48s -> 1034
//   "Y por las noches puedo sentir su calor"          41.46s -> 1244
//   "Su dulce magia me hace perder la razón"          48.48s -> 1454
//   "Y de mis sueños creo que un día escapó"          58.14s -> 1744
//   "Para esconderse dentro de mi corazón"            64.34s -> 1930
//   "Uoh-oh-oh"                                       73.00s -> 2190
//
// No burn/delete effect — plain conversation. Uses AutoScrollChatLog
// with the shared lyric-sync layout defaults (locked in after Scene9).
export const BUBBLES: DarkBubble[] = [
  { from: "me", text: "¿Cómo escapar?", timestamp: "00:41", atFrame: 0 },
  { from: "me", text: "Nada real me importa conocer", timestamp: "00:41", atFrame: 112 },
  { from: "me", text: "Solo esperaré hasta dormir", timestamp: "00:42", atFrame: 221 },
  { from: "me", text: "Estoy aquí", timestamp: "00:42", atFrame: 499 },
  { from: "me", text: "Frente al gran espejo para convencer", timestamp: "00:43", atFrame: 569 },
  { from: "me", text: "A los duendes que dirán", timestamp: "00:43", atFrame: 702 },
  { from: "me", text: "Cómo llegar", timestamp: "00:44", atFrame: 874 },
  { from: "me", text: "A aprender el hechizo ideal", timestamp: "00:44", atFrame: 923 },
  { from: "me", text: "Que junte los sueños con la realidad", timestamp: "00:45", atFrame: 1034 },
  { from: "me", text: "Y por las noches puedo sentir su calor", timestamp: "00:45", atFrame: 1244 },
  { from: "me", text: "Su dulce magia me hace perder la razón", timestamp: "00:46", atFrame: 1454 },
  { from: "me", text: "Y de mis sueños creo que un día escapó", timestamp: "00:46", atFrame: 1744 },
  { from: "me", text: "Para esconderse dentro de mi corazón", timestamp: "00:47", atFrame: 1930 },
  { from: "me", text: "Uoh-oh-oh", timestamp: "00:47", atFrame: 2190 },
];

// Last bubble's entrance settles ~15-20 frames after its atFrame — the
// composition holds a few seconds past that so the final line is
// readable before the clip ends.
export const LYRIC_SYNC_28_LAST_FRAME = 2190;

export const LyricSyncScene28: React.FC = () => {
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
