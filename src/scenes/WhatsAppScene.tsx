import { AbsoluteFill } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { PhoneMockup } from "../components/PhoneMockup";
import { WhatsAppMockup } from "../components/WhatsAppMockup";

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

// The customer's name as it would appear in the business owner's chat —
// example/placeholder content (same footing as the example social media
// handles already used elsewhere in this project), since a real customer
// name isn't part of Wapi's own data.
const CUSTOMER_NAME = "Martina Gómez";

/**
 * Mockup only — no caption. The business owner's phone, receiving the
 * order the customer just sent in CartScene. A different frame finish
 * (gold vs. the customer's graphite) so the two phones read as distinct
 * devices without ever needing a caption to say so. WhatsApp itself
 * isn't part of Wapi, so this screen is a faithful recreation of the
 * real WhatsApp UI rather than a loaded Wapi page — everything else in
 * this project stays 100% real Wapi code.
 */
export const WhatsAppScene: React.FC = () => {
  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <PhoneMockup width={760} sheenPosition={0.4} frameVariant="gold">
          <WhatsAppMockup contactName={CUSTOMER_NAME} message={ORDER_MESSAGE} timestamp="12:41" bubbleAtFrame={20} />
        </PhoneMockup>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
