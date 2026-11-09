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

// New wallpaper format, continuing from LyricSync18Alt/19Alt/20-31.
const BACKGROUND_SRC = staticFile("/fake-chat/background-alt.png");

// User-supplied lines, exact wording — transcribed word-by-word from
// the user's thirty-second uploaded clip with faster-whisper (small
// model, word_timestamps=True, biased with an initial_prompt built
// from these same 12 lines). All 12 matched in full — the
// forward-cursor difflib matching correctly resolved the repeated
// "Se proyecta la vida" / "Mariposa tecknicolor" pair to their own
// later occurrences.
//
// Per the user's explicit request ("q empice desde 'Todo al fin se
// sucedió' y no antes"), this video is trimmed to start right there —
// the source clip's first ~14s (an earlier verse: "Y sus caras de
// resignación / Los disfelices llenos de dolor / Ellas cocinaban el
// arroz / Se levantaba sus principios de sutil emperador") is cut. The
// song's outro reprises that same earlier verse again at the very
// end — not re-added as its own bubble, matching the pattern used for
// other songs whose outro repeats already-used material.
//
// Trim start = 14.0s (source) -> new frame 0. Seconds below are
// original source seconds; frames are relative to the 14.0s trim
// point, at 30fps:
//   "Todo al fin se sucedió"                       14.18s ->    5
//   "Solo que el tiempo no los esperó"              16.76s ->   83
//   "La melancolía de morir en este mundo"          20.86s ->  206
//   "Y de vivir sin una estúpida razón"             23.92s ->  298
//   "Todos yiran y yiran"                           27.42s ->  403
//   "Todos bajo el sol"                             30.78s ->  503
//   "Se proyecta la vida" (1st)                     34.10s ->  603
//   "Mariposa tecknicolor" (1st)                    36.44s ->  673
//   "Cada vez que me miras"                         40.74s ->  802
//   "Cada sensación"                                44.00s ->  900
//   "Se proyecta la vida" (2nd)                     46.74s ->  982
//   "Mariposa tecknicolor" (2nd)                    49.68s -> 1070
//
// No burn/delete effect — plain conversation, 12 lines. Uses
// AutoScrollChatLog with the shared lyric-sync layout defaults (locked
// in after Scene9).
export const BUBBLES: DarkBubble[] = [
  { from: "me", text: "Todo al fin se sucedió", timestamp: "18:47", atFrame: 5 },
  { from: "me", text: "Solo que el tiempo no los esperó", timestamp: "18:47", atFrame: 83 },
  { from: "me", text: "La melancolía de morir en este mundo", timestamp: "18:48", atFrame: 206 },
  { from: "me", text: "Y de vivir sin una estúpida razón", timestamp: "18:48", atFrame: 298 },
  { from: "me", text: "Todos yiran y yiran", timestamp: "18:49", atFrame: 403 },
  { from: "me", text: "Todos bajo el sol", timestamp: "18:49", atFrame: 503 },
  { from: "me", text: "Se proyecta la vida", timestamp: "18:50", atFrame: 603 },
  { from: "me", text: "Mariposa tecknicolor", timestamp: "18:50", atFrame: 673 },
  { from: "me", text: "Cada vez que me miras", timestamp: "18:51", atFrame: 802 },
  { from: "me", text: "Cada sensación", timestamp: "18:51", atFrame: 900 },
  { from: "me", text: "Se proyecta la vida", timestamp: "18:52", atFrame: 982 },
  { from: "me", text: "Mariposa tecknicolor", timestamp: "18:52", atFrame: 1070 },
];

// Last bubble's entrance settles ~15-20 frames after its atFrame — the
// composition holds a few seconds past that so the final line is
// readable before the clip ends.
export const LYRIC_SYNC_32_LAST_FRAME = 1070;

export const LyricSyncScene32: React.FC = () => {
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
