import { AbsoluteFill, Audio, interpolate, Sequence, staticFile } from "remotion";
import { CartHookScene } from "./scenes/CartHookScene";
import { CartScene } from "./scenes/CartScene";
import { WhatsAppScene } from "./scenes/WhatsAppScene";
import { ClosingScene } from "./scenes/ClosingScene";
import { SceneTransition } from "./components/SceneTransition";
import { StepCalloutsOverlay } from "./components/StepCalloutsOverlay";
import { COLORS, SCENE_CIERRE, TRANSITION_FRAMES, VIDEO_WIDTH, VIDEO_HEIGHT, FPS } from "./theme";

// "Del carrito al pedido por WhatsApp": customer builds an order in the
// real published catalog, then the business owner receives it. Same
// rules as the rest of this project — Wapi's own pages driven by their
// own real functions, nothing invented there. The one exception is the
// WhatsApp screen itself: WhatsApp isn't part of Wapi, so it's a
// faithful recreation of the real WhatsApp UI (see WhatsAppMockup.tsx),
// showing the exact message Wapi's own real cart/checkout code produces.
const SCENE_HOOK = 5 * FPS; // gancho + steps 1-2, two beats in sequence
const SCENE_CART = 230; // ~7.7s — trimmed from 10s, the product-selecting part read too slow
const SCENE_WHATSAPP = 8 * FPS;

// Steps 3-5 of the "Mirá qué fácil..." walkthrough (steps 1-2 live in
// CartHookScene's own text) — synced to the moment each one is actually
// happening on screen. Frames are local to each scene's own Sequence.
const CART_STEP_CALLOUTS = [
  { atFrame: 18, holdFrames: 32, number: 3, text: "Ven tus productos, con fotos, precios y descripciones" },
  { atFrame: 55, holdFrames: 40, number: 4, text: "Arman su pedido" },
];
const WHATSAPP_STEP_CALLOUTS = [{ atFrame: 15, holdFrames: 40, number: 5, text: "Te llega el pedido por WhatsApp" }];

export const WAPI_CART_ORDER_FPS = FPS;
export const WAPI_CART_ORDER_WIDTH = VIDEO_WIDTH;
export const WAPI_CART_ORDER_HEIGHT = VIDEO_HEIGHT;
export const WAPI_CART_ORDER_DURATION = SCENE_HOOK + SCENE_CART + SCENE_WHATSAPP + SCENE_CIERRE;

// User-supplied background music (free-library ukulele track), no voice
// track in this video — just fades in/out around the fixed composition
// length instead of being timed to any dialogue.
const MUSIC_URL = staticFile("/cart-order/music.mp3");
const MUSIC_VOLUME = 0.35;
const FADE_IN_FRAMES = 20;
const FADE_OUT_FRAMES = 45;

export const WapiCartOrder: React.FC = () => {
  const s2 = SCENE_HOOK;
  const s3 = s2 + SCENE_CART;
  const s4 = s3 + SCENE_WHATSAPP;
  const total = WAPI_CART_ORDER_DURATION;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
      <Audio
        src={MUSIC_URL}
        volume={(f) =>
          interpolate(f, [0, FADE_IN_FRAMES, total - FADE_OUT_FRAMES, total], [0, MUSIC_VOLUME, MUSIC_VOLUME, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        }
      />
      <Sequence durationInFrames={SCENE_HOOK}>
        <SceneTransition durationInFrames={SCENE_HOOK} transitionFrames={TRANSITION_FRAMES}>
          <CartHookScene />
        </SceneTransition>
      </Sequence>
      <Sequence from={s2} durationInFrames={SCENE_CART}>
        <SceneTransition durationInFrames={SCENE_CART} transitionFrames={TRANSITION_FRAMES}>
          <CartScene />
        </SceneTransition>
      </Sequence>
      <Sequence from={s2} durationInFrames={SCENE_CART}>
        <StepCalloutsOverlay steps={CART_STEP_CALLOUTS} />
      </Sequence>
      <Sequence from={s3} durationInFrames={SCENE_WHATSAPP}>
        <SceneTransition durationInFrames={SCENE_WHATSAPP} transitionFrames={TRANSITION_FRAMES}>
          <WhatsAppScene />
        </SceneTransition>
      </Sequence>
      <Sequence from={s3} durationInFrames={SCENE_WHATSAPP}>
        <StepCalloutsOverlay steps={WHATSAPP_STEP_CALLOUTS} />
      </Sequence>
      <Sequence from={s4} durationInFrames={SCENE_CIERRE}>
        <SceneTransition durationInFrames={SCENE_CIERRE} transitionFrames={TRANSITION_FRAMES}>
          <ClosingScene />
        </SceneTransition>
      </Sequence>
    </AbsoluteFill>
  );
};
