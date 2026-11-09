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

// Same wallpaper as LyricSyncScene25.tsx.
const BACKGROUND_SRC = staticFile("/fake-chat/background-alt.png");

// Re-trim of LyricSyncScene25: the original alignment's first pass
// (biased by the initial_prompt) placed "Un hombre..." at 0.00s, but a
// second, unbiased transcription of just the clip's head showed the
// word "un" only starts around 1.70s with very low confidence (0.01)
// and the first clearly-sung word ("hombre") lands at 2.94s — i.e.
// there really are ~1.6-2s of instrumental/pad before the vocal, which
// the user could hear even though the biased pass didn't flag it. This
// scene trims the video to start at that ~1.6s point instead, so it
// opens right on "Un hombre" with no lead-in.
//
// All atFrame values below are the originals from LyricSyncScene25.tsx
// minus 48 frames (1.6s at 30fps), floored at 0 for the first bubble.
export const BUBBLES: DarkBubble[] = [
  { from: "me", text: "Un hombre de frente a una ventana", timestamp: "22:41", atFrame: 0 },
  { from: "me", text: "Súper lúcida la mirada", timestamp: "22:41", atFrame: 150 },
  { from: "me", text: "Recorre el paisaje y no", timestamp: "22:42", atFrame: 249 },
  { from: "me", text: "No es su interior, es luna", timestamp: "22:42", atFrame: 341 },
  { from: "me", text: "Son sombras lejanas del bosque", timestamp: "22:43", atFrame: 462 },
  { from: "me", text: "Es algo raro en las estrellas", timestamp: "22:43", atFrame: 554 },
  { from: "me", text: "Sonidos que inducen temor", timestamp: "22:44", atFrame: 658 },
  { from: "me", text: "Y también melancolía de esperar", timestamp: "22:44", atFrame: 742 },
  { from: "me", text: "De esperar", timestamp: "22:45", atFrame: 877 },
  { from: "me", text: "De esperar que ella vuelva", timestamp: "22:45", atFrame: 950 },
  { from: "me", text: "Y le diga acá estoy mi amor", timestamp: "22:46", atFrame: 1041 },
  { from: "me", text: "No existe el olvido", timestamp: "22:46", atFrame: 1156 },
  { from: "me", text: "Acá estoy mi amor de vuelta", timestamp: "22:47", atFrame: 1234 },
  { from: "me", text: "He venido", timestamp: "22:47", atFrame: 1333 },
  { from: "me", text: "Lo puedes creer", timestamp: "22:48", atFrame: 1385 },
  { from: "me", text: "No existe el olvido, mi amor", timestamp: "22:48", atFrame: 1459 },
  { from: "me", text: "No existe", timestamp: "22:49", atFrame: 1543 },
];

// Last bubble's entrance settles ~15-20 frames after its atFrame — the
// composition holds a few seconds past that so the final line is
// readable before the clip ends.
export const LYRIC_SYNC_25_TRIMMED_LAST_FRAME = 1543;

export const LyricSyncScene25Trimmed: React.FC = () => {
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
