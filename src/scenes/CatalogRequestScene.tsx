import { AbsoluteFill } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { PhoneMockup } from "../components/PhoneMockup";
import { WhatsAppMockup } from "../components/WhatsAppMockup";

// Steps 1-2 of the walkthrough: a customer asks for the catalog, the
// business shares its real Wapi link. Same customer (Martina) who goes
// on to place the order later, so the whole video reads as one
// continuous interaction rather than two unrelated demos. Shown from
// the customer's own phone this time (graphite, matching CartScene),
// contact name is the business — mirrors WhatsAppScene at the end,
// which shows the same exchange from the business owner's gold phone.
const ASK_MESSAGE = "Hola! 👋 Tienen catálogo y precios?";

// The real Wapi link — user-supplied.
const REPLY_MESSAGE =
  "¡Hola Martina! Sí, mirá nuestro catálogo acá 👇\n" +
  "www.wapilink.com.ar/burguer-house\n\n" +
  "Vas a poder ver todos los productos con fotos y precios, y armar tu pedido directo desde ahí 🍔";

const BUSINESS_NAME = "Burger House";

/**
 * Mockup only — no caption. See WhatsAppScene.tsx for the matching
 * exchange later in the video, from the business owner's side.
 */
export const CatalogRequestScene: React.FC = () => {
  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <PhoneMockup width={760} sheenPosition={0.4} frameVariant="graphite">
          <WhatsAppMockup
            contactName={BUSINESS_NAME}
            bubbles={[
              { from: "me", text: ASK_MESSAGE, timestamp: "12:38", atFrame: 15 },
              { from: "them", text: REPLY_MESSAGE, timestamp: "12:39", atFrame: 95 },
            ]}
          />
        </PhoneMockup>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
