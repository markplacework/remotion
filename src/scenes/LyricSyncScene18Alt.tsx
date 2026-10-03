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

// A/B test of the alternate wallpaper background against Scene18
// ("Mi enfermedad") — everything else (margins, bubbles, timings) is
// identical to LyricSyncScene18.tsx, only BACKGROUND_SRC differs. The
// original background.png stays the default for all other scenes.
const BACKGROUND_SRC = staticFile("/fake-chat/background-alt.png");

// Same BUBBLES/timings as LyricSyncScene18.tsx — see that file for the
// full seconds -> frames derivation notes.
export const BUBBLES: DarkBubble[] = [
  { from: "me", text: "Estoy vencido porque el mundo me hizo así", timestamp: "22:47", atFrame: 0 },
  { from: "me", text: "No puedo cambiar", timestamp: "22:47", atFrame: 129 },
  { from: "me", text: "Soy el remedio sin receta y tu amor", timestamp: "22:48", atFrame: 210 },
  { from: "me", text: "Mi enfermedad", timestamp: "22:48", atFrame: 333 },
  { from: "me", text: "Estoy vencido porque el cuerpo de los dos", timestamp: "22:49", atFrame: 411 },
  { from: "me", text: "Es mi debilidad", timestamp: "22:49", atFrame: 551 },
  { from: "me", text: "Esta vez el dolor va a terminar", timestamp: "22:50", atFrame: 660 },
  { from: "me", text: "Parece que la fiesta terminó", timestamp: "22:50", atFrame: 930 },
  { from: "me", text: "Perdidos en el túnel del amor", timestamp: "22:51", atFrame: 1145 },
  { from: "me", text: "Y dicen las hojas del libro que más leo yo", timestamp: "22:51", atFrame: 1321 },
  { from: "me", text: "Esta vez el esclavo se escapó", timestamp: "22:52", atFrame: 1483 },
];

// Last bubble's entrance settles ~15-20 frames after its atFrame — the
// composition holds a few seconds past that so the final line is
// readable before the clip ends.
export const LYRIC_SYNC_18_ALT_LAST_FRAME = 1483;

export const LyricSyncScene18Alt: React.FC = () => {
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
