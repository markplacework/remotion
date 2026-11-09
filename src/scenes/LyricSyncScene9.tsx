import { AbsoluteFill, Img, staticFile } from "remotion";
import { AutoScrollChatLog } from "../components/AutoScrollChatLog";
import type { DarkBubble } from "../components/DarkChatLog";

// Same real WhatsApp dark-mode wallpaper doodle used by the other
// lyric-sync scenes — generic (not song-specific), reused as-is.
const BACKGROUND_SRC = staticFile("/fake-chat/background.png");

// User-supplied lines, in the exact wording given (already correctly
// accented/capitalized, no fixes needed) — transcribed word-by-word
// from the user's ninth uploaded clip with faster-whisper (small
// model, word_timestamps=True, biased with an initial_prompt built
// from these same 15 lines). All 15 matched the transcript in full —
// including the refrain "Cuando no estás", which recurs 6 times
// (lines 1, 3, 5, 7, 11, 14) plus twice more inside line 10 itself;
// the forward-only search cursor resolved every recurrence to its own
// later occurrence rather than repeatedly landing on the first.
// Seconds -> frames at 30fps (the project's own fps), rounded to the
// nearest frame:
//   "Cuando no estás"                                    0.00s ->    0
//   "O me encuentro en otro lugar del mundo"              1.02s ->   31
//   "Cuando no estás"                                     4.14s ->  124
//   "Me equivoco cada medio segundo"                      5.78s ->  173
//   "Cuando no estás"                                     8.86s ->  266
//   "La soledad me aconseja mal"                         10.84s ->  325
//   "Cuando no estás"                                    17.35s ->  521
//   "No se abre el paracaídas y salto igual"             19.18s ->  575
//   "Y me pierdo en habitaciones vacías"                 24.16s ->  725
//   "Cuando no estás, cuando no estás conmigo"           27.38s ->  821
//   "Cuando no estás"                                    34.82s -> 1045
//   "La casa vacía pregunta: ¿Cuándo volverás?"          37.64s -> 1129
//   "Y escribo versos crueles conmigo"                   42.94s -> 1288
//   "Cuando no estás"                                    45.42s -> 1363
//   "Estoy esperando que vuelvas"                        47.84s -> 1435
//
// No burn/delete effect — plain conversation. Uses AutoScrollChatLog
// with the current default right-side margin (~87% of frame width).
export const BUBBLES: DarkBubble[] = [
  { from: "me", text: "Cuando no estás", timestamp: "23:08", atFrame: 0 },
  { from: "me", text: "O me encuentro en otro lugar del mundo", timestamp: "23:08", atFrame: 31 },
  { from: "me", text: "Cuando no estás", timestamp: "23:09", atFrame: 124 },
  { from: "me", text: "Me equivoco cada medio segundo", timestamp: "23:09", atFrame: 173 },
  { from: "me", text: "Cuando no estás", timestamp: "23:10", atFrame: 266 },
  { from: "me", text: "La soledad me aconseja mal", timestamp: "23:10", atFrame: 325 },
  { from: "me", text: "Cuando no estás", timestamp: "23:11", atFrame: 521 },
  { from: "me", text: "No se abre el paracaídas y salto igual", timestamp: "23:11", atFrame: 575 },
  { from: "me", text: "Y me pierdo en habitaciones vacías", timestamp: "23:12", atFrame: 725 },
  { from: "me", text: "Cuando no estás, cuando no estás conmigo", timestamp: "23:12", atFrame: 821 },
  { from: "me", text: "Cuando no estás", timestamp: "23:13", atFrame: 1045 },
  { from: "me", text: "La casa vacía pregunta: ¿Cuándo volverás?", timestamp: "23:13", atFrame: 1129 },
  { from: "me", text: "Y escribo versos crueles conmigo", timestamp: "23:14", atFrame: 1288 },
  { from: "me", text: "Cuando no estás", timestamp: "23:14", atFrame: 1363 },
  { from: "me", text: "Estoy esperando que vuelvas", timestamp: "23:15", atFrame: 1435 },
];

// TikTok-safe-ish margins, current defaults (top/bottom tuned on
// Scene4/5/7, right edge nudged to ~87% per the latest request).
const CANVAS_TOP_MARGIN = 190;
const CANVAS_BOTTOM_MARGIN = 320;
const CANVAS_LEFT_MARGIN = 40;
const SAFE_RIGHT_EDGE = 935; // ~87% of the 1080-wide frame
const SCALE = 1.6;
const CONTENT_WIDTH = Math.round((SAFE_RIGHT_EDGE - CANVAS_LEFT_MARGIN) / SCALE);
const VIEWPORT_HEIGHT = Math.round((1920 - CANVAS_TOP_MARGIN - CANVAS_BOTTOM_MARGIN) / SCALE);

export const LyricSyncScene9: React.FC = () => {
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
          paddingTop: CANVAS_TOP_MARGIN,
          paddingLeft: CANVAS_LEFT_MARGIN,
        }}
      >
        <div style={{ transform: `scale(${SCALE})`, transformOrigin: "top left" }}>
          <AutoScrollChatLog
            bubbles={BUBBLES}
            viewportHeight={VIEWPORT_HEIGHT}
            width={CONTENT_WIDTH}
            dateLabel="Hoy"
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
