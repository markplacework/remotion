import { AbsoluteFill, Img, staticFile } from "remotion";
import { DarkChatLog, type DarkBubble } from "../components/DarkChatLog";

// User-supplied background — the real WhatsApp dark-mode wallpaper
// doodle pattern. Covers the full frame; the chat log sits on top,
// with no header/contact info of any kind (this conversation is
// entirely fictional, for a TikTok-style clip).
const BACKGROUND_SRC = staticFile("/fake-chat/background.png");

// Exact text as given, split into "Él" (outgoing/green, right side) and
// "Ella" (incoming/gray, left side) — never rendered as labels, only as
// bubble side + color, matching real WhatsApp's own visual language.
// His lines are song lyrics being dropped in one at a time (that's the
// joke — she reads them literally) — paced much slower than a normal
// back-and-forth (~2.5-3.7s between messages) so each line actually
// registers before the next lands, extra time after the longer/setup
// lines in particular.
const BUBBLES: DarkBubble[] = [
  // A small beat before anything appears at all (not instant at frame 0).
  { from: "me", text: "Estoy tratando de decirte que...", timestamp: "21:12", atFrame: 45 },
  // Extra-slow gap to this one specifically (170f/5.7s, vs. ~90-100f
  // elsewhere) per request.
  { from: "me", text: "Me desespero de esperarte", timestamp: "21:12", atFrame: 215 },
  { from: "them", text: "Hola amor, estoy en casa 🤷‍♀️", timestamp: "21:13", atFrame: 310 },
  { from: "me", text: "Que no salgo a buscarte porque sé...", timestamp: "21:14", atFrame: 405 },
  { from: "me", text: "Que corro el riesgo de encontrarte", timestamp: "21:14", atFrame: 485 },
  { from: "them", text: "Y bueno, no salgas 😭", timestamp: "21:14", atFrame: 580 },
  {
    from: "me",
    text: "Que me sigo mordiendo noche y día las uñas del rencor",
    timestamp: "21:15",
    atFrame: 675,
  },
  { from: "them", text: "¿Estás bien? 😟", timestamp: "21:15", atFrame: 775 },
  {
    from: "me",
    text: "Que te sigo debiendo todavía una canción de amor",
    timestamp: "21:16",
    atFrame: 870,
  },
];

// The clip now ends right on his last line — no more reply from her.
// Last bubble's entrance settles ~15-20 frames after its atFrame.
export const FAKE_CHAT_LAST_FRAME = 870;

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
