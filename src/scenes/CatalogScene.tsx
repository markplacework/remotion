import { AbsoluteFill, interpolate, staticFile } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { PhoneMockup, mockupHeightFor } from "../components/PhoneMockup";
import { TextBeat } from "../components/TextBeat";
import { ACTIVE_BUSINESS } from "../business";
import { SCENE_CATALOG, VIDEO_HEIGHT } from "../theme";

const CATALOG_URL = staticFile(`/catalogo/${ACTIVE_BUSINESS.slug}.html`);

const PHONE_WIDTH = 560;
const PHONE_HEIGHT = mockupHeightFor(PHONE_WIDTH);
const PHONE_TOP = (VIDEO_HEIGHT - PHONE_HEIGHT) / 2;
const PHONE_BOTTOM = PHONE_TOP + PHONE_HEIGHT;

/**
 * The mockup itself never moves here — revealing the full published page
 * (logo, portada, categories, products, footer) is done by scrolling the
 * real page's own content inside the screen, not by moving the phone.
 */
export const CatalogScene: React.FC = () => {
  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <PhoneMockup
          width={PHONE_WIDTH}
          src={CATALOG_URL}
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
      <TextBeat
        top={PHONE_BOTTOM + 90}
        fontSize={40}
        window={[10, 28, 68, 85]}
        lines={[[{ text: "Tu " }, { text: "catálogo", accent: true }, { text: ", publicado." }]]}
      />
    </AbsoluteFill>
  );
};
