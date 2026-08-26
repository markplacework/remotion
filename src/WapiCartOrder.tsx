import { AbsoluteFill, Audio, interpolate, Sequence, staticFile } from "remotion";
import { CartHookScene } from "./scenes/CartHookScene";
import { CatalogRequestScene } from "./scenes/CatalogRequestScene";
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
// WhatsApp screens: WhatsApp isn't part of Wapi, so they're a faithful
// recreation of the real WhatsApp UI (see WhatsAppMockup.tsx) — one at
// the start (customer asking for the catalog) and one at the end (the
// real order message Wapi's own cart/checkout code produces).
const SCENE_HOOK = 100; // ~3.3s — gancho only now, steps 1-2 moved to their own mockup scene
const SCENE_CATALOG_REQUEST = 220; // ~7.3s — steps 1-2: asks for the catalog, gets the real link
const SCENE_CART = 320; // ~10.7s — steps 3-4: enough time to actually see the catalog before adding to cart
const SCENE_WHATSAPP = 8 * FPS;

// Steps 1-5 of the "Mirá qué fácil..." walkthrough, as numbered toasts
// synced to the moment each one is actually happening on screen. Frames
// are local to each scene's own Sequence.
const CATALOG_REQUEST_STEP_CALLOUTS = [
  { atFrame: 12, holdFrames: 45, number: 1, text: "Te piden el catálogo" },
  { atFrame: 92, holdFrames: 90, number: 2, text: "Les compartís el link de tu tienda Wapi" },
];
// One persistent label for the whole browse-and-add stretch, rather
// than two back-to-back toasts — starts right after the scroll settles
// on the grid and holds through the cart opening.
const CART_STEP_CALLOUTS = [
  { atFrame: 68, holdFrames: 140, number: 3, text: "Tus clientes miran el catálogo y arman el pedido" },
];
const WHATSAPP_STEP_CALLOUTS = [
  { atFrame: 15, holdFrames: 40, number: 4, text: "Te llegó el pedido por WhatsApp" },
  { atFrame: 95, holdFrames: 50, number: 5, text: "¡Confirmás y listo!" },
];

export const WAPI_CART_ORDER_FPS = FPS;
export const WAPI_CART_ORDER_WIDTH = VIDEO_WIDTH;
export const WAPI_CART_ORDER_HEIGHT = VIDEO_HEIGHT;
export const WAPI_CART_ORDER_DURATION =
  SCENE_HOOK + SCENE_CATALOG_REQUEST + SCENE_CART + SCENE_WHATSAPP + SCENE_CIERRE;

// User-supplied background music (free-library ukulele track), no voice
// track in this video — just fades in/out around the fixed composition
// length instead of being timed to any dialogue.
const MUSIC_URL = staticFile("/cart-order/music.mp3");
const MUSIC_VOLUME = 0.35;
const FADE_IN_FRAMES = 20;
const FADE_OUT_FRAMES = 45;

export const WapiCartOrder: React.FC = () => {
  const s2 = SCENE_HOOK;
  const s3 = s2 + SCENE_CATALOG_REQUEST;
  const s4 = s3 + SCENE_CART;
  const s5 = s4 + SCENE_WHATSAPP;
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
      <Sequence from={s2} durationInFrames={SCENE_CATALOG_REQUEST}>
        <SceneTransition durationInFrames={SCENE_CATALOG_REQUEST} transitionFrames={TRANSITION_FRAMES}>
          <CatalogRequestScene />
        </SceneTransition>
      </Sequence>
      <Sequence from={s2} durationInFrames={SCENE_CATALOG_REQUEST}>
        <StepCalloutsOverlay steps={CATALOG_REQUEST_STEP_CALLOUTS} />
      </Sequence>
      <Sequence from={s3} durationInFrames={SCENE_CART}>
        <SceneTransition durationInFrames={SCENE_CART} transitionFrames={TRANSITION_FRAMES}>
          <CartScene />
        </SceneTransition>
      </Sequence>
      <Sequence from={s3} durationInFrames={SCENE_CART}>
        <StepCalloutsOverlay steps={CART_STEP_CALLOUTS} />
      </Sequence>
      <Sequence from={s4} durationInFrames={SCENE_WHATSAPP}>
        <SceneTransition durationInFrames={SCENE_WHATSAPP} transitionFrames={TRANSITION_FRAMES}>
          <WhatsAppScene />
        </SceneTransition>
      </Sequence>
      <Sequence from={s4} durationInFrames={SCENE_WHATSAPP}>
        <StepCalloutsOverlay steps={WHATSAPP_STEP_CALLOUTS} />
      </Sequence>
      <Sequence from={s5} durationInFrames={SCENE_CIERRE}>
        <SceneTransition durationInFrames={SCENE_CIERRE} transitionFrames={TRANSITION_FRAMES}>
          <ClosingScene />
        </SceneTransition>
      </Sequence>
    </AbsoluteFill>
  );
};
