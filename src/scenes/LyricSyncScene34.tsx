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

// New wallpaper format, continuing from LyricSync18Alt/19Alt/20-33.
const BACKGROUND_SRC = staticFile("/fake-chat/background-alt.png");

// User-supplied lines, exact wording ("Arde la ciudad") — transcribed
// word-by-word from the user's thirty-fourth uploaded clip with
// faster-whisper (small model, word_timestamps=True, biased with an
// initial_prompt built from these same 10 lines), then cross-checked
// against the subtitles burned into the source clip. Where Whisper
// stretched a line's first word back into the previous gap (e.g.
// "te"@6.36s vs "prendieron"@9.98s, subtitle appearing ~9.6s), the
// line starts where both sources agree instead.
// Seconds -> frames at 30fps (the project's own fps), rounded to the
// nearest frame:
//   "Tu equipo volvió a ganar,"                         2.60s ->   78
//   "Te prendieron mil bengalas hoy,"                   9.60s ->  288
//   "La banda grita tu nombre y ves,"                  16.20s ->  486
//   "Como la popular se va a caer"                     23.80s ->  714
//   "Pero tu estrella no está más,"                    30.90s ->  927
//   "Se la llevó la mañana..."                         37.80s -> 1134
//   "Arde la ciudad, llueve en tu mirada gris,"        44.04s -> 1321
//   "La gente festeja y vuelve a reír,"                51.68s -> 1550
//   "Pero este carnaval, que hoy no te deja dormir,"   57.60s -> 1728
//   "Mires donde mires ella está ahí"                  66.00s -> 1980
//
// No burn/delete effect — plain conversation, 10 lines. Uses
// AutoScrollChatLog with the shared lyric-sync layout defaults (locked
// in after Scene9).
export const BUBBLES: DarkBubble[] = [
  { from: "me", text: "Tu equipo volvió a ganar,", timestamp: "23:41", atFrame: 78 },
  { from: "me", text: "Te prendieron mil bengalas hoy,", timestamp: "23:41", atFrame: 288 },
  { from: "me", text: "La banda grita tu nombre y ves,", timestamp: "23:42", atFrame: 486 },
  { from: "me", text: "Como la popular se va a caer", timestamp: "23:42", atFrame: 714 },
  { from: "me", text: "Pero tu estrella no está más,", timestamp: "23:43", atFrame: 927 },
  { from: "me", text: "Se la llevó la mañana...", timestamp: "23:43", atFrame: 1134 },
  { from: "me", text: "Arde la ciudad, llueve en tu mirada gris,", timestamp: "23:44", atFrame: 1321 },
  { from: "me", text: "La gente festeja y vuelve a reír,", timestamp: "23:44", atFrame: 1550 },
  { from: "me", text: "Pero este carnaval, que hoy no te deja dormir,", timestamp: "23:45", atFrame: 1728 },
  { from: "me", text: "Mires donde mires ella está ahí", timestamp: "23:45", atFrame: 1980 },
];

// Last bubble's entrance settles ~15-20 frames after its atFrame — the
// composition holds a few seconds past that so the final line is
// readable before the clip ends.
export const LYRIC_SYNC_34_LAST_FRAME = 1980;

export const LyricSyncScene34: React.FC = () => {
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
