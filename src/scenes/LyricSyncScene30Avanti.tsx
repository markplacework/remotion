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
// Starts ~3s before "Y en el escolazo de los besos" per the user's
// request for a lead-in — original absolute line start 32.56s, video
// start 29.56s, re-based so the lead-in is frame 0. Note: the 3s right
// before this line are the tail of the previous verse's vocals (it
// runs straight into this one, no instrumental gap), not pure melody —
// no bubble is shown for it either way, so visually it just reads as
// a beat of blank chat before the first line appears.
// Seconds -> frames at 30fps (the project's own fps), rounded to the
// nearest frame, relative to the 29.56s starting point:
//   "Y en el escolazo de los besos"                              32.56s ->   90
//   "Cantamos bingo y así andamos"                                39.38s ->  295
//   "Sin nada de mapas ni de candados"                            43.36s ->  414
//   "¡Arriba morocha, que nadie está muerto!"                     52.82s ->  698
//   "Vamos a punguearle a esta vida amarreta un ramo de sueños"   61.22s ->  950
//   "¡Avanti morocha, no nos llueve tanto!"                       69.30s -> 1192
//   "No tires la toalla, hasta los más mancos la siguen remando"  78.94s -> 1481
//
// No burn/delete effect — plain conversation, 7 lines. Uses
// AutoScrollChatLog with the shared lyric-sync layout defaults (locked
// in after Scene9).
export const BUBBLES: DarkBubble[] = [
  { from: "me", text: "Y en el escolazo de los besos", timestamp: "18:29", atFrame: 90 },
  { from: "me", text: "Cantamos bingo y así andamos", timestamp: "18:29", atFrame: 295 },
  { from: "me", text: "Sin nada de mapas ni de candados", timestamp: "18:30", atFrame: 414 },
  { from: "me", text: "¡Arriba morocha, que nadie está muerto!", timestamp: "18:30", atFrame: 698 },
  { from: "me", text: "Vamos a punguearle a esta vida amarreta un ramo de sueños", timestamp: "18:31", atFrame: 950 },
  { from: "me", text: "¡Avanti morocha, no nos llueve tanto!", timestamp: "18:31", atFrame: 1192 },
  { from: "me", text: "No tires la toalla, hasta los más mancos la siguen remando", timestamp: "18:32", atFrame: 1481 },
];

// Last bubble's entrance settles ~15-20 frames after its atFrame — the
// composition holds a few seconds past that so the final line is
// readable before the clip ends.
export const LYRIC_SYNC_30_AVANTI_LAST_FRAME = 1481;

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
