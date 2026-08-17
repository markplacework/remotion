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

export const ProblemScene: React.FC = () => {
  return (
    <AbsoluteFill>
      <KenBurnsImage
        src={SOURCE}
        naturalWidth={SOURCE_IMAGE_WIDTH}
        naturalHeight={SOURCE_IMAGE_HEIGHT}
        from={{ x: 65, y: 20 }}
        to={{ x: 70, y: 44 }}
        zoomFrom={1.7}
        zoomTo={2.3}
        durationInFrames={SCENE_DURATION}
        brightness={0.85}
      />
      <CaptionScrim edge="bottom" height={680} />
      <SceneCaption
        bottom={200}
        delay={12}
        fontSize={58}
        durationInFrames={SCENE_DURATION}
        lines={[
          [{ text: "Recibí pedidos de" }],
          [{ text: "forma " }, { text: "ordenada.", accent: true }],
        ]}
      />
    </AbsoluteFill>
  );
};
