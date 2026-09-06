import { AbsoluteFill, Img, staticFile } from "remotion";
import { BurningChatLog, type BurningBubble } from "../components/BurningChatLog";

// Same real WhatsApp dark-mode wallpaper doodle used by the other
// lyric-sync scenes — generic (not song-specific), reused as-is.
const BACKGROUND_SRC = staticFile("/fake-chat/background.png");

// User-supplied lines, in the exact wording given — no line generated
// or completed here. Timestamps are the REAL sung start times,
// transcribed word-by-word from the user's third uploaded clip with
// faster-whisper (small model, word_timestamps=True, biased with an
// initial_prompt built from these same 12 lines). Every line matched
// the transcript in full (all of its words, in order). Seconds ->
// frames at 30fps (the clip's own real fps), rounded to the nearest
// frame:
//   "Esta vez es en serio"                     3.36s ->  101
//   "No estoy mintiendo"                       5.88s ->  176
//   "Algo se prende fuego"                     9.00s ->  270
//   "Sé que muchas veces dije"                10.68s ->  320
//   "Que el lobo venía, pero esta vez"         13.88s ->  416
//   "El lobo está acá"                         16.92s ->  508
//   "Se prende fuego mi pelo"                  18.90s ->  567
//   "Mi piano, mis discos"                     21.94s ->  658
//   "La ropa y el perro"                       24.18s ->  725
//   "Puede ser que otra vez no sea cierto"     26.52s ->  796
//   "Pero siento cómo el fuego"                30.90s ->  927
//   "Me quema por dentro"                      32.88s ->  986
//
// Requested effect: seconds before the clip ends, the whole
// conversation burns away Telegram-self-destruct style, top line
// first, sweeping down — burnStart below staggers each bubble's start
// by 9 frames (BurningChatLog burns each one over 30 frames), so
// bubble 0 starts at 1211 and the last one (index 11) finishes right
// at 1340, ten frames before the 1350-frame (45s) cut.
export const BUBBLES: BurningBubble[] = [
  { from: "me", text: "Esta vez es en serio", timestamp: "01:58", atFrame: 101, burnStart: 1211 },
  { from: "me", text: "No estoy mintiendo", timestamp: "01:58", atFrame: 176, burnStart: 1220 },
  { from: "me", text: "Algo se prende fuego", timestamp: "01:59", atFrame: 270, burnStart: 1229 },
  { from: "me", text: "Sé que muchas veces dije", timestamp: "01:59", atFrame: 320, burnStart: 1238 },
  { from: "me", text: "Que el lobo venía, pero esta vez", timestamp: "02:00", atFrame: 416, burnStart: 1247 },
  { from: "me", text: "El lobo está acá", timestamp: "02:00", atFrame: 508, burnStart: 1256 },
  { from: "me", text: "Se prende fuego mi pelo", timestamp: "02:01", atFrame: 567, burnStart: 1265 },
  { from: "me", text: "Mi piano, mis discos", timestamp: "02:01", atFrame: 658, burnStart: 1274 },
  { from: "me", text: "La ropa y el perro", timestamp: "02:02", atFrame: 725, burnStart: 1283 },
  { from: "me", text: "Puede ser que otra vez no sea cierto", timestamp: "02:02", atFrame: 796, burnStart: 1292 },
  { from: "me", text: "Pero siento cómo el fuego", timestamp: "02:03", atFrame: 927, burnStart: 1301 },
  { from: "me", text: "Me quema por dentro", timestamp: "02:03", atFrame: 986, burnStart: 1310 },
];

export const LyricSyncScene3: React.FC = () => {
  return (
    <AbsoluteFill>
      <Img
        src={BACKGROUND_SRC}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 620, transform: "scale(1.6)" }}>
          <BurningChatLog bubbles={BUBBLES} dateLabel="Hoy" />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
