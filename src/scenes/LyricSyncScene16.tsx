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
// the user's sixteenth uploaded clip with faster-whisper (small
// model, word_timestamps=True, biased with an initial_prompt built
// from these same 10 lines). All 10 matched the transcript in full,
// no repeats, no gaps. The song then repeats "Yo no sé... todo lo que
// fuimos, hasta el amanecer" once more as an outro after the last
// line (not re-added as its own bubble — the user asked for the last
// ~16s to just play the music with no new bubbles).
// Seconds -> frames at 30fps (the project's own fps), rounded to the
// nearest frame:
//   "Yo no sé todavía"                    0.00s ->    0
//   "Lo que me hiciste sentir"             2.94s ->   88
//   "Es como la fiebre cuando quema"       9.00s ->  270
//   "Si la nube que arrastrás"            12.56s ->  377
//   "Llegará a un sitio final"            18.22s ->  547
//   "¿Cuanto tiempo guardas un secreto?"  23.30s ->  699
//   "Será por ti"                         29.82s ->  895
//   "Será por mí"                         31.96s ->  959
//   "Será por todo lo que fuimos"         33.90s -> 1017
//   "Hasta el amanecer"                   38.38s -> 1151
//
// No burn/delete effect — plain conversation, 10 lines. Uses
// AutoScrollChatLog with the shared lyric-sync layout defaults (locked
// in after Scene9). Fixed 58s total duration requested by the user
// (see LyricSync16.tsx) so the music plays solo after the last bubble
// instead of the standard natural-pacing hold.
export const BUBBLES: DarkBubble[] = [
  { from: "me", text: "Yo no sé todavía", timestamp: "20:07", atFrame: 0 },
  { from: "me", text: "Lo que me hiciste sentir", timestamp: "20:07", atFrame: 88 },
  { from: "me", text: "Es como la fiebre cuando quema", timestamp: "20:08", atFrame: 270 },
  { from: "me", text: "Si la nube que arrastrás", timestamp: "20:08", atFrame: 377 },
  { from: "me", text: "Llegará a un sitio final", timestamp: "20:09", atFrame: 547 },
  { from: "me", text: "¿Cuanto tiempo guardas un secreto?", timestamp: "20:09", atFrame: 699 },
  { from: "me", text: "Será por ti", timestamp: "20:10", atFrame: 895 },
  { from: "me", text: "Será por mí", timestamp: "20:10", atFrame: 959 },
  { from: "me", text: "Será por todo lo que fuimos", timestamp: "20:11", atFrame: 1017 },
  { from: "me", text: "Hasta el amanecer", timestamp: "20:11", atFrame: 1151 },
];

// Last bubble's natural entrance settles here, but the composition's
// actual total duration is a fixed 58s per the user's request (see
// LyricSync16.tsx) — not this + the standard hold.
export const LYRIC_SYNC_16_LAST_FRAME = 1151;

export const LyricSyncScene16: React.FC = () => {
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
