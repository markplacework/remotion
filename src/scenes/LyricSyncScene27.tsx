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

// New wallpaper format, continuing from LyricSync18Alt/19Alt/20-26.
const BACKGROUND_SRC = staticFile("/fake-chat/background-alt.png");

// User-supplied lines, transcribed word-by-word from the user's
// twenty-seventh uploaded clip with faster-whisper (small model,
// word_timestamps=True, biased with an initial_prompt built from
// these same 11 lines, incl. the repeated closing line twice). Four
// lines were typed lowercase (mid-sentence continuations of the line
// above) — capitalized here per the user's explicit request, the one
// deviation from their exact typed casing in this pipeline.
// All 11 matched — the forward-cursor difflib matching correctly
// resolved the repeated "Hace tiempo, otra vez..." to its own later
// occurrence at 55.36s (the second time it's sung, only "Hace tiempo,
// otra vez." plays before the song ends, cutting off the rest of the
// line, but the start time used for the bubble is accurate).
// Seconds -> frames at 30fps (the project's own fps), rounded to the
// nearest frame:
//   "Quisiera que esto dure para siempre,"                0.00s ->    0
//   "Casi tanto como una eternidad."                       5.64s ->  169
//   "Es verdad que soy una rata de ciudad,"               12.70s ->  381
//   "No tengo religión, tengo ansiedad."                  17.56s ->  527
//   "Quiero mirar por el ojo de tu cerradura."             21.96s ->  659
//   "No seas dura, la mía es pura,"                       28.42s ->  853
//   "Mi filosofía es de la calle pero es mía."            34.82s -> 1045
//   "Si contigo no se puede, mejor que no me enrede,"     41.92s -> 1258
//   "Lo que querés de mí ya lo aprendí."                  45.86s -> 1376
//   "Hace tiempo, otra vez, desde lejos no me ves." (1st) 49.58s -> 1487
//   "Hace tiempo, otra vez, desde lejos no me ves." (2nd) 55.36s -> 1661
//
// No burn/delete effect — plain conversation, 11 lines. Uses
// AutoScrollChatLog with the shared lyric-sync layout defaults (locked
// in after Scene9).
export const BUBBLES: DarkBubble[] = [
  { from: "me", text: "Quisiera que esto dure para siempre,", timestamp: "21:54", atFrame: 0 },
  { from: "me", text: "Casi tanto como una eternidad.", timestamp: "21:54", atFrame: 169 },
  { from: "me", text: "Es verdad que soy una rata de ciudad,", timestamp: "21:55", atFrame: 381 },
  { from: "me", text: "No tengo religión, tengo ansiedad.", timestamp: "21:55", atFrame: 527 },
  { from: "me", text: "Quiero mirar por el ojo de tu cerradura.", timestamp: "21:56", atFrame: 659 },
  { from: "me", text: "No seas dura, la mía es pura,", timestamp: "21:56", atFrame: 853 },
  { from: "me", text: "Mi filosofía es de la calle pero es mía.", timestamp: "21:57", atFrame: 1045 },
  { from: "me", text: "Si contigo no se puede, mejor que no me enrede,", timestamp: "21:57", atFrame: 1258 },
  { from: "me", text: "Lo que querés de mí ya lo aprendí.", timestamp: "21:58", atFrame: 1376 },
  { from: "me", text: "Hace tiempo, otra vez, desde lejos no me ves.", timestamp: "21:58", atFrame: 1487 },
  { from: "me", text: "Hace tiempo, otra vez, desde lejos no me ves.", timestamp: "21:59", atFrame: 1661 },
];

// Last bubble's entrance settles ~15-20 frames after its atFrame — the
// composition holds a few seconds past that so the final line is
// readable before the clip ends.
export const LYRIC_SYNC_27_LAST_FRAME = 1661;

export const LyricSyncScene27: React.FC = () => {
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
