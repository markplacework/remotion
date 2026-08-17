import { AbsoluteFill, Audio, interpolate, Sequence, staticFile } from "remotion";
import { HookScene } from "./scenes/HookScene";
import { ProblemScene } from "./scenes/ProblemScene";
import { OrderScene } from "./scenes/OrderScene";
import { SolutionScene } from "./scenes/SolutionScene";
import { CtaScene } from "./scenes/CtaScene";
import { Vignette } from "./components/Vignette";
import { Grain } from "./components/Grain";
import { COLORS, SCENE_DURATION } from "./theme";
import { CTA_DING, MUSIC, TRANSITION_TICK, VOICE_OVER } from "./audio/soundDesign";

export const WAPI_AD_FPS = 30;
export const WAPI_AD_DURATION = SCENE_DURATION * 5;
export const WAPI_AD_WIDTH = 1080;
export const WAPI_AD_HEIGHT = 1920;

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

      <Audio
        src={staticFile(MUSIC.file)}
        volume={(f) =>
          MUSIC.volume *
          interpolate(f, [0, 20, WAPI_AD_DURATION - 20, WAPI_AD_DURATION], [0, 1, 1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        }
      />

      {VOICE_OVER.map((line) => (
        <Sequence key={line.file} from={line.from}>
          <Audio src={staticFile(line.file)} volume={() => 1} />
        </Sequence>
      ))}

      {TRANSITION_TICK.cues.map((cue) => (
        <Sequence key={cue} from={cue}>
          <Audio src={staticFile(TRANSITION_TICK.file)} volume={() => TRANSITION_TICK.volume} />
        </Sequence>
      ))}

      <Sequence from={CTA_DING.from}>
        <Audio src={staticFile(CTA_DING.file)} volume={() => CTA_DING.volume} />
      </Sequence>
    </AbsoluteFill>
  );
};
