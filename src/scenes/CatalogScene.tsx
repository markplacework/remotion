import { AbsoluteFill, interpolate, staticFile } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { Camera } from "../components/Camera";
import { PhoneMockup } from "../components/PhoneMockup";
import { ACTIVE_BUSINESS } from "../business";
import { SCENE_3_CATALOG } from "../theme";

const CATALOG_URL = staticFile(`/catalogo/${ACTIVE_BUSINESS.slug}.html`);

export const CatalogScene: React.FC = () => {
  return (
    <AbsoluteFill>
      <Backdrop />
      <Camera
        from={{ scale: 0.82, x: 30, y: 30, rotateY: -9, rotateX: 4 }}
        to={{ scale: 1.02, x: -10, y: -14, rotateY: 4, rotateX: -1 }}
        durationInFrames={SCENE_3_CATALOG}
      >
        <PhoneMockup
          width={640}
          src={CATALOG_URL}
          sheenPosition={0.55}
          driveFrame={(win, frame) => {
            const y = interpolate(frame, [20, SCENE_3_CATALOG - 10], [0, 520], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            win.scrollTo(0, y);
          }}
        />
      </Camera>
    </AbsoluteFill>
  );
};
