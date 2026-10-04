import { AbsoluteFill, Img, staticFile } from "remotion";
import { AutoScrollChatLog } from "../components/AutoScrollChatLog";
import type { DarkBubble } from "../components/DarkChatLog";

// Same real WhatsApp dark-mode wallpaper doodle used by the other
// lyric-sync scenes — generic (not song-specific), reused as-is.
const BACKGROUND_SRC = staticFile("/fake-chat/background.png");

// User-supplied lines. The user actually gave 12 lines (the chorus,
// "Quiero ser el único..." / "Quiero saber que la vida...", repeats a
// second time at the end) but the uploaded clip's audio has no
// discernible vocals in its last ~5 seconds (48-53.7s) — isolating
// just that tail and re-running the transcription on it alone still
// found nothing after "...que no está tan rota". Confirmed with the
// user: only the first 10 lines are used here, ending where the real
// audio does, rather than guessing timestamps for a repeat that can't
// be confirmed. Timestamps are the REAL sung start times, transcribed
// word-by-word from the user's eighth uploaded clip with faster-
// whisper (small model, word_timestamps=True, biased with an
// initial_prompt built from all 12 originally-given lines). All 10
// used lines matched the transcript in full. Seconds -> frames at
// 30fps (the project's own fps), rounded to the nearest frame:
//   "Déjame atravesar el viento sin documentos"        0.00s ->    0
//   "Que lo haré por el tiempo que tuvimos"             4.52s ->  136
//   "Porque no queda salida, porque pareces dormida"    9.56s ->  287
//   "Porque buscando tu sonrisa estaría toda mi vida"  14.36s ->  431
//   "Quiero ser el único que te muerda la boca"        20.00s ->  600
//   "Quiero saber que la vida contigo no va a terminar" 23.82s ->  715
//   "Déjame que te cierre esta noche los ojos"          30.14s ->  904
//   "Y mañana vendré con un cigarro a la cama"          33.42s -> 1003
//   "Porque no tengo más intenciones que seguir"        39.70s -> 1191
//   "Bebiendo de esta copa que no está tan rota"        43.44s -> 1303
//
// No burn/delete effect — plain conversation. 10 lines, uses
// AutoScrollChatLog (harmless even if nothing overflows) with the
// TikTok-safe margins (85% right edge, clear of the action column).
export const BUBBLES: DarkBubble[] = [
  { from: "me", text: "Déjame atravesar el viento sin documentos", timestamp: "10:22", atFrame: 0 },
  { from: "me", text: "Que lo haré por el tiempo que tuvimos", timestamp: "10:22", atFrame: 136 },
  { from: "me", text: "Porque no queda salida, porque pareces dormida", timestamp: "10:23", atFrame: 287 },
  { from: "me", text: "Porque buscando tu sonrisa estaría toda mi vida", timestamp: "10:23", atFrame: 431 },
  { from: "me", text: "Quiero ser el único que te muerda la boca", timestamp: "10:24", atFrame: 600 },
  { from: "me", text: "Quiero saber que la vida contigo no va a terminar", timestamp: "10:24", atFrame: 715 },
  { from: "me", text: "Déjame que te cierre esta noche los ojos", timestamp: "10:25", atFrame: 904 },
  { from: "me", text: "Y mañana vendré con un cigarro a la cama", timestamp: "10:25", atFrame: 1003 },
  { from: "me", text: "Porque no tengo más intenciones que seguir", timestamp: "10:26", atFrame: 1191 },
  { from: "me", text: "Bebiendo de esta copa que no está tan rota", timestamp: "10:26", atFrame: 1303 },
];

// Last bubble's entrance settles ~15-20 frames after its atFrame — the
// composition holds a few seconds past that so the final line is
// readable before the clip ends.
export const LYRIC_SYNC_8_LAST_FRAME = 1303;

// Pinned top/left instead of centered so lines don't start flush
// against the top edge (top/bottom margins are the TikTok-safe values
// tuned on LyricSyncScene4/5/7 — unchanged).
const CANVAS_TOP_MARGIN = 190;
const CANVAS_BOTTOM_MARGIN = 320;
const CANVAS_LEFT_MARGIN = 40;
// Nudged a few millimeters further right than the 920 TikTok-safe
// edge used on Scene7, on request.
const SAFE_RIGHT_EDGE = 935; // ~87% of the 1080-wide frame
const SCALE = 1.6;
const CONTENT_WIDTH = Math.round((SAFE_RIGHT_EDGE - CANVAS_LEFT_MARGIN) / SCALE);
const VIEWPORT_HEIGHT = Math.round((1920 - CANVAS_TOP_MARGIN - CANVAS_BOTTOM_MARGIN) / SCALE);

export const LyricSyncScene8: React.FC = () => {
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
