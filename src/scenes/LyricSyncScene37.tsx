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

// New wallpaper format, continuing from LyricSync18Alt/19Alt/20-36.
const BACKGROUND_SRC = staticFile("/fake-chat/background-alt.png");

// User-supplied lines, exact wording — transcribed word-by-word from the
// user's thirty-seventh uploaded clip with faster-whisper (small model,
// word_timestamps=True, biased with an initial_prompt built from all 22
// typed lines, including the repeated verse). All 22 lines matched
// cleanly in a single full-clip pass, in order.
//
// One nuance worth flagging: the second chorus pass was typed as "Como
// nunca jamás me imaginé" (vs. "...lo imaginé" the first time), but
// whisper's biased transcript heard "lo" both times. Isolating that
// moment and re-transcribing it unbiased came back garbled/unreliable
// (not real words), so that check couldn't confirm either way — kept
// the user's exact typed wording ("me") rather than override it on
// inconclusive evidence.
//
// The clip also has ~2s of extra sung outro after the last typed line
// ("No me arrepiento de este amor" repeated twice more, 59.78s-61.58s)
// that isn't part of the user's 22 typed lines — left out, per the
// rule to only use the user's own exact lines, not add to them.
//
// Seconds -> frames at 30fps (the project's own fps), rounded to the
// nearest frame:
//   "No me arrepiento de este amor"          0.00s ->    0
//   "Aunque me cueste el corazón"             2.82s ->   85
//   "Amar es un milagro y yo te amé"          5.14s ->  154
//   "Como nunca jamás lo imaginé"              8.00s ->  240
//   "Tiendo a arrancarme de tu piel"          10.78s ->  323
//   "De tu mirada, de tu ser"                 13.20s ->  396
//   "Yo siento que la vida se nos va"         15.58s ->  467
//   "Y que el día de hoy no vuelve más"       18.22s ->  547
//   "Después de cerrar la puerta"             20.92s ->  628
//   "Nuestra cama espera abierta"             23.40s ->  702
//   "La locura apasionada del amor"           26.08s ->  782
//   "Y entre un te quiero y te quiero"        30.62s ->  919
//   "Vamos remontando al cielo"               33.50s -> 1005
//   "Y no puedo arrepentirme de este amor"    36.02s -> 1081
//   "No me arrepiento de este amor"           39.98s -> 1199
//   "Aunque me cueste el corazón"             43.46s -> 1304
//   "Amar es un milagro y yo te amé"          45.80s -> 1374
//   "Como nunca jamás me imaginé"             48.58s -> 1457
//   "Tiendo a arrancarme de tu piel"          51.24s -> 1537
//   "De tu mirada, de tu ser"                 53.64s -> 1609
//   "Yo siento que la vida se nos va"         56.10s -> 1683
//   "Y que el día de hoy no vuelve más"       58.58s -> 1757
//
// No burn/delete effect — plain conversation, 22 lines. Uses
// AutoScrollChatLog with the shared lyric-sync layout defaults (locked
// in after Scene9).
export const BUBBLES: DarkBubble[] = [
  { from: "me", text: "No me arrepiento de este amor", timestamp: "23:04", atFrame: 0 },
  { from: "me", text: "Aunque me cueste el corazón", timestamp: "23:04", atFrame: 85 },
  { from: "me", text: "Amar es un milagro y yo te amé", timestamp: "23:04", atFrame: 154 },
  { from: "me", text: "Como nunca jamás lo imaginé", timestamp: "23:04", atFrame: 240 },
  { from: "me", text: "Tiendo a arrancarme de tu piel", timestamp: "23:05", atFrame: 323 },
  { from: "me", text: "De tu mirada, de tu ser", timestamp: "23:05", atFrame: 396 },
  { from: "me", text: "Yo siento que la vida se nos va", timestamp: "23:05", atFrame: 467 },
  { from: "me", text: "Y que el día de hoy no vuelve más", timestamp: "23:05", atFrame: 547 },
  { from: "me", text: "Después de cerrar la puerta", timestamp: "23:06", atFrame: 628 },
  { from: "me", text: "Nuestra cama espera abierta", timestamp: "23:06", atFrame: 702 },
  { from: "me", text: "La locura apasionada del amor", timestamp: "23:06", atFrame: 782 },
  { from: "me", text: "Y entre un te quiero y te quiero", timestamp: "23:07", atFrame: 919 },
  { from: "me", text: "Vamos remontando al cielo", timestamp: "23:07", atFrame: 1005 },
  { from: "me", text: "Y no puedo arrepentirme de este amor", timestamp: "23:07", atFrame: 1081 },
  { from: "me", text: "No me arrepiento de este amor", timestamp: "23:08", atFrame: 1199 },
  { from: "me", text: "Aunque me cueste el corazón", timestamp: "23:08", atFrame: 1304 },
  { from: "me", text: "Amar es un milagro y yo te amé", timestamp: "23:08", atFrame: 1374 },
  { from: "me", text: "Como nunca jamás me imaginé", timestamp: "23:09", atFrame: 1457 },
  { from: "me", text: "Tiendo a arrancarme de tu piel", timestamp: "23:09", atFrame: 1537 },
  { from: "me", text: "De tu mirada, de tu ser", timestamp: "23:09", atFrame: 1609 },
  { from: "me", text: "Yo siento que la vida se nos va", timestamp: "23:10", atFrame: 1683 },
  { from: "me", text: "Y que el día de hoy no vuelve más", timestamp: "23:10", atFrame: 1757 },
];

// Last bubble's entrance settles ~15-20 frames after its atFrame — the
// composition holds a few seconds past that so the final line is
// readable before the clip ends.
export const LYRIC_SYNC_37_LAST_FRAME = 1757;

export const LyricSyncScene37: React.FC = () => {
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
