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
import {
  LyricSync5,
  LYRIC_SYNC_5_DURATION,
  LYRIC_SYNC_5_FPS,
  LYRIC_SYNC_5_HEIGHT,
  LYRIC_SYNC_5_WIDTH,
} from "./LyricSync5";
import {
  LyricSync6,
  LYRIC_SYNC_6_DURATION,
  LYRIC_SYNC_6_FPS,
  LYRIC_SYNC_6_HEIGHT,
  LYRIC_SYNC_6_WIDTH,
} from "./LyricSync6";
import {
  LyricSync7,
  LYRIC_SYNC_7_DURATION,
  LYRIC_SYNC_7_FPS,
  LYRIC_SYNC_7_HEIGHT,
  LYRIC_SYNC_7_WIDTH,
} from "./LyricSync7";
import {
  LyricSync8,
  LYRIC_SYNC_8_DURATION,
  LYRIC_SYNC_8_FPS,
  LYRIC_SYNC_8_HEIGHT,
  LYRIC_SYNC_8_WIDTH,
} from "./LyricSync8";
import {
  LyricSync9,
  LYRIC_SYNC_9_DURATION,
  LYRIC_SYNC_9_FPS,
  LYRIC_SYNC_9_HEIGHT,
  LYRIC_SYNC_9_WIDTH,
} from "./LyricSync9";
import {
  LyricSync10,
  LYRIC_SYNC_10_DURATION,
  LYRIC_SYNC_10_FPS,
  LYRIC_SYNC_10_HEIGHT,
  LYRIC_SYNC_10_WIDTH,
} from "./LyricSync10";
import {
  LyricSync11,
  LYRIC_SYNC_11_DURATION,
  LYRIC_SYNC_11_FPS,
  LYRIC_SYNC_11_HEIGHT,
  LYRIC_SYNC_11_WIDTH,
} from "./LyricSync11";
import {
  LyricSync11Short,
  LYRIC_SYNC_11_SHORT_DURATION,
  LYRIC_SYNC_11_SHORT_FPS,
  LYRIC_SYNC_11_SHORT_HEIGHT,
  LYRIC_SYNC_11_SHORT_WIDTH,
} from "./LyricSync11Short";
import {
  LyricSync12,
  LYRIC_SYNC_12_DURATION,
  LYRIC_SYNC_12_FPS,
  LYRIC_SYNC_12_HEIGHT,
  LYRIC_SYNC_12_WIDTH,
} from "./LyricSync12";

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
      <Composition
        id="LyricSync5"
        component={LyricSync5}
        durationInFrames={LYRIC_SYNC_5_DURATION}
        fps={LYRIC_SYNC_5_FPS}
        width={LYRIC_SYNC_5_WIDTH}
        height={LYRIC_SYNC_5_HEIGHT}
      />
      <Composition
        id="LyricSync6"
        component={LyricSync6}
        durationInFrames={LYRIC_SYNC_6_DURATION}
        fps={LYRIC_SYNC_6_FPS}
        width={LYRIC_SYNC_6_WIDTH}
        height={LYRIC_SYNC_6_HEIGHT}
      />
      <Composition
        id="LyricSync7"
        component={LyricSync7}
        durationInFrames={LYRIC_SYNC_7_DURATION}
        fps={LYRIC_SYNC_7_FPS}
        width={LYRIC_SYNC_7_WIDTH}
        height={LYRIC_SYNC_7_HEIGHT}
      />
      <Composition
        id="LyricSync8"
        component={LyricSync8}
        durationInFrames={LYRIC_SYNC_8_DURATION}
        fps={LYRIC_SYNC_8_FPS}
        width={LYRIC_SYNC_8_WIDTH}
        height={LYRIC_SYNC_8_HEIGHT}
      />
      <Composition
        id="LyricSync9"
        component={LyricSync9}
        durationInFrames={LYRIC_SYNC_9_DURATION}
        fps={LYRIC_SYNC_9_FPS}
        width={LYRIC_SYNC_9_WIDTH}
        height={LYRIC_SYNC_9_HEIGHT}
      />
      <Composition
        id="LyricSync10"
        component={LyricSync10}
        durationInFrames={LYRIC_SYNC_10_DURATION}
        fps={LYRIC_SYNC_10_FPS}
        width={LYRIC_SYNC_10_WIDTH}
        height={LYRIC_SYNC_10_HEIGHT}
      />
      <Composition
        id="LyricSync11"
        component={LyricSync11}
        durationInFrames={LYRIC_SYNC_11_DURATION}
        fps={LYRIC_SYNC_11_FPS}
        width={LYRIC_SYNC_11_WIDTH}
        height={LYRIC_SYNC_11_HEIGHT}
      />
      <Composition
        id="LyricSync11Short"
        component={LyricSync11Short}
        durationInFrames={LYRIC_SYNC_11_SHORT_DURATION}
        fps={LYRIC_SYNC_11_SHORT_FPS}
        width={LYRIC_SYNC_11_SHORT_WIDTH}
        height={LYRIC_SYNC_11_SHORT_HEIGHT}
      />
      <Composition
        id="LyricSync12"
        component={LyricSync12}
        durationInFrames={LYRIC_SYNC_12_DURATION}
        fps={LYRIC_SYNC_12_FPS}
        width={LYRIC_SYNC_12_WIDTH}
        height={LYRIC_SYNC_12_HEIGHT}
      />
    </>
  );
};
