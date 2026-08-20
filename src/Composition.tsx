import { Composition } from "remotion";
import {
  WapiVideo,
  WAPI_VIDEO_DURATION,
  WAPI_VIDEO_FPS,
  WAPI_VIDEO_HEIGHT,
  WAPI_VIDEO_WIDTH,
} from "./WapiVideo";
import {
  WapiAdShort,
  WAPI_AD_SHORT_DURATION,
  WAPI_AD_SHORT_FPS,
  WAPI_AD_SHORT_HEIGHT,
  WAPI_AD_SHORT_WIDTH,
} from "./WapiAdShort";

export const WapiVideoComposition = () => {
  return (
    <>
      <Composition
        id="WapiVideo"
        component={WapiVideo}
        durationInFrames={WAPI_VIDEO_DURATION}
        fps={WAPI_VIDEO_FPS}
        width={WAPI_VIDEO_WIDTH}
        height={WAPI_VIDEO_HEIGHT}
      />
      <Composition
        id="WapiAdShort"
        component={WapiAdShort}
        durationInFrames={WAPI_AD_SHORT_DURATION}
        fps={WAPI_AD_SHORT_FPS}
        width={WAPI_AD_SHORT_WIDTH}
        height={WAPI_AD_SHORT_HEIGHT}
      />
    </>
  );
};
