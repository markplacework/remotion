import { AbsoluteFill, Img, staticFile } from "remotion";
import { DarkChatLog, type DarkBubble } from "../components/DarkChatLog";

// User-supplied background — the real WhatsApp dark-mode wallpaper
// doodle pattern. Covers the full frame; the chat log sits on top,
// with no header/contact info of any kind (this conversation is
// entirely fictional, for a TikTok-style clip).
const BACKGROUND_SRC = staticFile("/fake-chat/background.png");

// User-supplied song this clip is built around (his lines are its
// lyrics). Exported so FakeChat.tsx / FakeChatSolo.tsx can play it and
// size the composition to its length — 45.531s measured directly from
// the decoded audio (1,003,968 samples @ 22050Hz), rounded up a hair
// to 1367 frames @ 30fps so playback is never truncated.
export const SONG_URL = staticFile("/fake-chat/song.mp3");
export const SONG_DURATION_FRAMES = 1367;

// Exact text as given, split into "Él" (outgoing/green, right side) and
// "Ella" (incoming/gray, left side) — never rendered as labels, only as
// bubble side + color, matching real WhatsApp's own visual language.
//
// His 6 lines' atFrame values are the REAL sung timestamps, transcribed
// word-by-word from song.mp3 with faster-whisper (small model,
// word_timestamps=True, biased with an initial_prompt of the expected
// lyrics — without it, the quiet opening line got skipped entirely).
// Seconds -> frames at 30fps, rounded to the nearest frame:
//   "Estoy tratando de decirte que..."      1.66s -> 50
//   "Me desespero de esperarte"             7.44s -> 223
//   "Que no salgo a buscarte porque sé..." 11.88s -> 356
//   "Que corro el riesgo de encontrarte"   15.74s -> 472
//   "Que me sigo mordiendo..."             20.82s -> 625
//   "Que te sigo debiendo..."              28.78s -> 863
// Her 3 lines aren't sung (fictional reactions) — placed within the
// generous gap before each following "me" line, not tied to the audio.
export const BUBBLES: DarkBubble[] = [
  { from: "me", text: "Estoy tratando de decirte que...", timestamp: "21:12", atFrame: 50 },
  { from: "me", text: "Me desespero de esperarte", timestamp: "21:12", atFrame: 223 },
  { from: "them", text: "Hola amor, estoy en casa 🤷‍♀️", timestamp: "21:13", atFrame: 280 },
  { from: "me", text: "Que no salgo a buscarte porque sé...", timestamp: "21:14", atFrame: 356 },
  { from: "me", text: "Que corro el riesgo de encontrarte", timestamp: "21:14", atFrame: 472 },
  { from: "them", text: "Y bueno, no salgas 😭", timestamp: "21:14", atFrame: 545 },
  {
    from: "me",
    text: "Que me sigo mordiendo noche y día las uñas del rencor",
    timestamp: "21:15",
    atFrame: 625,
  },
  { from: "them", text: "¿Estás bien? 😟", timestamp: "21:15", atFrame: 745 },
  {
    from: "me",
    text: "Que te sigo debiendo todavía una canción de amor",
    timestamp: "21:16",
    atFrame: 863,
  },
];

// The clip now ends right on his last line — no more reply from her.
// Last bubble's entrance settles ~15-20 frames after its atFrame.
export const FAKE_CHAT_LAST_FRAME = 863;

export const FakeChatScene: React.FC = () => {
  return (
    <AbsoluteFill>
      <Img
        src={BACKGROUND_SRC}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        {/* DarkChatLog's own font/spacing were tuned for a narrow
            phone-mockup chat-area overlay elsewhere in the project —
            scaled up here so the conversation fills the screen like a
            real full-bleed WhatsApp screenshot instead of sitting as a
            small centered column. All bubbles are already laid out
            (just invisible pre-atFrame), so this block's footprint is
            constant for the whole video — centering it doesn't drift
            as messages reveal. */}
        <div style={{ width: 620, transform: "scale(1.6)" }}>
          <DarkChatLog bubbles={BUBBLES} dateLabel="Hoy" />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
