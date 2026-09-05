import { AbsoluteFill, Img, staticFile } from "remotion";
import { DarkChatLog, type DarkBubble } from "../components/DarkChatLog";

// Same real WhatsApp dark-mode wallpaper doodle used by FakeChatScene —
// generic (not song-specific), so it's reused as-is. Covers the full
// frame; no header/contact info of any kind.
const BACKGROUND_SRC = staticFile("/fake-chat/background.png");

// User-supplied lines, in the exact wording given — no line generated or
// completed here. Timestamps are the REAL sung start times, transcribed
// word-by-word from the user's uploaded clip with faster-whisper (small
// model, word_timestamps=True, biased with an initial_prompt built from
// these same 7 lines — without it, "Te cansaste de mí" was misheard as
// "Me cansaste de mí"). Every line matched the transcript in full (all of
// its words, in order) at these times. Seconds -> frames at 30fps (the
// clip's own real fps), rounded to the nearest frame:
//   "Y por todas esas cosas..."                    0.00s ->   0
//   "Hace tiempo ya marchaste de acá"               3.74s -> 112
//   "Te cansaste de mí, yo me cansé de vos"         8.00s -> 240
//   "Pero cuando nos miramos..."                   11.98s -> 359
//   "Porque tanto te quise..."                     16.02s -> 481
//   "Siempre, una marca tuya..."                   20.30s -> 609
//   "Disculpa si te parece raro..."                24.10s -> 723
// Timestamps advance by a minute every couple of lines rather than
// staying frozen on one minute for the whole clip — real WhatsApp
// conversations drift like that even over a short span, and it reads
// more natural than every bubble sharing one timestamp.
export const BUBBLES: DarkBubble[] = [
  { from: "me", text: "Y por todas esas cosas que tenemos en común", timestamp: "23:41", atFrame: 0 },
  { from: "me", text: "Hace tiempo ya marchaste de acá", timestamp: "23:41", atFrame: 112 },
  { from: "me", text: "Te cansaste de mí, yo me cansé de vos", timestamp: "23:42", atFrame: 240 },
  { from: "me", text: "Pero cuando nos miramos sabemos que no es verdad", timestamp: "23:42", atFrame: 359 },
  { from: "me", text: "Porque tanto te quise y tanto te quiero", timestamp: "23:43", atFrame: 481 },
  { from: "me", text: "Siempre, una marca tuya, llevará mi corazón", timestamp: "23:43", atFrame: 609 },
  {
    from: "me",
    text: "Disculpa si te parece raro, pero comparto la opinión que escuché en una canción",
    timestamp: "23:44",
    atFrame: 723,
  },
];

// Last bubble's entrance settles ~15-20 frames after its atFrame — the
// composition holds a few seconds past that so the final line is
// readable before the clip ends.
export const LYRIC_SYNC_LAST_FRAME = 723;

export const LyricSyncScene: React.FC = () => {
  return (
    <AbsoluteFill>
      <Img
        src={BACKGROUND_SRC}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 620, transform: "scale(1.6)" }}>
          <DarkChatLog bubbles={BUBBLES} dateLabel="Hoy" />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
