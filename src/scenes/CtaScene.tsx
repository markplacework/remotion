import { AbsoluteFill, staticFile } from "remotion";
import { KenBurnsImage } from "../components/KenBurnsImage";
import { CtaCard } from "../components/CtaCard";
import {
  COLORS,
  SCENE_DURATION,
  SOURCE_IMAGE_HEIGHT,
  SOURCE_IMAGE_WIDTH,
} from "../theme";

const SOURCE = staticFile("wapi-ad-source.jpg");

export const CtaScene: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
      <KenBurnsImage
        src={SOURCE}
        naturalWidth={SOURCE_IMAGE_WIDTH}
        naturalHeight={SOURCE_IMAGE_HEIGHT}
        from={{ x: 50, y: 88 }}
        to={{ x: 50, y: 85 }}
        zoomFrom={1.3}
        zoomTo={1.5}
        durationInFrames={SCENE_DURATION}
        brightness={0.32}
        saturate={0.9}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(5,6,5,0.2) 0%, rgba(5,6,5,0.85) 75%)",
        }}
      />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CtaCard />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
