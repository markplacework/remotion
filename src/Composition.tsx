import { Composition } from "remotion";
import {
  WapiVideo,
  WAPI_VIDEO_DURATION,
  WAPI_VIDEO_FPS,
  WAPI_VIDEO_HEIGHT,
  WAPI_VIDEO_WIDTH,
} from "./WapiVideo";

export const WapiVideoComposition = () => {
  return (
    <Composition
      id="WapiVideo"
      component={WapiVideo}
      durationInFrames={WAPI_VIDEO_DURATION}
      fps={WAPI_VIDEO_FPS}
      width={WAPI_VIDEO_WIDTH}
      height={WAPI_VIDEO_HEIGHT}
    />
  );
};
