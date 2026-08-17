import { AbsoluteFill, staticFile } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { Camera } from "../components/Camera";
import { PhoneMockup } from "../components/PhoneMockup";
import { AdText } from "../components/AdText";
import { ACTIVE_BUSINESS } from "../business";
import { SCENE_1_HOOK } from "../theme";
import { CatalogWindow, stopPortadaAutoplay } from "./catalogWindow";

const CATALOG_URL = staticFile(`/catalogo/${ACTIVE_BUSINESS.slug}.html`);

// Cycles through the real top portadas carousel (3 slides) so each banner
// gets its moment on screen, ending on the last one with a clear hold
// instead of cutting away mid-swipe. The separate footer promo banner is
// shown later, in the catalog scene's scroll. Paced to match the video's
// own slow, deliberate camera movement rather than a quick flip.
function portadaIndexForFrame(frame: number): number {
  if (frame < 30) return 0;
  if (frame < 80) return 1;
  return 2;
}

export const HookScene: React.FC = () => {
  return (
    <AbsoluteFill>
      <Backdrop />
      <Camera
        from={{ scale: 0.7, y: 40, rotateY: -14, rotateX: 6 }}
        to={{ scale: 0.86, y: -10, rotateY: -7, rotateX: 3 }}
        durationInFrames={SCENE_1_HOOK}
      >
        <PhoneMockup
          width={640}
          src={CATALOG_URL}
          sheenPosition={0.25}
          onReady={stopPortadaAutoplay}
          driveFrame={(win, frame) => {
            (win as CatalogWindow)._goPortada?.(portadaIndexForFrame(frame));
          }}
        />
      </Camera>
      <AdText
        top={130}
        delay={10}
        fontSize={78}
        lines={[[{ text: "Creá tu " }, { text: "catálogo", accent: true }], [{ text: "con Wapi." }]]}
      />
    </AbsoluteFill>
  );
};
