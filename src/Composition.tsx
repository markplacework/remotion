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
import {
  FakeChatSolo,
  FAKE_CHAT_SOLO_DURATION,
  FAKE_CHAT_SOLO_FPS,
  FAKE_CHAT_SOLO_HEIGHT,
  FAKE_CHAT_SOLO_WIDTH,
} from "./FakeChatSolo";
import {
  FakeChatSoloPhone,
  FAKE_CHAT_SOLO_PHONE_DURATION,
  FAKE_CHAT_SOLO_PHONE_FPS,
  FAKE_CHAT_SOLO_PHONE_HEIGHT,
  FAKE_CHAT_SOLO_PHONE_WIDTH,
} from "./FakeChatSoloPhone";
import { LyricSync, LYRIC_SYNC_DURATION, LYRIC_SYNC_FPS, LYRIC_SYNC_HEIGHT, LYRIC_SYNC_WIDTH } from "./LyricSync";
import {
  LyricSync2,
  LYRIC_SYNC_2_DURATION,
  LYRIC_SYNC_2_FPS,
  LYRIC_SYNC_2_HEIGHT,
  LYRIC_SYNC_2_WIDTH,
} from "./LyricSync2";
import {
  LyricSync3,
  LYRIC_SYNC_3_DURATION,
  LYRIC_SYNC_3_FPS,
  LYRIC_SYNC_3_HEIGHT,
  LYRIC_SYNC_3_WIDTH,
} from "./LyricSync3";
import {
  LyricSync4,
  LYRIC_SYNC_4_DURATION,
  LYRIC_SYNC_4_FPS,
  LYRIC_SYNC_4_HEIGHT,
  LYRIC_SYNC_4_WIDTH,
} from "./LyricSync4";

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
      <Composition
        id="FakeChatSolo"
        component={FakeChatSolo}
        durationInFrames={FAKE_CHAT_SOLO_DURATION}
        fps={FAKE_CHAT_SOLO_FPS}
        width={FAKE_CHAT_SOLO_WIDTH}
        height={FAKE_CHAT_SOLO_HEIGHT}
      />
      <Composition
        id="FakeChatSoloPhone"
        component={FakeChatSoloPhone}
        durationInFrames={FAKE_CHAT_SOLO_PHONE_DURATION}
        fps={FAKE_CHAT_SOLO_PHONE_FPS}
        width={FAKE_CHAT_SOLO_PHONE_WIDTH}
        height={FAKE_CHAT_SOLO_PHONE_HEIGHT}
      />
      <Composition
        id="LyricSync"
        component={LyricSync}
        durationInFrames={LYRIC_SYNC_DURATION}
        fps={LYRIC_SYNC_FPS}
        width={LYRIC_SYNC_WIDTH}
        height={LYRIC_SYNC_HEIGHT}
      />
      <Composition
        id="LyricSync2"
        component={LyricSync2}
        durationInFrames={LYRIC_SYNC_2_DURATION}
        fps={LYRIC_SYNC_2_FPS}
        width={LYRIC_SYNC_2_WIDTH}
        height={LYRIC_SYNC_2_HEIGHT}
      />
      <Composition
        id="LyricSync3"
        component={LyricSync3}
        durationInFrames={LYRIC_SYNC_3_DURATION}
        fps={LYRIC_SYNC_3_FPS}
        width={LYRIC_SYNC_3_WIDTH}
        height={LYRIC_SYNC_3_HEIGHT}
      />
      <Composition
        id="LyricSync4"
        component={LyricSync4}
        durationInFrames={LYRIC_SYNC_4_DURATION}
        fps={LYRIC_SYNC_4_FPS}
        width={LYRIC_SYNC_4_WIDTH}
        height={LYRIC_SYNC_4_HEIGHT}
      />
    </>
  );
};
