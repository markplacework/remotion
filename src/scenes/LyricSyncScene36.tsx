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

// User-supplied lines, exact wording, one bubble per line. Audio-only
// upload (a remix .m4a, no video/subtitles to cross-check against).
// Timing: two faster-whisper passes (small, word_timestamps=True) — one
// on the full mix with the lyrics as a comma-joined initial_prompt, one
// UNPROMPTED on the demucs-isolated vocals — which agree closely on the
// words. Each line is anchored on its second word (the first word is
// the one Whisper tends to stretch back into the previous gap), then
// placed at the vocal onset just before it. Lines whose first word is
// sung alone before a long pause ("De... esta cruel", "Es... cuando")
// start where both transcripts put that first word.
// Seconds -> frames at 30fps (the project's own fps):
//   "Hoy que todo parece que va mal"       0.90s ->   27
//   "Y solo estoy,"                        6.30s ->  189
//   "El sentido a la vida"                11.70s ->  351
//   "Lo he perdido"                       15.10s ->  453
//   "Y no sé dónde está."                 17.35s ->  520
//   "Cómo poder librarme"                 22.60s ->  678
//   "De esta cruel sensación"             25.00s ->  750
//   "Que me envuelve y me atrapa"         33.90s -> 1017
//   "Nuevamente, otra vez."               36.50s -> 1095
//   "No quiero irme sin hablar,"          45.60s -> 1368
//   "No quiero irme sin soñar,"           51.00s -> 1530
//   "Mientras más oscura sea la noche"    55.80s -> 1674
//   "Es cuando el día más cerca está."    61.00s -> 1830
//
// No burn/delete effect — plain conversation, 13 lines. Uses
// AutoScrollChatLog with the shared lyric-sync layout defaults (locked
// in after Scene9).
export const BUBBLES: DarkBubble[] = [
  { from: "me", text: "Hoy que todo parece que va mal", timestamp: "03:07", atFrame: 27 },
  { from: "me", text: "Y solo estoy,", timestamp: "03:07", atFrame: 189 },
  { from: "me", text: "El sentido a la vida", timestamp: "03:07", atFrame: 351 },
  { from: "me", text: "Lo he perdido", timestamp: "03:08", atFrame: 453 },
  { from: "me", text: "Y no sé dónde está.", timestamp: "03:08", atFrame: 520 },
  { from: "me", text: "Cómo poder librarme", timestamp: "03:08", atFrame: 678 },
  { from: "me", text: "De esta cruel sensación", timestamp: "03:09", atFrame: 750 },
  { from: "me", text: "Que me envuelve y me atrapa", timestamp: "03:09", atFrame: 1017 },
  { from: "me", text: "Nuevamente, otra vez.", timestamp: "03:09", atFrame: 1095 },
  { from: "me", text: "No quiero irme sin hablar,", timestamp: "03:10", atFrame: 1368 },
  { from: "me", text: "No quiero irme sin soñar,", timestamp: "03:10", atFrame: 1530 },
  { from: "me", text: "Mientras más oscura sea la noche", timestamp: "03:11", atFrame: 1674 },
  { from: "me", text: "Es cuando el día más cerca está.", timestamp: "03:11", atFrame: 1830 },
];

// Last bubble's entrance settles ~15-20 frames after its atFrame — the
// composition holds a few seconds past that so the final line is
// readable before the clip ends.
export const LYRIC_SYNC_36_LAST_FRAME = 1830;

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
