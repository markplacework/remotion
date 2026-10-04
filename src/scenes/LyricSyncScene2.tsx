import { AbsoluteFill, Img, staticFile } from "remotion";
import { DarkChatLog, type DarkBubble } from "../components/DarkChatLog";

// Same real WhatsApp dark-mode wallpaper doodle used by LyricSyncScene —
// generic (not song-specific), so it's reused as-is. Covers the full
// frame; no header/contact info of any kind.
const BACKGROUND_SRC = staticFile("/fake-chat/background.png");

// User-supplied lines, in the exact wording given (including the
// repeated "Será posible" / "Será dormido" couplet, sung twice) — no
// line generated or completed here. Timestamps are the REAL sung start
// times, transcribed word-by-word from the user's second uploaded clip
// with faster-whisper (small model, word_timestamps=True, biased with
// an initial_prompt built from these same 11 lines). Every line matched
// the transcript in full (all of its words, in order); for the two
// repeated couplets the search was anchored to resume right after the
// previous match so each repeat resolved to its own later occurrence,
// not the first one again. Seconds -> frames at 30fps (the clip's own
// real fps), rounded to the nearest frame:
//   "Solo sé que no sé nada de tu vida"        0.00s ->    0
//   "Solo me colgué una vez en el pasado"      3.58s ->  107
//   "Presenté mis credenciales a tu risa"      9.20s ->  276
//   "Y me clavaste una lanza en el costado"   13.20s ->  396
//   "Creo que no te dejé jugar con fuego"     18.34s ->  550
//   "Solo nos dijimos cosas al oído"          21.76s ->  653
//   "Y si un día te encontrare una mañana"    26.30s ->  789
//   "Será posible" (1st)                      30.86s ->  926
//   "Será dormido" (1st)                      33.16s ->  995
//   "Será posible" (2nd)                      35.56s -> 1067
//   "Será dormido" (2nd)                      37.88s -> 1136
// Timestamps advance by a minute every couple of lines rather than
// staying frozen on one minute for the whole clip — reads more natural
// than every bubble sharing one timestamp.
export const BUBBLES: DarkBubble[] = [
  { from: "me", text: "Solo sé que no sé nada de tu vida", timestamp: "20:14", atFrame: 0 },
  { from: "me", text: "Solo me colgué una vez en el pasado", timestamp: "20:14", atFrame: 107 },
  { from: "me", text: "Presenté mis credenciales a tu risa", timestamp: "20:15", atFrame: 276 },
  { from: "me", text: "Y me clavaste una lanza en el costado", timestamp: "20:15", atFrame: 396 },
  { from: "me", text: "Creo que no te dejé jugar con fuego", timestamp: "20:16", atFrame: 550 },
  { from: "me", text: "Solo nos dijimos cosas al oído", timestamp: "20:16", atFrame: 653 },
  { from: "me", text: "Y si un día te encontrare una mañana", timestamp: "20:17", atFrame: 789 },
  { from: "me", text: "Será posible", timestamp: "20:17", atFrame: 926 },
  { from: "me", text: "Será dormido", timestamp: "20:18", atFrame: 995 },
  { from: "me", text: "Será posible", timestamp: "20:18", atFrame: 1067 },
  { from: "me", text: "Será dormido", timestamp: "20:18", atFrame: 1136 },
];

// Last bubble's entrance settles ~15-20 frames after its atFrame — the
// composition's fixed 45s total length holds well past that.
export const LYRIC_SYNC_2_LAST_FRAME = 1136;

export const LyricSyncScene2: React.FC = () => {
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
