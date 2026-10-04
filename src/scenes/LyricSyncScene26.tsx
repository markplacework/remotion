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

// New wallpaper format, continuing from LyricSync18Alt/19Alt/20-25.
const BACKGROUND_SRC = staticFile("/fake-chat/background-alt.png");

// User-supplied lines, exact wording (incl. quotation marks around the
// graffiti lines and the trailing period on "uoh.") — transcribed
// word-by-word from the user's twenty-sixth uploaded clip with
// faster-whisper (small model, word_timestamps=True, biased with an
// initial_prompt built from these same 8 lines). All 8 matched the
// transcript in full, no repeats, no gaps.
// Seconds -> frames at 30fps (the project's own fps), rounded to the
// nearest frame:
//   "Contra una pared dejé pintados"            0.00s ->    0
//   "Nuestros nombres enlazados"                 4.90s ->  147
//   "Salpicados con el aerosol"                  8.38s ->  251
//   "Y junto a una leyenda que decía:"          12.62s ->  379
//   "\"Escapemos de esta vida"                   18.76s ->  563
//   "Viva el Che y los Rolling Stones\"."        22.26s ->  668
//   "Y me alejé de ti"                           28.56s ->  857
//   "Suerte que te perdí, uoh."                  33.12s ->  994
//
// No burn/delete effect — plain conversation, 8 lines. Uses
// AutoScrollChatLog with the shared lyric-sync layout defaults (locked
// in after Scene9).
export const BUBBLES: DarkBubble[] = [
  { from: "me", text: "Contra una pared dejé pintados", timestamp: "11:02", atFrame: 0 },
  { from: "me", text: "Nuestros nombres enlazados", timestamp: "11:02", atFrame: 147 },
  { from: "me", text: "Salpicados con el aerosol", timestamp: "11:03", atFrame: 251 },
  { from: "me", text: "Y junto a una leyenda que decía:", timestamp: "11:03", atFrame: 379 },
  { from: "me", text: "\"Escapemos de esta vida", timestamp: "11:04", atFrame: 563 },
  { from: "me", text: "Viva el Che y los Rolling Stones\".", timestamp: "11:04", atFrame: 668 },
  { from: "me", text: "Y me alejé de ti", timestamp: "11:05", atFrame: 857 },
  { from: "me", text: "Suerte que te perdí, uoh.", timestamp: "11:05", atFrame: 994 },
];

// Last bubble's entrance settles ~15-20 frames after its atFrame — the
// composition holds a few seconds past that so the final line is
// readable before the clip ends.
export const LYRIC_SYNC_26_LAST_FRAME = 994;

export const LyricSyncScene26: React.FC = () => {
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
