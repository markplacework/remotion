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
import {
  WapiCartOrder,
  WAPI_CART_ORDER_DURATION,
  WAPI_CART_ORDER_FPS,
  WAPI_CART_ORDER_HEIGHT,
  WAPI_CART_ORDER_WIDTH,
} from "./WapiCartOrder";
import { FakeChat, FAKE_CHAT_DURATION, FAKE_CHAT_FPS, FAKE_CHAT_HEIGHT, FAKE_CHAT_WIDTH } from "./FakeChat";

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
      <Composition
        id="WapiCartOrder"
        component={WapiCartOrder}
        durationInFrames={WAPI_CART_ORDER_DURATION}
        fps={WAPI_CART_ORDER_FPS}
        width={WAPI_CART_ORDER_WIDTH}
        height={WAPI_CART_ORDER_HEIGHT}
      />
      <Composition
        id="FakeChat"
        component={FakeChat}
        durationInFrames={FAKE_CHAT_DURATION}
        fps={FAKE_CHAT_FPS}
        width={FAKE_CHAT_WIDTH}
        height={FAKE_CHAT_HEIGHT}
      />
    </>
  );
};
