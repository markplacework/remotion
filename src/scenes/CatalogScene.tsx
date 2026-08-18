import { AbsoluteFill, interpolate, staticFile } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { Camera } from "../components/Camera";
import { PhoneMockup } from "../components/PhoneMockup";
import { ACTIVE_BUSINESS } from "../business";
import { SCENE_CATALOG } from "../theme";

const CATALOG_URL = staticFile(`/catalogo/${ACTIVE_BUSINESS.slug}.html`);

/**
 * Scrolling to reveal the full published page (logo, portada, categories,
 * products, footer) is a camera choice, not a Wapi behavior — separate
 * from the portada carousel, which this scene doesn't touch at all.
 */
export const CatalogScene: React.FC = () => {
  return (
    <AbsoluteFill>
      <Backdrop />
      <Camera from={{ scale: 0.92, y: 16 }} to={{ scale: 1.0, y: 0 }} durationInFrames={SCENE_CATALOG}>
        <PhoneMockup
          width={660}
          src={CATALOG_URL}
          sheenPosition={0.55}
          driveFrame={(win, frame) => {
            // Scroll all the way to the real bottom (footer + the footer
            // promo banner, if the business set one) rather than a fixed
            // pixel distance, so this adapts to any business's page length.
            const maxScroll = Math.max(0, win.document.body.scrollHeight - win.innerHeight);
            const progress = interpolate(frame, [20, SCENE_CATALOG - 15], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            win.scrollTo(0, maxScroll * progress);
          }}
        />
      </Camera>
    </AbsoluteFill>
  );
};
