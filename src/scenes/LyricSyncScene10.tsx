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

// Same real WhatsApp dark-mode wallpaper doodle used by the other
// lyric-sync scenes — generic (not song-specific), reused as-is.
const BACKGROUND_SRC = staticFile("/fake-chat/background.png");

// User-supplied lines, in the exact wording given (already correctly
// accented/capitalized, no fixes needed) — transcribed word-by-word
// from the user's tenth uploaded clip with faster-whisper (small
// model, word_timestamps=True, biased with an initial_prompt built
// from these same 12 lines). All 12 matched the transcript in full.
// Seconds -> frames at 30fps (the project's own fps), rounded to the
// nearest frame:
//   "Si alguna vez no me vuelven a ver"           0.00s ->    0
//   "Porque a mí como a todos se me olvida"       5.88s ->  176
//   "Algo va a quedar adentro tuyo siempre"      12.00s ->  360
//   "Algo que yo te dejé alguna vez"             16.64s ->  499
//   "No importa si no venís conmigo"             23.50s ->  705
//   "Este viaje es mejor hacerlo solo"           28.08s ->  842
//   "Yo te voy a recordar todos los días"        34.00s -> 1020
//   "Porque un amor así nunca se olvida"         39.20s -> 1176
//   "Te seguiría por todas partes y volvería"    46.10s -> 1383
//   "A la ciudad"                                50.12s -> 1504
//   "Si me das otra oportunidad"                 51.16s -> 1535
//   "De volver a empezar"                        55.30s -> 1659
//
// No burn/delete effect — plain conversation. Uses AutoScrollChatLog
// with the shared lyric-sync layout defaults (locked in after Scene9).
export const BUBBLES: DarkBubble[] = [
  { from: "me", text: "Si alguna vez no me vuelven a ver", timestamp: "09:41", atFrame: 0 },
  { from: "me", text: "Porque a mí como a todos se me olvida", timestamp: "09:41", atFrame: 176 },
  { from: "me", text: "Algo va a quedar adentro tuyo siempre", timestamp: "09:42", atFrame: 360 },
  { from: "me", text: "Algo que yo te dejé alguna vez", timestamp: "09:42", atFrame: 499 },
  { from: "me", text: "No importa si no venís conmigo", timestamp: "09:43", atFrame: 705 },
  { from: "me", text: "Este viaje es mejor hacerlo solo", timestamp: "09:43", atFrame: 842 },
  { from: "me", text: "Yo te voy a recordar todos los días", timestamp: "09:44", atFrame: 1020 },
  { from: "me", text: "Porque un amor así nunca se olvida", timestamp: "09:44", atFrame: 1176 },
  { from: "me", text: "Te seguiría por todas partes y volvería", timestamp: "09:45", atFrame: 1383 },
  { from: "me", text: "A la ciudad", timestamp: "09:45", atFrame: 1504 },
  { from: "me", text: "Si me das otra oportunidad", timestamp: "09:46", atFrame: 1535 },
  { from: "me", text: "De volver a empezar", timestamp: "09:46", atFrame: 1659 },
];

// Last bubble's entrance settles ~15-20 frames after its atFrame — the
// composition holds a few seconds past that so the final line is
// readable before the clip ends.
export const LYRIC_SYNC_10_LAST_FRAME = 1659;

export const LyricSyncScene10: React.FC = () => {
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
