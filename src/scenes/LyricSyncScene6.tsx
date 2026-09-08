import { AbsoluteFill, Img, staticFile } from "remotion";
import { AutoScrollChatLog } from "../components/AutoScrollChatLog";
import type { DarkBubble } from "../components/DarkChatLog";

// Same real WhatsApp dark-mode wallpaper doodle used by the other
// lyric-sync scenes — generic (not song-specific), reused as-is.
const BACKGROUND_SRC = staticFile("/fake-chat/background.png");

// User-supplied lines, in the exact wording given (already correctly
// accented/capitalized, no fixes needed this time) — transcribed
// word-by-word from the user's sixth uploaded clip with faster-whisper
// (small model, word_timestamps=True, biased with an initial_prompt
// built from these same 8 lines). All 8 matched the transcript in
// full, including the two repeated couplets (lines 1-2 recur at lines
// 5-6) — the forward-only search cursor resolved each repeat to its
// own later occurrence rather than both landing on the first. Seconds
// -> frames at 30fps (the project's own fps, not the clip's — it's
// actually a square 576x576 source, audio-only timing matters here),
// rounded to the nearest frame:
//   "Y en el fondo es tan hondo mi dolor"    0.00s ->   0
//   "Porque me voy y no se puede cambiar"    3.42s -> 103
//   "De corazón como de sombrero"            7.74s -> 232
//   "Sin haber sufrido primero"              12.18s -> 365
//   "En el fondo es tan hondo mi dolor"      15.96s -> 479
//   "Porque me voy y no se puede cambiar"    19.14s -> 574
//   "De corazón como de camisa"              23.30s -> 699
//   "Sin perder la sonrisa"                  27.80s -> 834
//
// No burn/delete effect — plain conversation. Only 8 lines, short
// enough to likely fit on one screen, but uses AutoScrollChatLog
// anyway (it simply doesn't scroll if nothing overflows) for the same
// TikTok-safe margins tuned on the 4th/5th lyric-sync clips.
export const BUBBLES: DarkBubble[] = [
  { from: "me", text: "Y en el fondo es tan hondo mi dolor", timestamp: "19:40", atFrame: 0 },
  { from: "me", text: "Porque me voy y no se puede cambiar", timestamp: "19:40", atFrame: 103 },
  { from: "me", text: "De corazón como de sombrero", timestamp: "19:41", atFrame: 232 },
  { from: "me", text: "Sin haber sufrido primero", timestamp: "19:41", atFrame: 365 },
  { from: "me", text: "En el fondo es tan hondo mi dolor", timestamp: "19:42", atFrame: 479 },
  { from: "me", text: "Porque me voy y no se puede cambiar", timestamp: "19:42", atFrame: 574 },
  { from: "me", text: "De corazón como de camisa", timestamp: "19:43", atFrame: 699 },
  { from: "me", text: "Sin perder la sonrisa", timestamp: "19:43", atFrame: 834 },
];

// Last bubble's entrance settles ~15-20 frames after its atFrame — the
// composition holds a few seconds past that so the final line is
// readable before the clip ends.
export const LYRIC_SYNC_6_LAST_FRAME = 834;

// Same TikTok-safe margins tuned on LyricSyncScene4/5: pinned top/left
// instead of centered so lines don't start flush against the top
// edge, and the right edge stays clear of TikTok's own action column.
const CANVAS_TOP_MARGIN = 190;
const CANVAS_BOTTOM_MARGIN = 320;
const CANVAS_LEFT_MARGIN = 40;
const SAFE_RIGHT_EDGE = 920; // ~85% of the 1080-wide frame
const SCALE = 1.6;
const CONTENT_WIDTH = Math.round((SAFE_RIGHT_EDGE - CANVAS_LEFT_MARGIN) / SCALE);
const VIEWPORT_HEIGHT = Math.round((1920 - CANVAS_TOP_MARGIN - CANVAS_BOTTOM_MARGIN) / SCALE);

export const LyricSyncScene6: React.FC = () => {
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
