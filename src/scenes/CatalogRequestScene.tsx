import { AbsoluteFill, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { PhotoPhoneMockup } from "../components/PhotoPhoneMockup";

// Steps 1-2 of the walkthrough: a customer asks for the catalog, the
// business shares its real Wapi link. Same customer who goes on to
// place the order later, so the whole video reads as one continuous
// interaction rather than two unrelated demos.
//
// Exported so WhatsAppScene can show this same exchange as the
// business owner's chat history, above the order that arrives later —
// same conversation thread, seen from the other phone.
export const CATALOG_ASK_MESSAGE = "Hola! 👋 ¿Tienen catálogo y precios?";
export const CATALOG_GREETING_MESSAGE = "¡Hola! 😊 Sí, mirá, te paso nuestro catálogo 👇";
// The real Wapi link — user-supplied, sent as its own message.
export const CATALOG_LINK_MESSAGE = "https://www.wapilink.com.ar/burguer-house";
export const CATALOG_INFO_MESSAGE =
  "Ahí podés ver todos nuestros productos, fotos y precios, y armar tu pedido directamente desde ahí 🛒";
export const CATALOG_THANKS_MESSAGE = "¡Genial! Gracias 🙌";

const MOCKUP_SRC = staticFile("/mockups/whatsapp-dark-iphone.png");

const FONT_STACK =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';

// Dark-mode WhatsApp's own real palette.
const WA = {
  bubbleOut: "#005c4b",
  bubbleIn: "#202c33",
  text: "#e9edef",
  timestamp: "#8696a0",
  readTick: "#53bdeb",
  link: "#53bdeb",
};

function IconReadTicks() {
  return (
    <svg width="16" height="11" viewBox="0 0 18 13" fill="none">
      <path d="M1 6.8l3.6 3.6L11 3.6" stroke={WA.readTick} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.3 6.8l3.6 3.6L17 3.6" stroke={WA.readTick} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function renderText(text: string) {
  if (/^https?:\/\//.test(text)) {
    return <span style={{ color: WA.link }}>{text}</span>;
  }
  return <span>{text}</span>;
}

type DarkBubble = { from: "them" | "me"; text: string; timestamp: string; atFrame: number };

const DarkChatBubble: React.FC<DarkBubble> = ({ from, text, timestamp, atFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - atFrame;
  const enter = spring({ frame: Math.max(0, local), fps, config: { damping: 15, mass: 0.6 } });
  const opacity = local < 0 ? 0 : Math.min(enter, 1);
  const scale = interpolate(enter, [0, 1], [0.85, 1]);
  const translateY = interpolate(enter, [0, 1], [14, 0]);
  const outgoing = from === "me";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: outgoing ? "flex-end" : "flex-start",
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
        transformOrigin: outgoing ? "top right" : "top left",
        marginBottom: 10,
      }}
    >
      <div
        style={{
          background: outgoing ? WA.bubbleOut : WA.bubbleIn,
          color: WA.text,
          borderRadius: outgoing ? "14px 3px 14px 14px" : "3px 14px 14px 14px",
          padding: "9px 12px 8px",
          maxWidth: "82%",
        }}
      >
        <div style={{ fontFamily: FONT_STACK, fontSize: 22, lineHeight: 1.36 }}>{renderText(text)}</div>
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 4, marginTop: 2 }}>
          <span style={{ fontFamily: FONT_STACK, fontSize: 15, color: WA.timestamp }}>{timestamp}</span>
          {outgoing && <IconReadTicks />}
        </div>
      </div>
    </div>
  );
};

const BUBBLES: DarkBubble[] = [
  { from: "me", text: CATALOG_ASK_MESSAGE, timestamp: "12:38", atFrame: 15 },
  { from: "them", text: CATALOG_GREETING_MESSAGE, timestamp: "12:39", atFrame: 60 },
  { from: "them", text: CATALOG_LINK_MESSAGE, timestamp: "12:39", atFrame: 90 },
  { from: "them", text: CATALOG_INFO_MESSAGE, timestamp: "12:39", atFrame: 120 },
  { from: "me", text: CATALOG_THANKS_MESSAGE, timestamp: "12:40", atFrame: 165 },
];

/**
 * Mockup only — no caption. Trial: uses a real photographed iPhone
 * mockup (status bar, WhatsApp header and input bar all baked into
 * the photo) instead of the hand-built CSS phone frame, with only the
 * chat log composited on top. See WhatsAppScene.tsx for the matching
 * exchange later in the video, from the business owner's side (still
 * on the CSS mockup).
 */
export const CatalogRequestScene: React.FC = () => {
  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <PhotoPhoneMockup width={760} src={MOCKUP_SRC}>
          <div style={{ padding: "14px 12px" }}>
            {BUBBLES.map((b, i) => (
              <DarkChatBubble key={i} {...b} />
            ))}
          </div>
        </PhotoPhoneMockup>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
