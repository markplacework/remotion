import { AbsoluteFill, Sequence } from "remotion";
import { IntroScene } from "./scenes/IntroScene";
import { ShowcaseScene } from "./scenes/ShowcaseScene";
import { EditorScene } from "./scenes/EditorScene";
import { CatalogScene } from "./scenes/CatalogScene";
import { ClosingScene } from "./scenes/ClosingScene";
import { SceneTransition } from "./components/SceneTransition";
import {
  COLORS,
  SCENE_INTRO,
  SCENE_SHOWCASE,
  SCENE_EDITOR,
  SCENE_CATALOG,
  SCENE_CIERRE,
  TOTAL_DURATION,
  TRANSITION_FRAMES,
  VIDEO_WIDTH,
  VIDEO_HEIGHT,
  FPS,
} from "./theme";

export const WAPI_VIDEO_FPS = FPS;
export const WAPI_VIDEO_DURATION = TOTAL_DURATION;
export const WAPI_VIDEO_WIDTH = VIDEO_WIDTH;
export const WAPI_VIDEO_HEIGHT = VIDEO_HEIGHT;

export const WapiVideo: React.FC = () => {
  const s2 = SCENE_INTRO;
  const s3 = s2 + SCENE_SHOWCASE;
  const s4 = s3 + SCENE_EDITOR;
  const s5 = s4 + SCENE_CATALOG;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
      <Sequence durationInFrames={SCENE_INTRO}>
        <SceneTransition durationInFrames={SCENE_INTRO} transitionFrames={TRANSITION_FRAMES}>
          <IntroScene />
        </SceneTransition>
      </Sequence>
      <Sequence from={s2} durationInFrames={SCENE_SHOWCASE}>
        <SceneTransition durationInFrames={SCENE_SHOWCASE} transitionFrames={TRANSITION_FRAMES}>
          <ShowcaseScene />
        </SceneTransition>
      </Sequence>
      <Sequence from={s3} durationInFrames={SCENE_EDITOR}>
        <SceneTransition durationInFrames={SCENE_EDITOR} transitionFrames={TRANSITION_FRAMES}>
          <EditorScene />
        </SceneTransition>
      </Sequence>
      <Sequence from={s4} durationInFrames={SCENE_CATALOG}>
        <SceneTransition durationInFrames={SCENE_CATALOG} transitionFrames={TRANSITION_FRAMES}>
          <CatalogScene />
        </SceneTransition>
      </Sequence>
      <Sequence from={s5} durationInFrames={SCENE_CIERRE}>
        <SceneTransition durationInFrames={SCENE_CIERRE} transitionFrames={TRANSITION_FRAMES}>
          <ClosingScene />
        </SceneTransition>
      </Sequence>
    </AbsoluteFill>
  );
};
