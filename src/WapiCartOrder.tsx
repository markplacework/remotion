import { AbsoluteFill, Sequence } from "remotion";
import { CartHookScene } from "./scenes/CartHookScene";
import { CartScene } from "./scenes/CartScene";
import { WhatsAppScene } from "./scenes/WhatsAppScene";
import { ClosingScene } from "./scenes/ClosingScene";
import { SceneTransition } from "./components/SceneTransition";
import { COLORS, SCENE_CIERRE, TRANSITION_FRAMES, VIDEO_WIDTH, VIDEO_HEIGHT, FPS } from "./theme";

// "Del carrito al pedido por WhatsApp": customer builds an order in the
// real published catalog, then the business owner receives it. Same
// rules as the rest of this project — Wapi's own pages driven by their
// own real functions, nothing invented there. The one exception is the
// WhatsApp screen itself: WhatsApp isn't part of Wapi, so it's a
// faithful recreation of the real WhatsApp UI (see WhatsAppMockup.tsx),
// showing the exact message Wapi's own real cart/checkout code produces.
const SCENE_HOOK = 4 * FPS;
const SCENE_CART = 10 * FPS;
const SCENE_WHATSAPP = 5.5 * FPS;

export const WAPI_CART_ORDER_FPS = FPS;
export const WAPI_CART_ORDER_WIDTH = VIDEO_WIDTH;
export const WAPI_CART_ORDER_HEIGHT = VIDEO_HEIGHT;
export const WAPI_CART_ORDER_DURATION = SCENE_HOOK + SCENE_CART + SCENE_WHATSAPP + SCENE_CIERRE;

export const WapiCartOrder: React.FC = () => {
  const s2 = SCENE_HOOK;
  const s3 = s2 + SCENE_CART;
  const s4 = s3 + SCENE_WHATSAPP;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
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
      <Sequence from={s3} durationInFrames={SCENE_WHATSAPP}>
        <SceneTransition durationInFrames={SCENE_WHATSAPP} transitionFrames={TRANSITION_FRAMES}>
          <WhatsAppScene />
        </SceneTransition>
      </Sequence>
      <Sequence from={s4} durationInFrames={SCENE_CIERRE}>
        <SceneTransition durationInFrames={SCENE_CIERRE} transitionFrames={TRANSITION_FRAMES}>
          <ClosingScene />
        </SceneTransition>
      </Sequence>
    </AbsoluteFill>
  );
};
