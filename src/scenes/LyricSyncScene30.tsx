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

// New wallpaper format, continuing from LyricSync18Alt/19Alt/20-29.
const BACKGROUND_SRC = staticFile("/fake-chat/background-alt.png");

// User-supplied lines, exact wording — transcribed word-by-word from
// the user's thirtieth uploaded clip with faster-whisper (small
// model, word_timestamps=True, biased with an initial_prompt built
// from these same 12 lines). All 12 matched, but the full-clip pass
// collapsed the last two lines' word timestamps into an impossible
// ~1.4s window at 88.22s (a known whisper failure mode after a long
// instrumental gap) — fixed by isolating and re-transcribing just the
// 59s-95.5s tail on its own, which gave clean, plausible timing for
// "Vamos a punguearle a esta vida" / "amarreta un ramo de sueños"
// (60.56s-64.44s+). After that the tail is an instrumental bridge with
// unclear/nonsensical vocals not matching any given line, then the
// song reprises "Vos venías de un viaje / De mochilas cansadas" as an
// outro — not re-added as its own bubble, matching the pattern used
// for other songs whose outro repeats an earlier verse.
// Seconds -> frames at 30fps (the project's own fps), rounded to the
// nearest frame:
//   "Nos empezamos de golpe"                    0.00s ->    0
//   "Nos saboreamos de prepo"                    4.02s ->  121
//   "Como salidos de un cuento de amor"          9.28s ->  278
//   "Vos venías de un viaje"                    18.10s ->  543
//   "De mochilas cansadas"                      21.70s ->  651
//   "Yo pateaba veranos sin sol"                26.40s ->  792
//   "Y en el escolazo de los besos"             32.56s ->  977
//   "Cantamos ¡bingo!, y así andamos"           39.30s -> 1179
//   "Sin nada de mapas ni de candados"          43.26s -> 1298
//   "¡Arriba morocho, que nadie está muerto!"   52.52s -> 1576
//   "Vamos a punguearle a esta vida"            60.56s -> 1817
//   "amarreta un ramo de sueños"                64.44s -> 1933
//
// No burn/delete effect — plain conversation, 12 lines. Uses
// AutoScrollChatLog with the shared lyric-sync layout defaults (locked
// in after Scene9).
export const BUBBLES: DarkBubble[] = [
  { from: "me", text: "Nos empezamos de golpe", timestamp: "18:26", atFrame: 0 },
  { from: "me", text: "Nos saboreamos de prepo", timestamp: "18:26", atFrame: 121 },
  { from: "me", text: "Como salidos de un cuento de amor", timestamp: "18:27", atFrame: 278 },
  { from: "me", text: "Vos venías de un viaje", timestamp: "18:27", atFrame: 543 },
  { from: "me", text: "De mochilas cansadas", timestamp: "18:28", atFrame: 651 },
  { from: "me", text: "Yo pateaba veranos sin sol", timestamp: "18:28", atFrame: 792 },
  { from: "me", text: "Y en el escolazo de los besos", timestamp: "18:29", atFrame: 977 },
  { from: "me", text: "Cantamos ¡bingo!, y así andamos", timestamp: "18:29", atFrame: 1179 },
  { from: "me", text: "Sin nada de mapas ni de candados", timestamp: "18:30", atFrame: 1298 },
  { from: "me", text: "¡Arriba morocho, que nadie está muerto!", timestamp: "18:30", atFrame: 1576 },
  { from: "me", text: "Vamos a punguearle a esta vida", timestamp: "18:31", atFrame: 1817 },
  { from: "me", text: "amarreta un ramo de sueños", timestamp: "18:31", atFrame: 1933 },
];

// Last bubble's entrance settles ~15-20 frames after its atFrame — the
// composition holds a few seconds past that so the final line is
// readable before the clip ends.
export const LYRIC_SYNC_30_LAST_FRAME = 1933;

export const LyricSyncScene30: React.FC = () => {
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
