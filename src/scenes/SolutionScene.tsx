import { AbsoluteFill, staticFile } from "remotion";
import { KenBurnsImage } from "../components/KenBurnsImage";
import { SceneCaption } from "../components/SceneCaption";
import { CaptionScrim } from "../components/CaptionScrim";
import {
  SCENE_DURATION,
  SOURCE_IMAGE_HEIGHT,
  SOURCE_IMAGE_WIDTH,
} from "../theme";

const SOURCE = staticFile("wapi-ad-source.jpg");

export const SolutionScene: React.FC = () => {
  return (
    <AbsoluteFill>
      <KenBurnsImage
        src={SOURCE}
        naturalWidth={SOURCE_IMAGE_WIDTH}
        naturalHeight={SOURCE_IMAGE_HEIGHT}
        from={{ x: 60, y: 48 }}
        to={{ x: 76, y: 60 }}
        zoomFrom={2.2}
        zoomTo={2.7}
        durationInFrames={SCENE_DURATION}
        brightness={0.85}
      />
      <CaptionScrim edge="bottom" height={680} />
      <SceneCaption
        bottom={190}
        delay={14}
        fontSize={88}
        durationInFrames={SCENE_DURATION}
        lines={[[{ text: "Vendé " }, { text: "más fácil.", accent: true }]]}
      />
    </AbsoluteFill>
  );
};
