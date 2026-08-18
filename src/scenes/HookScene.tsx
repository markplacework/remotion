import { AbsoluteFill, staticFile } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { Camera } from "../components/Camera";
import { PhoneMockup } from "../components/PhoneMockup";
import { AdText } from "../components/AdText";
import { ACTIVE_BUSINESS } from "../business";
import { SCENE_1_HOOK } from "../theme";
import { driveCatalogCarousel } from "./catalogWindow";

const CATALOG_URL = staticFile(`/catalogo/${ACTIVE_BUSINESS.slug}.html`);

// Holds each portada ~2.5s, an instant cut (see driveCatalogCarousel) not
// an animated slide. Only shows as many slides as comfortably fit in this
// scene's 4.5s — better to hold on one banner a beat longer than to rush
// through all of them.
function portadaIndexForFrame(frame: number): number {
  if (frame < 75) return 0;
  return 1;
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
          driveFrame={(win, frame) => {
            driveCatalogCarousel(win, portadaIndexForFrame(frame));
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
