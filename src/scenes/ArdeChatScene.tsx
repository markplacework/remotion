import { AbsoluteFill, Img, staticFile } from "remotion";
import { DarkChatLog, type DarkBubble } from "../components/DarkChatLog";

// Same dark WhatsApp wallpaper as FakeChat — this is the same "his
// messages are the song's lyrics" format, built around a new track.
const BACKGROUND_SRC = staticFile("/fake-chat/background.png");

// "Arde la ciudad" (La Mancha de Rolando), audio extracted from the
// user-supplied TikTok clip. 75.755s measured from the extracted mp3,
// rounded up to 2273 frames @ 30fps so playback is never truncated.
export const ARDE_SONG_URL = staticFile("/arde-chat/song.mp3");
export const ARDE_SONG_DURATION_FRAMES = 2273;

// Exact lyric lines as given, one bubble each, all "me" (no replies).
//
// atFrame values are real sung timestamps from faster-whisper (small
// model, word_timestamps=True, initial_prompt = the lyrics), cross-
// checked against the subtitles burned into the source TikTok. Where
// Whisper stretched a line's first word back into the previous gap
// (e.g. "te"@6.36 vs "prendieron"@9.98, subtitle appearing ~9.6s),
// the line starts where both sources agree instead.
// Seconds -> frames at 30fps:
//   "Tu equipo volvió a ganar,"                         2.6s -> 78
//   "Te prendieron mil bengalas hoy,"                   9.6s -> 288
//   "La banda grita tu nombre y ves,"                  16.2s -> 486
//   "Como la popular se va a caer"                     23.8s -> 714
//   "Pero tu estrella no está más,"                    30.9s -> 927
//   "Se la llevó la mañana..."                         37.8s -> 1134
//   "Arde la ciudad, llueve en tu mirada gris,"        44.0s -> 1321
//   "La gente festeja y vuelve a reír,"                51.7s -> 1550
//   "Pero este carnaval, que hoy no te deja dormir,"   57.6s -> 1728
//   "Mires donde mires ella está ahí"                  66.0s -> 1980
export const ARDE_BUBBLES: DarkBubble[] = [
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

export const ArdeChatScene: React.FC = () => {
  return (
    <AbsoluteFill>
      <Img
        src={BACKGROUND_SRC}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        {/* Same framing as FakeChatSoloScene. All bubbles are laid out
            from frame 0 (just invisible pre-atFrame), so the centered
            block never drifts as messages reveal. */}
        <div style={{ width: 620, transform: "scale(1.6)" }}>
          <DarkChatLog bubbles={ARDE_BUBBLES} dateLabel="Hoy" />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
