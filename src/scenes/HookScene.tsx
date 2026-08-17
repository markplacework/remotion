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

export const HookScene: React.FC = () => {
  return (
    <AbsoluteFill>
      <KenBurnsImage
        src={SOURCE}
        naturalWidth={SOURCE_IMAGE_WIDTH}
        naturalHeight={SOURCE_IMAGE_HEIGHT}
        from={{ x: 78, y: 16 }}
        to={{ x: 70, y: 14 }}
        zoomFrom={1.6}
        zoomTo={2.0}
        durationInFrames={SCENE_DURATION}
        brightness={0.85}
      />
      <CaptionScrim edge="bottom" height={720} />
      <SceneCaption
        bottom={210}
        delay={16}
        fontSize={92}
        durationInFrames={SCENE_DURATION}
        lines={[
          [{ text: "¿VENDÉS POR" }],
          [{ text: "WHATSAPP?", accent: true }],
        ]}
      />
    </AbsoluteFill>
  );
};
