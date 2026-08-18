import { AbsoluteFill, interpolate, staticFile } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { PhoneMockup } from "../components/PhoneMockup";
import { ACTIVE_BUSINESS } from "../business";
import { SCENE_CATALOG } from "../theme";

const CATALOG_URL = staticFile(`/catalogo/${ACTIVE_BUSINESS.slug}.html`);

/**
 * Mockup only — no caption. The phone itself never moves; revealing the
 * full published page (logo, portada, categories, products, footer) is
 * done by scrolling the real page's own content inside the screen.
 */
export const CatalogScene: React.FC = () => {
  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <PhoneMockup
          width={760}
          src={CATALOG_URL}
          sheenPosition={0.55}
          driveFrame={(win, frame) => {
            // Scroll all the way to the real bottom (footer + the footer
            // promo banner, if the business set one) rather than a fixed
            // pixel distance, so this adapts to any business's page length.
            const maxScroll = Math.max(0, win.document.body.scrollHeight - win.innerHeight);
            const progress = interpolate(frame, [25, SCENE_CATALOG - 25], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            win.scrollTo(0, maxScroll * progress);
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
