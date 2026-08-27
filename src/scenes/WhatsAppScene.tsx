import { AbsoluteFill, staticFile } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { PhotoPhoneMockup } from "../components/PhotoPhoneMockup";
import { DarkChatLog, type DarkBubble } from "../components/DarkChatLog";
import {
  CATALOG_ASK_MESSAGE,
  CATALOG_GREETING_MESSAGE,
  CATALOG_LINK_MESSAGE,
  CATALOG_INFO_MESSAGE,
  CATALOG_THANKS_MESSAGE,
} from "./CatalogRequestScene";

// The exact real message the previous scene's own order produces — same
// two products (Burger Clásica x1, Burger Bacon BBQ x1), same real
// DEFAULT_MSG_CART template and formatPrice()/toLocaleString('es-AR')
// output from catalogo_v28.html's sendCartToWA(). Computed once via
// catalog-director.js's window.open interception (Playwright), not
// invented — verify by rerunning that capture if CART_CUES or the demo
// cart items in CartScene ever change.
const ORDER_MESSAGE =
  "¡Hola Burger House! 👋 Quiero hacer el siguiente pedido:\n\n" +
  "1. *Burger Clásica* x1 — $9800 (Subtotal: $9.800)\n" +
  "2. *Burger Bacon BBQ* x1 — $12500 (Subtotal: $12.500)\n\n" +
  "*Total: $22.300*\n\n" +
  "¿Pueden confirmarme disponibilidad? 😊";

// The business's own reply, confirming the order — supplied by the user.
const REPLY_MESSAGE =
  "¡Excelente, Martina! 😊\n" +
  "Tu pedido quedó confirmado 🎉\n\n" +
  "⏱️ En aproximadamente 25 minutos va a estar listo.\n\n" +
  "¿Lo retirás por el local o querés que te lo enviemos? 🛵";

const MOCKUP_SRC = staticFile("/mockups/whatsapp-dark-iphone-business.png");
// Measured from this photo's own pixels (877x1794): header bottom
// edge at y≈285, input bar top edge at y≈1600, screen sides at
// x≈55/802. Re-measure if this reference image is ever swapped.
const IMAGE_ASPECT = 1794 / 877;
const CHAT_AREA = { top: "15.9%", bottom: "10.8%", left: "6.3%", right: "8.6%" };

const BUBBLES: DarkBubble[] = [
  // Same catalog-request exchange as CatalogRequestScene, seen from
  // the business's side (from flipped) — already settled in before
  // this scene starts, so it reads as chat history rather than
  // something that just happened.
  { from: "them", text: CATALOG_ASK_MESSAGE, timestamp: "12:38", atFrame: -40 },
  { from: "me", text: CATALOG_GREETING_MESSAGE, timestamp: "12:39", atFrame: -40 },
  { from: "me", text: CATALOG_LINK_MESSAGE, timestamp: "12:39", atFrame: -40 },
  { from: "me", text: CATALOG_INFO_MESSAGE, timestamp: "12:39", atFrame: -40 },
  { from: "them", text: CATALOG_THANKS_MESSAGE, timestamp: "12:40", atFrame: -40 },
  { from: "them", text: ORDER_MESSAGE, timestamp: "12:41", atFrame: 20 },
  { from: "me", text: REPLY_MESSAGE, timestamp: "12:42", atFrame: 110 },
];

/**
 * Mockup only — no caption. The business owner's phone, receiving the
 * order the customer just sent in CartScene and replying to confirm
 * it. A real photographed phone mockup (status bar, WhatsApp header
 * with the customer's contact photo, and input bar all baked into the
 * photo) — same technique as CatalogRequestScene, different reference
 * photo (this one's header says "Martina Gómez" instead of "Burger
 * House"). WhatsApp itself isn't part of Wapi, so this screen is a
 * faithful recreation of the real WhatsApp UI rather than a loaded
 * Wapi page — everything else in this project stays 100% real Wapi
 * code.
 */
export const WhatsAppScene: React.FC = () => {
  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <PhotoPhoneMockup width={760} src={MOCKUP_SRC} imageAspect={IMAGE_ASPECT} chatArea={CHAT_AREA}>
          <DarkChatLog bubbles={BUBBLES} compact />
        </PhotoPhoneMockup>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
