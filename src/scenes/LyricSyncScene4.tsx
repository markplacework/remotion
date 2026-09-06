import { AbsoluteFill, Img, staticFile } from "remotion";
import { AutoScrollChatLog } from "../components/AutoScrollChatLog";
import type { DarkBubble } from "../components/DarkChatLog";

// Same real WhatsApp dark-mode wallpaper doodle used by the other
// lyric-sync scenes — generic (not song-specific), reused as-is.
const BACKGROUND_SRC = staticFile("/fake-chat/background.png");

// User-supplied lines, in the exact wording given — no line generated
// or completed here. Timestamps are the REAL sung start times,
// transcribed word-by-word from the user's fourth uploaded clip with
// faster-whisper (small model, word_timestamps=True, biased with an
// initial_prompt built from these same 16 lines). All 16 matched the
// transcript (the last one's trailing "uh-uh, uh" ad-lib isn't spoken
// as words, so only "Una dulce rendición" matched — that's still the
// correct start-of-line moment). Seconds -> frames at 30fps (the
// project's own fps, not the clip's — see LyricSyncScene.tsx), rounded
// to the nearest frame:
//   "Cada vez que toco un poco fondo"            0.00s ->    0
//   "Cada vez que el tiempo vuela"                4.20s ->  126
//   "Un recuerdo más que pasajero"                8.16s ->  245
//   "Otra ilusión que llega"                     11.86s ->  356
//   "Cada corazón merece una oportunidad"        15.62s ->  469
//   "Y está perdida sola en medio de la ciudad"  19.18s ->  575
//   "Soy el que lo piensa por los dos"           23.90s ->  717
//   "Hasta que sale el sol"                      27.38s ->  821
//   "No importa el problema"                     31.90s ->  957
//   "No importa la solución"                     34.66s -> 1040
//   "Me quedo con lo poco que queda"             39.90s -> 1197
//   "Entero en el corazón"                       43.28s -> 1298
//   "Me gustan los problemas"                    45.58s -> 1367
//   "No existe otra explicación"                 49.96s -> 1499
//   "Esta sí es una dulce condena"                53.78s -> 1613
//   "Una dulce rendición, uh-uh, uh"              58.42s -> 1753
//
// No burn/delete effect on this one — plain conversation, but with 16
// lines the stack runs well past a single screen, so it uses
// AutoScrollChatLog (auto-scrolls to keep the latest line in view,
// like real WhatsApp) instead of DarkChatLog's static centered block.
export const BUBBLES: DarkBubble[] = [
  { from: "me", text: "Cada vez que toco un poco fondo", timestamp: "14:02", atFrame: 0 },
  { from: "me", text: "Cada vez que el tiempo vuela", timestamp: "14:02", atFrame: 126 },
  { from: "me", text: "Un recuerdo más que pasajero", timestamp: "14:03", atFrame: 245 },
  { from: "me", text: "Otra ilusión que llega", timestamp: "14:03", atFrame: 356 },
  { from: "me", text: "Cada corazón merece una oportunidad", timestamp: "14:04", atFrame: 469 },
  { from: "me", text: "Y está perdida sola en medio de la ciudad", timestamp: "14:04", atFrame: 575 },
  { from: "me", text: "Soy el que lo piensa por los dos", timestamp: "14:05", atFrame: 717 },
  { from: "me", text: "Hasta que sale el sol", timestamp: "14:05", atFrame: 821 },
  { from: "me", text: "No importa el problema", timestamp: "14:06", atFrame: 957 },
  { from: "me", text: "No importa la solución", timestamp: "14:06", atFrame: 1040 },
  { from: "me", text: "Me quedo con lo poco que queda", timestamp: "14:07", atFrame: 1197 },
  { from: "me", text: "Entero en el corazón", timestamp: "14:07", atFrame: 1298 },
  { from: "me", text: "Me gustan los problemas", timestamp: "14:08", atFrame: 1367 },
  { from: "me", text: "No existe otra explicación", timestamp: "14:08", atFrame: 1499 },
  { from: "me", text: "Esta sí es una dulce condena", timestamp: "14:09", atFrame: 1613 },
  { from: "me", text: "Una dulce rendición, uh-uh, uh", timestamp: "14:09", atFrame: 1753 },
];

// Last bubble's entrance settles ~15-20 frames after its atFrame — the
// composition holds a few seconds past that so the final line is
// readable before the clip ends.
export const LYRIC_SYNC_4_LAST_FRAME = 1753;

// Local (pre-scale) px height of the visible chat viewport — the
// wrapping scale(1.6) maps this to most of the 1920-tall final frame.
const VIEWPORT_HEIGHT = 1150;

export const LyricSyncScene4: React.FC = () => {
  return (
    <AbsoluteFill>
      <Img
        src={BACKGROUND_SRC}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 620, transform: "scale(1.6)" }}>
          <AutoScrollChatLog bubbles={BUBBLES} viewportHeight={VIEWPORT_HEIGHT} dateLabel="Hoy" />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
