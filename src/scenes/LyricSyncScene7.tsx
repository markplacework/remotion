import { AbsoluteFill, Img, staticFile } from "remotion";
import { AutoScrollChatLog } from "../components/AutoScrollChatLog";
import type { DarkBubble } from "../components/DarkChatLog";

// Same real WhatsApp dark-mode wallpaper doodle used by the other
// lyric-sync scenes — generic (not song-specific), reused as-is.
const BACKGROUND_SRC = staticFile("/fake-chat/background.png");

// User-supplied lines, in the exact wording given (already correctly
// accented/capitalized, no fixes needed) — transcribed word-by-word
// from the user's seventh uploaded clip with faster-whisper (small
// model, word_timestamps=True, biased with an initial_prompt built
// from these same 16 lines). All 16 matched the transcript in full.
// Seconds -> frames at 30fps (the project's own fps), rounded to the
// nearest frame:
//   "Mi vida, fuimos a volar"          0.00s ->    0
//   "Con un solo paracaídas"           4.80s ->  144
//   "Uno solo va a quedar"             7.64s ->  229
//   "Volando a la deriva"             10.80s ->  324
//   "Vivir así no es vivir"           14.50s ->  435
//   "Esperando y esperando"           17.36s ->  521
//   "Porque vivir es jugar"           20.44s ->  613
//   "Y yo quiero seguir jugando"      23.70s ->  711
//   "Le dije a mi corazón"            26.98s ->  809
//   "Sin gloria, pero sin pena"       29.90s ->  897
//   "No cometas el crimen, varón"     33.00s ->  990
//   "Si no vas a cumplir la condena"  36.24s -> 1087
//   "Quiero vivir dos veces"          39.74s -> 1192
//   "Para poder olvidarte"            42.80s -> 1284
//   "Quiero llevarte conmigo"         45.74s -> 1372
//   "Y no voy a ninguna parte"        48.70s -> 1461
//
// No burn/delete effect — plain conversation. 16 lines run well past a
// single screen, so it uses AutoScrollChatLog (auto-scrolls to keep
// the latest line in view) with the TikTok-safe margins (85% right
// edge, clear of the action column) rather than the wider push tried
// on LyricSync6 — that was a one-off experiment for that clip, not
// adopted as the new default.
export const BUBBLES: DarkBubble[] = [
  { from: "me", text: "Mi vida, fuimos a volar", timestamp: "16:05", atFrame: 0 },
  { from: "me", text: "Con un solo paracaídas", timestamp: "16:05", atFrame: 144 },
  { from: "me", text: "Uno solo va a quedar", timestamp: "16:06", atFrame: 229 },
  { from: "me", text: "Volando a la deriva", timestamp: "16:06", atFrame: 324 },
  { from: "me", text: "Vivir así no es vivir", timestamp: "16:07", atFrame: 435 },
  { from: "me", text: "Esperando y esperando", timestamp: "16:07", atFrame: 521 },
  { from: "me", text: "Porque vivir es jugar", timestamp: "16:08", atFrame: 613 },
  { from: "me", text: "Y yo quiero seguir jugando", timestamp: "16:08", atFrame: 711 },
  { from: "me", text: "Le dije a mi corazón", timestamp: "16:09", atFrame: 809 },
  { from: "me", text: "Sin gloria, pero sin pena", timestamp: "16:09", atFrame: 897 },
  { from: "me", text: "No cometas el crimen, varón", timestamp: "16:10", atFrame: 990 },
  { from: "me", text: "Si no vas a cumplir la condena", timestamp: "16:10", atFrame: 1087 },
  { from: "me", text: "Quiero vivir dos veces", timestamp: "16:11", atFrame: 1192 },
  { from: "me", text: "Para poder olvidarte", timestamp: "16:11", atFrame: 1284 },
  { from: "me", text: "Quiero llevarte conmigo", timestamp: "16:12", atFrame: 1372 },
  { from: "me", text: "Y no voy a ninguna parte", timestamp: "16:12", atFrame: 1461 },
];

// Last bubble's entrance settles ~15-20 frames after its atFrame — the
// composition holds a few seconds past that so the final line is
// readable before the clip ends.
export const LYRIC_SYNC_7_LAST_FRAME = 1461;

// TikTok-safe margins (same as LyricSyncScene4/5): pinned top/left
// instead of centered so lines don't start flush against the top
// edge, and the right edge stays clear of TikTok's own action column.
const CANVAS_TOP_MARGIN = 190;
const CANVAS_BOTTOM_MARGIN = 320;
const CANVAS_LEFT_MARGIN = 40;
const SAFE_RIGHT_EDGE = 920; // ~85% of the 1080-wide frame
const SCALE = 1.6;
const CONTENT_WIDTH = Math.round((SAFE_RIGHT_EDGE - CANVAS_LEFT_MARGIN) / SCALE);
const VIEWPORT_HEIGHT = Math.round((1920 - CANVAS_TOP_MARGIN - CANVAS_BOTTOM_MARGIN) / SCALE);

export const LyricSyncScene7: React.FC = () => {
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
