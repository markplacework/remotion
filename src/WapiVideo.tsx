import { AbsoluteFill, Sequence } from "remotion";
import { HookScene } from "./scenes/HookScene";
import { EditorScene } from "./scenes/EditorScene";
import { CatalogScene } from "./scenes/CatalogScene";
import { CtaScene } from "./scenes/CtaScene";
import { SceneTransition } from "./components/SceneTransition";
import {
  COLORS,
  SCENE_1_HOOK,
  SCENE_2_EDITOR,
  SCENE_3_CATALOG,
  SCENE_4_CTA,
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
  const s2 = SCENE_1_HOOK;
  const s3 = s2 + SCENE_2_EDITOR;
  const s4 = s3 + SCENE_3_CATALOG;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
      <Sequence durationInFrames={SCENE_1_HOOK}>
        <SceneTransition durationInFrames={SCENE_1_HOOK} transitionFrames={TRANSITION_FRAMES}>
          <HookScene />
        </SceneTransition>
      </Sequence>
      <Sequence from={s2} durationInFrames={SCENE_2_EDITOR}>
        <SceneTransition durationInFrames={SCENE_2_EDITOR} transitionFrames={TRANSITION_FRAMES}>
          <EditorScene />
        </SceneTransition>
      </Sequence>
      <Sequence from={s3} durationInFrames={SCENE_3_CATALOG}>
        <SceneTransition durationInFrames={SCENE_3_CATALOG} transitionFrames={TRANSITION_FRAMES}>
          <CatalogScene />
        </SceneTransition>
      </Sequence>
      <Sequence from={s4} durationInFrames={SCENE_4_CTA}>
        <SceneTransition durationInFrames={SCENE_4_CTA} transitionFrames={TRANSITION_FRAMES}>
          <CtaScene />
        </SceneTransition>
      </Sequence>
    </AbsoluteFill>
  );
};
