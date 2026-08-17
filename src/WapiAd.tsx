import { AbsoluteFill, Sequence } from "remotion";
import { HookScene } from "./scenes/HookScene";
import { ProblemScene } from "./scenes/ProblemScene";
import { OrderScene } from "./scenes/OrderScene";
import { SolutionScene } from "./scenes/SolutionScene";
import { CtaScene } from "./scenes/CtaScene";
import { Vignette } from "./components/Vignette";
import { Grain } from "./components/Grain";
import { COLORS, SCENE_DURATION } from "./theme";

export const WAPI_AD_FPS = 30;
export const WAPI_AD_DURATION = SCENE_DURATION * 5;
export const WAPI_AD_WIDTH = 1080;
export const WAPI_AD_HEIGHT = 1920;

// Uncomment once you've added files to public/audio/ (see
// src/audio/soundDesign.ts and public/audio/README.md for the cue sheet).
//
// import { Audio } from "remotion";
// import { SOUND_CUES } from "./audio/soundDesign";
//
// <Audio src={staticFile(SOUND_CUES.music.file)} volume={SOUND_CUES.music.volume} />
// <Sequence from={SOUND_CUES.whatsappNotification.from}>
//   <Audio src={staticFile(SOUND_CUES.whatsappNotification.file)} volume={SOUND_CUES.whatsappNotification.volume} />
// </Sequence>
// {SOUND_CUES.whoosh.cues.map((cue) => (
//   <Sequence key={cue} from={cue}>
//     <Audio src={staticFile(SOUND_CUES.whoosh.file)} volume={SOUND_CUES.whoosh.volume} />
//   </Sequence>
// ))}
// <Sequence from={SOUND_CUES.ctaChime.from}>
//   <Audio src={staticFile(SOUND_CUES.ctaChime.file)} volume={SOUND_CUES.ctaChime.volume} />
// </Sequence>

export const WapiAd: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
      <Sequence durationInFrames={SCENE_DURATION}>
        <HookScene />
      </Sequence>
      <Sequence from={SCENE_DURATION} durationInFrames={SCENE_DURATION}>
        <ProblemScene />
      </Sequence>
      <Sequence from={SCENE_DURATION * 2} durationInFrames={SCENE_DURATION}>
        <OrderScene />
      </Sequence>
      <Sequence from={SCENE_DURATION * 3} durationInFrames={SCENE_DURATION}>
        <SolutionScene />
      </Sequence>
      <Sequence from={SCENE_DURATION * 4} durationInFrames={SCENE_DURATION}>
        <CtaScene />
      </Sequence>
      <Vignette />
      <Grain />
    </AbsoluteFill>
  );
};
