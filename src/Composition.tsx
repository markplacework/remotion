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

import { B44Zocalos, B44_ZOCALOS_DURATION, B44_ZOCALOS_FPS, B44_ZOCALOS_HEIGHT, B44_ZOCALOS_WIDTH } from "./B44Zocalos";

export const WapiVideoComposition = () => {
  return (
    <>
      <Composition
        id="B44Zocalos"
        component={B44Zocalos}
        durationInFrames={B44_ZOCALOS_DURATION}
        fps={B44_ZOCALOS_FPS}
        width={B44_ZOCALOS_WIDTH}
        height={B44_ZOCALOS_HEIGHT}
        defaultProps={{
          video: "/b44/video.mp4",
          // Timings from a word-level Whisper transcription of the voice.
          subtitles: [
            { from: 0, to: 1.65, text: "¿Querés revender zapatillas?", highlight: ["zapatillas"] },
            { from: 1.8, to: 4.05, text: "Tenemos modelos que te van a encantar.", highlight: ["encantar"] },
            { from: 4.15, to: 5.5, text: "Hacé clic en el enlace", highlight: ["enlace"] },
            { from: 5.55, to: 7.95, text: "y solicitá nuestro catálogo mayorista.", highlight: ["catálogo"] },
          ],
        }}
      />
      <Composition
        id="B44Zocalos2"
        component={B44Zocalos}
        // +0.6s so the exit sound effect, cut off at 8s in the source clip,
        // can ring out (see video2-audio.wav).
        durationInFrames={B44_ZOCALOS_DURATION + Math.round(0.6 * B44_ZOCALOS_FPS)}
        fps={B44_ZOCALOS_FPS}
        width={B44_ZOCALOS_WIDTH}
        height={B44_ZOCALOS_HEIGHT}
        defaultProps={{
          video: "/b44/video2.mp4",
          audio: "/b44/video2-audio.wav",
          // Timings from a word-level Whisper transcription of the voice.
          subtitles: [
            { from: 0, to: 1.1, text: "Dejá de scrollear", highlight: ["scrollear"] },
            { from: 1.2, to: 2.8, text: "En B44 te ofrecemos", highlight: ["B44"] },
            { from: 2.85, to: 4.6, text: "los mejores productos para revender.", highlight: ["revender"] },
            { from: 4.7, to: 5.95, text: "Hacé clic en el enlace", highlight: ["enlace"] },
            { from: 6.0, to: 7.95, text: "y solicitá nuestro catálogo mayorista.", highlight: ["catálogo"] },
          ],
        }}
      />
      <Composition
        id="B44Zocalos3"
        component={B44Zocalos}
        durationInFrames={B44_ZOCALOS_DURATION}
        fps={B44_ZOCALOS_FPS}
        width={B44_ZOCALOS_WIDTH}
        height={B44_ZOCALOS_HEIGHT}
        defaultProps={{
          video: "/b44/video3.mp4",
          // Timings from a word-level Whisper transcription of the voice.
          subtitles: [
            { from: 0, to: 1.9, text: "¿Buscás calzado para revender?", highlight: ["revender"] },
            { from: 2.2, to: 5.1, text: "Pedí el catálogo mayorista de B44", highlight: ["B44"] },
            { from: 5.3, to: 7.9, text: "y descubrí todos nuestros modelos.", highlight: ["modelos"] },
          ],
        }}
      />
      <Composition
        id="B44Zocalos4"
        component={B44Zocalos}
        durationInFrames={B44_ZOCALOS_DURATION}
        fps={B44_ZOCALOS_FPS}
        width={B44_ZOCALOS_WIDTH}
        height={B44_ZOCALOS_HEIGHT}
        defaultProps={{
          video: "/b44/video4.mp4",
          // The clip's voice says "B" in English, so it is replaced with an
          // ElevenLabs take (video4-voz-elevenlabs.mp3). Each sentence is
          // slowed to 0.9x and placed where the presenter's mouth moves; the
          // clip's own closing sound effect is kept from 7.8s.
          audio: "/b44/video4-audio.wav",
          // Timings from a word-level Whisper transcription of the new voice,
          // mapped through the same shift and stretch.
          subtitles: [
            { from: 0, to: 1.6, text: "Calidad y buenos precios", highlight: ["Calidad", "precios"] },
            { from: 1.62, to: 4.15, text: "es lo que ofrecemos en B44.", highlight: ["B44"] },
            { from: 4.55, to: 5.8, text: "Hacé clic en el enlace", highlight: ["enlace"] },
            { from: 5.82, to: 7.85, text: "y solicitá nuestro catálogo.", highlight: ["catálogo"] },
          ],
        }}
      />
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
    </>
  );
};
