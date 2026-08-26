import { AbsoluteFill, staticFile } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { PhoneMockup } from "../components/PhoneMockup";
import { ACTIVE_BUSINESS } from "../business";
import { CART_CUES } from "./cartCues";

declare global {
  interface Window {
    __catalogDirector?: {
      replay: (frame: number, cues: typeof CART_CUES) => Promise<void>;
    };
  }
}

const CATALOG_URL = staticFile(`/catalogo/${ACTIVE_BUSINESS.slug}.html`);

/**
 * Mockup only — no caption. The customer's phone: real published catalog,
 * scrolling to the products, adding two to the cart, opening the cart to
 * review it, then sending the order — all through the real page's own
 * cart/checkout functions (catalog-director.js), never simulated.
 */
export const CartScene: React.FC = () => {
  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <PhoneMockup
          width={760}
          src={CATALOG_URL}
          sheenPosition={0.55}
          frameVariant="graphite"
          driveFrame={async (win, frame) => {
            await win.__catalogDirector?.replay(frame, CART_CUES);
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
