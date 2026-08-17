import { Composition } from "remotion";
import {
  WapiAd,
  WAPI_AD_DURATION,
  WAPI_AD_FPS,
  WAPI_AD_HEIGHT,
  WAPI_AD_WIDTH,
} from "./WapiAd";

export const WapiAdComposition = () => {
  return (
    <Composition
      id="WapiAd"
      component={WapiAd}
      durationInFrames={WAPI_AD_DURATION}
      fps={WAPI_AD_FPS}
      width={WAPI_AD_WIDTH}
      height={WAPI_AD_HEIGHT}
    />
  );
};
