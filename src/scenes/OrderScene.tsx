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

export const OrderScene: React.FC = () => {
  return (
    <AbsoluteFill>
      <KenBurnsImage
        src={SOURCE}
        naturalWidth={SOURCE_IMAGE_WIDTH}
        naturalHeight={SOURCE_IMAGE_HEIGHT}
        from={{ x: 60, y: 30 }}
        to={{ x: 20, y: 53 }}
        zoomFrom={1.7}
        zoomTo={2.6}
        durationInFrames={SCENE_DURATION}
        brightness={0.85}
      />
      <CaptionScrim edge="top" height={520} />
      <SceneCaption
        top={130}
        delay={20}
        fontSize={50}
        durationInFrames={SCENE_DURATION}
        lines={[
          [{ text: "Tu cliente arma su pedido" }],
          [{ text: "y vos lo recibís " }, { text: "listo.", accent: true }],
        ]}
      />
    </AbsoluteFill>
  );
};
