import { AbsoluteFill, staticFile } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { PhotoPhoneMockup } from "../components/PhotoPhoneMockup";
import { DarkChatLog, type DarkBubble } from "../components/DarkChatLog";

// Steps 1-2 of the walkthrough: a customer asks for the catalog, the
// business shares its real Wapi link. Same customer who goes on to
// place the order later, so the whole video reads as one continuous
// interaction rather than two unrelated demos.
const CATALOG_ASK_MESSAGE = "Hola! 👋 ¿Tienen catálogo y precios?";
const CATALOG_GREETING_MESSAGE = "¡Hola! 😊 Sí, mirá, te paso nuestro catálogo 👇";
// The real Wapi link — user-supplied, sent as its own message.
const CATALOG_LINK_MESSAGE = "https://www.wapilink.com.ar/burguer-house";
const CATALOG_THANKS_MESSAGE = "¡Genial! Gracias 🙌";

const MOCKUP_SRC = staticFile("/mockups/whatsapp-dark-iphone.png");

const BUBBLES: DarkBubble[] = [
  { from: "me", text: CATALOG_ASK_MESSAGE, timestamp: "12:38", atFrame: 15 },
  { from: "them", text: CATALOG_GREETING_MESSAGE, timestamp: "12:39", atFrame: 60 },
  { from: "them", text: CATALOG_LINK_MESSAGE, timestamp: "12:39", atFrame: 90 },
  { from: "me", text: CATALOG_THANKS_MESSAGE, timestamp: "12:40", atFrame: 130 },
];

/**
 * Mockup only — no caption. Trial: uses a real photographed iPhone
 * mockup (status bar, WhatsApp header and input bar all baked into
 * the photo) instead of the hand-built CSS phone frame, with only the
 * chat log composited on top. See WhatsAppScene.tsx for the matching
 * exchange later in the video, from the business owner's side (same
 * photo-mockup technique, different reference photo).
 */
export const CatalogRequestScene: React.FC = () => {
  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: "10%" }}>
        <PhotoPhoneMockup width={760} src={MOCKUP_SRC}>
          <DarkChatLog bubbles={BUBBLES} />
        </PhotoPhoneMockup>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
