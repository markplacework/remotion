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
import {
  LyricSync13,
  LYRIC_SYNC_13_DURATION,
  LYRIC_SYNC_13_FPS,
  LYRIC_SYNC_13_HEIGHT,
  LYRIC_SYNC_13_WIDTH,
} from "./LyricSync13";
import {
  LyricSync14,
  LYRIC_SYNC_14_DURATION,
  LYRIC_SYNC_14_FPS,
  LYRIC_SYNC_14_HEIGHT,
  LYRIC_SYNC_14_WIDTH,
} from "./LyricSync14";
import {
  LyricSync15,
  LYRIC_SYNC_15_DURATION,
  LYRIC_SYNC_15_FPS,
  LYRIC_SYNC_15_HEIGHT,
  LYRIC_SYNC_15_WIDTH,
} from "./LyricSync15";
import {
  LyricSync16,
  LYRIC_SYNC_16_DURATION,
  LYRIC_SYNC_16_FPS,
  LYRIC_SYNC_16_HEIGHT,
  LYRIC_SYNC_16_WIDTH,
} from "./LyricSync16";
import {
  LyricSync17,
  LYRIC_SYNC_17_DURATION,
  LYRIC_SYNC_17_FPS,
  LYRIC_SYNC_17_HEIGHT,
  LYRIC_SYNC_17_WIDTH,
} from "./LyricSync17";
import {
  LyricSync18,
  LYRIC_SYNC_18_DURATION,
  LYRIC_SYNC_18_FPS,
  LYRIC_SYNC_18_HEIGHT,
  LYRIC_SYNC_18_WIDTH,
} from "./LyricSync18";
import {
  LyricSync19,
  LYRIC_SYNC_19_DURATION,
  LYRIC_SYNC_19_FPS,
  LYRIC_SYNC_19_HEIGHT,
  LYRIC_SYNC_19_WIDTH,
} from "./LyricSync19";
import {
  LyricSync18Alt,
  LYRIC_SYNC_18_ALT_DURATION,
  LYRIC_SYNC_18_ALT_FPS,
  LYRIC_SYNC_18_ALT_HEIGHT,
  LYRIC_SYNC_18_ALT_WIDTH,
} from "./LyricSync18Alt";
import {
  LyricSync20,
  LYRIC_SYNC_20_DURATION,
  LYRIC_SYNC_20_FPS,
  LYRIC_SYNC_20_HEIGHT,
  LYRIC_SYNC_20_WIDTH,
} from "./LyricSync20";
import {
  LyricSync19Alt,
  LYRIC_SYNC_19_ALT_DURATION,
  LYRIC_SYNC_19_ALT_FPS,
  LYRIC_SYNC_19_ALT_HEIGHT,
  LYRIC_SYNC_19_ALT_WIDTH,
} from "./LyricSync19Alt";
import {
  LyricSync21,
  LYRIC_SYNC_21_DURATION,
  LYRIC_SYNC_21_FPS,
  LYRIC_SYNC_21_HEIGHT,
  LYRIC_SYNC_21_WIDTH,
} from "./LyricSync21";
import {
  LyricSync22,
  LYRIC_SYNC_22_DURATION,
  LYRIC_SYNC_22_FPS,
  LYRIC_SYNC_22_HEIGHT,
  LYRIC_SYNC_22_WIDTH,
} from "./LyricSync22";
import {
  LyricSync23,
  LYRIC_SYNC_23_DURATION,
  LYRIC_SYNC_23_FPS,
  LYRIC_SYNC_23_HEIGHT,
  LYRIC_SYNC_23_WIDTH,
} from "./LyricSync23";
import {
  LyricSync24,
  LYRIC_SYNC_24_DURATION,
  LYRIC_SYNC_24_FPS,
  LYRIC_SYNC_24_HEIGHT,
  LYRIC_SYNC_24_WIDTH,
} from "./LyricSync24";
import {
  LyricSync24Short,
  LYRIC_SYNC_24_SHORT_DURATION,
  LYRIC_SYNC_24_SHORT_FPS,
  LYRIC_SYNC_24_SHORT_HEIGHT,
  LYRIC_SYNC_24_SHORT_WIDTH,
} from "./LyricSync24Short";
import {
  LyricSync25,
  LYRIC_SYNC_25_DURATION,
  LYRIC_SYNC_25_FPS,
  LYRIC_SYNC_25_HEIGHT,
  LYRIC_SYNC_25_WIDTH,
} from "./LyricSync25";
import {
  LyricSync26,
  LYRIC_SYNC_26_DURATION,
  LYRIC_SYNC_26_FPS,
  LYRIC_SYNC_26_HEIGHT,
  LYRIC_SYNC_26_WIDTH,
} from "./LyricSync26";
import {
  LyricSync25Trimmed,
  LYRIC_SYNC_25_TRIMMED_DURATION,
  LYRIC_SYNC_25_TRIMMED_FPS,
  LYRIC_SYNC_25_TRIMMED_HEIGHT,
  LYRIC_SYNC_25_TRIMMED_WIDTH,
} from "./LyricSync25Trimmed";
import {
  LyricSync27,
  LYRIC_SYNC_27_DURATION,
  LYRIC_SYNC_27_FPS,
  LYRIC_SYNC_27_HEIGHT,
  LYRIC_SYNC_27_WIDTH,
} from "./LyricSync27";
import {
  LyricSync28,
  LYRIC_SYNC_28_DURATION,
  LYRIC_SYNC_28_FPS,
  LYRIC_SYNC_28_HEIGHT,
  LYRIC_SYNC_28_WIDTH,
} from "./LyricSync28";
import {
  LyricSync29,
  LYRIC_SYNC_29_DURATION,
  LYRIC_SYNC_29_FPS,
  LYRIC_SYNC_29_HEIGHT,
  LYRIC_SYNC_29_WIDTH,
} from "./LyricSync29";
import {
  LyricSync30,
  LYRIC_SYNC_30_DURATION,
  LYRIC_SYNC_30_FPS,
  LYRIC_SYNC_30_HEIGHT,
  LYRIC_SYNC_30_WIDTH,
} from "./LyricSync30";
import {
  LyricSync28Short,
  LYRIC_SYNC_28_SHORT_DURATION,
  LYRIC_SYNC_28_SHORT_FPS,
  LYRIC_SYNC_28_SHORT_HEIGHT,
  LYRIC_SYNC_28_SHORT_WIDTH,
} from "./LyricSync28Short";
import {
  LyricSync31,
  LYRIC_SYNC_31_DURATION,
  LYRIC_SYNC_31_FPS,
  LYRIC_SYNC_31_HEIGHT,
  LYRIC_SYNC_31_WIDTH,
} from "./LyricSync31";
import {
  LyricSync32,
  LYRIC_SYNC_32_DURATION,
  LYRIC_SYNC_32_FPS,
  LYRIC_SYNC_32_HEIGHT,
  LYRIC_SYNC_32_WIDTH,
} from "./LyricSync32";
import {
  LyricSync30Avanti,
  LYRIC_SYNC_30_AVANTI_DURATION,
  LYRIC_SYNC_30_AVANTI_FPS,
  LYRIC_SYNC_30_AVANTI_HEIGHT,
  LYRIC_SYNC_30_AVANTI_WIDTH,
} from "./LyricSync30Avanti";
import {
  LyricSync33,
  LYRIC_SYNC_33_DURATION,
  LYRIC_SYNC_33_FPS,
  LYRIC_SYNC_33_HEIGHT,
  LYRIC_SYNC_33_WIDTH,
} from "./LyricSync33";
import {
  LyricSync34,
  LYRIC_SYNC_34_DURATION,
  LYRIC_SYNC_34_FPS,
  LYRIC_SYNC_34_HEIGHT,
  LYRIC_SYNC_34_WIDTH,
} from "./LyricSync34";
import {
  LyricSync35,
  LYRIC_SYNC_35_DURATION,
  LYRIC_SYNC_35_FPS,
  LYRIC_SYNC_35_HEIGHT,
  LYRIC_SYNC_35_WIDTH,
} from "./LyricSync35";

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
      <Composition
        id="LyricSync13"
        component={LyricSync13}
        durationInFrames={LYRIC_SYNC_13_DURATION}
        fps={LYRIC_SYNC_13_FPS}
        width={LYRIC_SYNC_13_WIDTH}
        height={LYRIC_SYNC_13_HEIGHT}
      />
      <Composition
        id="LyricSync14"
        component={LyricSync14}
        durationInFrames={LYRIC_SYNC_14_DURATION}
        fps={LYRIC_SYNC_14_FPS}
        width={LYRIC_SYNC_14_WIDTH}
        height={LYRIC_SYNC_14_HEIGHT}
      />
      <Composition
        id="LyricSync15"
        component={LyricSync15}
        durationInFrames={LYRIC_SYNC_15_DURATION}
        fps={LYRIC_SYNC_15_FPS}
        width={LYRIC_SYNC_15_WIDTH}
        height={LYRIC_SYNC_15_HEIGHT}
      />
      <Composition
        id="LyricSync16"
        component={LyricSync16}
        durationInFrames={LYRIC_SYNC_16_DURATION}
        fps={LYRIC_SYNC_16_FPS}
        width={LYRIC_SYNC_16_WIDTH}
        height={LYRIC_SYNC_16_HEIGHT}
      />
      <Composition
        id="LyricSync17"
        component={LyricSync17}
        durationInFrames={LYRIC_SYNC_17_DURATION}
        fps={LYRIC_SYNC_17_FPS}
        width={LYRIC_SYNC_17_WIDTH}
        height={LYRIC_SYNC_17_HEIGHT}
      />
      <Composition
        id="LyricSync18"
        component={LyricSync18}
        durationInFrames={LYRIC_SYNC_18_DURATION}
        fps={LYRIC_SYNC_18_FPS}
        width={LYRIC_SYNC_18_WIDTH}
        height={LYRIC_SYNC_18_HEIGHT}
      />
      <Composition
        id="LyricSync19"
        component={LyricSync19}
        durationInFrames={LYRIC_SYNC_19_DURATION}
        fps={LYRIC_SYNC_19_FPS}
        width={LYRIC_SYNC_19_WIDTH}
        height={LYRIC_SYNC_19_HEIGHT}
      />
      <Composition
        id="LyricSync18Alt"
        component={LyricSync18Alt}
        durationInFrames={LYRIC_SYNC_18_ALT_DURATION}
        fps={LYRIC_SYNC_18_ALT_FPS}
        width={LYRIC_SYNC_18_ALT_WIDTH}
        height={LYRIC_SYNC_18_ALT_HEIGHT}
      />
      <Composition
        id="LyricSync20"
        component={LyricSync20}
        durationInFrames={LYRIC_SYNC_20_DURATION}
        fps={LYRIC_SYNC_20_FPS}
        width={LYRIC_SYNC_20_WIDTH}
        height={LYRIC_SYNC_20_HEIGHT}
      />
      <Composition
        id="LyricSync19Alt"
        component={LyricSync19Alt}
        durationInFrames={LYRIC_SYNC_19_ALT_DURATION}
        fps={LYRIC_SYNC_19_ALT_FPS}
        width={LYRIC_SYNC_19_ALT_WIDTH}
        height={LYRIC_SYNC_19_ALT_HEIGHT}
      />
      <Composition
        id="LyricSync21"
        component={LyricSync21}
        durationInFrames={LYRIC_SYNC_21_DURATION}
        fps={LYRIC_SYNC_21_FPS}
        width={LYRIC_SYNC_21_WIDTH}
        height={LYRIC_SYNC_21_HEIGHT}
      />
      <Composition
        id="LyricSync22"
        component={LyricSync22}
        durationInFrames={LYRIC_SYNC_22_DURATION}
        fps={LYRIC_SYNC_22_FPS}
        width={LYRIC_SYNC_22_WIDTH}
        height={LYRIC_SYNC_22_HEIGHT}
      />
      <Composition
        id="LyricSync23"
        component={LyricSync23}
        durationInFrames={LYRIC_SYNC_23_DURATION}
        fps={LYRIC_SYNC_23_FPS}
        width={LYRIC_SYNC_23_WIDTH}
        height={LYRIC_SYNC_23_HEIGHT}
      />
      <Composition
        id="LyricSync24"
        component={LyricSync24}
        durationInFrames={LYRIC_SYNC_24_DURATION}
        fps={LYRIC_SYNC_24_FPS}
        width={LYRIC_SYNC_24_WIDTH}
        height={LYRIC_SYNC_24_HEIGHT}
      />
      <Composition
        id="LyricSync24Short"
        component={LyricSync24Short}
        durationInFrames={LYRIC_SYNC_24_SHORT_DURATION}
        fps={LYRIC_SYNC_24_SHORT_FPS}
        width={LYRIC_SYNC_24_SHORT_WIDTH}
        height={LYRIC_SYNC_24_SHORT_HEIGHT}
      />
      <Composition
        id="LyricSync25"
        component={LyricSync25}
        durationInFrames={LYRIC_SYNC_25_DURATION}
        fps={LYRIC_SYNC_25_FPS}
        width={LYRIC_SYNC_25_WIDTH}
        height={LYRIC_SYNC_25_HEIGHT}
      />
      <Composition
        id="LyricSync26"
        component={LyricSync26}
        durationInFrames={LYRIC_SYNC_26_DURATION}
        fps={LYRIC_SYNC_26_FPS}
        width={LYRIC_SYNC_26_WIDTH}
        height={LYRIC_SYNC_26_HEIGHT}
      />
      <Composition
        id="LyricSync25Trimmed"
        component={LyricSync25Trimmed}
        durationInFrames={LYRIC_SYNC_25_TRIMMED_DURATION}
        fps={LYRIC_SYNC_25_TRIMMED_FPS}
        width={LYRIC_SYNC_25_TRIMMED_WIDTH}
        height={LYRIC_SYNC_25_TRIMMED_HEIGHT}
      />
      <Composition
        id="LyricSync27"
        component={LyricSync27}
        durationInFrames={LYRIC_SYNC_27_DURATION}
        fps={LYRIC_SYNC_27_FPS}
        width={LYRIC_SYNC_27_WIDTH}
        height={LYRIC_SYNC_27_HEIGHT}
      />
      <Composition
        id="LyricSync28"
        component={LyricSync28}
        durationInFrames={LYRIC_SYNC_28_DURATION}
        fps={LYRIC_SYNC_28_FPS}
        width={LYRIC_SYNC_28_WIDTH}
        height={LYRIC_SYNC_28_HEIGHT}
      />
      <Composition
        id="LyricSync29"
        component={LyricSync29}
        durationInFrames={LYRIC_SYNC_29_DURATION}
        fps={LYRIC_SYNC_29_FPS}
        width={LYRIC_SYNC_29_WIDTH}
        height={LYRIC_SYNC_29_HEIGHT}
      />
      <Composition
        id="LyricSync30"
        component={LyricSync30}
        durationInFrames={LYRIC_SYNC_30_DURATION}
        fps={LYRIC_SYNC_30_FPS}
        width={LYRIC_SYNC_30_WIDTH}
        height={LYRIC_SYNC_30_HEIGHT}
      />
      <Composition
        id="LyricSync28Short"
        component={LyricSync28Short}
        durationInFrames={LYRIC_SYNC_28_SHORT_DURATION}
        fps={LYRIC_SYNC_28_SHORT_FPS}
        width={LYRIC_SYNC_28_SHORT_WIDTH}
        height={LYRIC_SYNC_28_SHORT_HEIGHT}
      />
      <Composition
        id="LyricSync31"
        component={LyricSync31}
        durationInFrames={LYRIC_SYNC_31_DURATION}
        fps={LYRIC_SYNC_31_FPS}
        width={LYRIC_SYNC_31_WIDTH}
        height={LYRIC_SYNC_31_HEIGHT}
      />
      <Composition
        id="LyricSync32"
        component={LyricSync32}
        durationInFrames={LYRIC_SYNC_32_DURATION}
        fps={LYRIC_SYNC_32_FPS}
        width={LYRIC_SYNC_32_WIDTH}
        height={LYRIC_SYNC_32_HEIGHT}
      />
      <Composition
        id="LyricSync30Avanti"
        component={LyricSync30Avanti}
        durationInFrames={LYRIC_SYNC_30_AVANTI_DURATION}
        fps={LYRIC_SYNC_30_AVANTI_FPS}
        width={LYRIC_SYNC_30_AVANTI_WIDTH}
        height={LYRIC_SYNC_30_AVANTI_HEIGHT}
      />
      <Composition
        id="LyricSync33"
        component={LyricSync33}
        durationInFrames={LYRIC_SYNC_33_DURATION}
        fps={LYRIC_SYNC_33_FPS}
        width={LYRIC_SYNC_33_WIDTH}
        height={LYRIC_SYNC_33_HEIGHT}
      />
      <Composition
        id="LyricSync34"
        component={LyricSync34}
        durationInFrames={LYRIC_SYNC_34_DURATION}
        fps={LYRIC_SYNC_34_FPS}
        width={LYRIC_SYNC_34_WIDTH}
        height={LYRIC_SYNC_34_HEIGHT}
      />
      <Composition
        id="LyricSync35"
        component={LyricSync35}
        durationInFrames={LYRIC_SYNC_35_DURATION}
        fps={LYRIC_SYNC_35_FPS}
        width={LYRIC_SYNC_35_WIDTH}
        height={LYRIC_SYNC_35_HEIGHT}
      />
    </>
  );
};
