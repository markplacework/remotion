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

// User asked for "el último formato" — the alternate wallpaper tried
// out on LyricSyncScene18Alt.tsx, now carried forward here. Margins,
// bubble styling, etc. are unchanged (all still from
// lyricSyncDefaults.ts), only the wallpaper differs from the
// original background.png.
const BACKGROUND_SRC = staticFile("/fake-chat/background-alt.png");

// User-supplied lines, exact wording — transcribed word-by-word from
// the user's twentieth uploaded clip with faster-whisper (small
// model, word_timestamps=True, biased with an initial_prompt built
// from these same 8 lines). All 8 matched the transcript in full, no
// repeats, no gaps.
// Seconds -> frames at 30fps (the project's own fps), rounded to the
// nearest frame:
//   "Tiempo al tiempo"                       0.00s ->   0
//   "Tengo que esperar"                      1.54s ->  46
//   "Es la idea, suele condenar"             3.68s -> 110
//   "Tu mirada vuelve a penetrar"           12.70s -> 381
//   "Mis pupilas lejanas"                   16.64s -> 499
//   "A ver si todo acaba aquí"              19.36s -> 581
//   "Uhh, no me dejes morir así"            25.20s -> 756
//   "Uhh, no me dejes caer en la trampa"    30.86s -> 926
//
// No burn/delete effect — plain conversation, 8 lines. Uses
// AutoScrollChatLog with the shared lyric-sync layout defaults (locked
// in after Scene9).
export const BUBBLES: DarkBubble[] = [
  { from: "me", text: "Tiempo al tiempo", timestamp: "20:14", atFrame: 0 },
  { from: "me", text: "Tengo que esperar", timestamp: "20:14", atFrame: 46 },
  { from: "me", text: "Es la idea, suele condenar", timestamp: "20:15", atFrame: 110 },
  { from: "me", text: "Tu mirada vuelve a penetrar", timestamp: "20:15", atFrame: 381 },
  { from: "me", text: "Mis pupilas lejanas", timestamp: "20:16", atFrame: 499 },
  { from: "me", text: "A ver si todo acaba aquí", timestamp: "20:16", atFrame: 581 },
  { from: "me", text: "Uhh, no me dejes morir así", timestamp: "20:17", atFrame: 756 },
  { from: "me", text: "Uhh, no me dejes caer en la trampa", timestamp: "20:17", atFrame: 926 },
];

// Last bubble's entrance settles ~15-20 frames after its atFrame — the
// composition holds a few seconds past that so the final line is
// readable before the clip ends.
export const LYRIC_SYNC_20_LAST_FRAME = 926;

export const LyricSyncScene20: React.FC = () => {
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
