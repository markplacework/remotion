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

// Same wallpaper as LyricSyncScene30.tsx (same source song/clip).
const BACKGROUND_SRC = staticFile("/fake-chat/background-alt.png");

// Rebuild of the tail of LyricSyncScene30 ("avanti morocha") using the
// user's corrected exact lyrics for this section — LyricSync30's
// original pass had garbled/hallucinated text here ("A partir morocha
// no nos suele tanto", "No tienes la toalla...") because the
// initial_prompt wasn't biased toward the real words. Re-transcribing
// the same source audio with these corrected lines as the bias prompt
// matched all 7 cleanly with sensible timing (no timestamp collapse).
// Starts at "Y en el escolazo de los besos" per the user's request —
// original absolute start 32.56s, re-based to frame 0 here.
// Seconds -> frames at 30fps (the project's own fps), rounded to the
// nearest frame, relative to the 32.56s starting point:
//   "Y en el escolazo de los besos"                              32.56s ->    0
//   "Cantamos bingo y así andamos"                                39.38s ->  205
//   "Sin nada de mapas ni de candados"                            43.36s ->  324
//   "¡Arriba morocha, que nadie está muerto!"                     52.82s ->  608
//   "Vamos a punguearle a esta vida amarreta un ramo de sueños"   61.22s ->  860
//   "¡Avanti morocha, no nos llueve tanto!"                       69.30s -> 1102
//   "No tires la toalla, hasta los más mancos la siguen remando"  78.94s -> 1391
//
// No burn/delete effect — plain conversation, 7 lines. Uses
// AutoScrollChatLog with the shared lyric-sync layout defaults (locked
// in after Scene9).
export const BUBBLES: DarkBubble[] = [
  { from: "me", text: "Y en el escolazo de los besos", timestamp: "18:29", atFrame: 0 },
  { from: "me", text: "Cantamos bingo y así andamos", timestamp: "18:29", atFrame: 205 },
  { from: "me", text: "Sin nada de mapas ni de candados", timestamp: "18:30", atFrame: 324 },
  { from: "me", text: "¡Arriba morocha, que nadie está muerto!", timestamp: "18:30", atFrame: 608 },
  { from: "me", text: "Vamos a punguearle a esta vida amarreta un ramo de sueños", timestamp: "18:31", atFrame: 860 },
  { from: "me", text: "¡Avanti morocha, no nos llueve tanto!", timestamp: "18:31", atFrame: 1102 },
  { from: "me", text: "No tires la toalla, hasta los más mancos la siguen remando", timestamp: "18:32", atFrame: 1391 },
];

// Last bubble's entrance settles ~15-20 frames after its atFrame — the
// composition holds a few seconds past that so the final line is
// readable before the clip ends.
export const LYRIC_SYNC_30_AVANTI_LAST_FRAME = 1391;

export const LyricSyncScene30Avanti: React.FC = () => {
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
