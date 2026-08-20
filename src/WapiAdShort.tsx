import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { ChicaScene } from "./scenes/ChicaScene";
import { EditorScene } from "./scenes/EditorScene";
import { CatalogScene } from "./scenes/CatalogScene";
import { ClosingScene } from "./scenes/ClosingScene";
import { CalloutsOverlay } from "./components/CalloutsOverlay";
import { EDITOR_CUES_SHORT } from "./scenes/editorCuesShort";
import { COLORS, VIDEO_WIDTH, VIDEO_HEIGHT, FPS } from "./theme";

// Reconstructs the user's own 23.38s fast-cut edit (reference video) at
// full source quality: the same order and rough pacing (presenter clip →
// editor demo, compressed → catalog scroll → closing), but built from the
// original high-resolution assets and driven by the real director/DOM
// logic, not a re-encode/upscale of the already-compressed reference.
// Hard cuts throughout, matching the reference's own fast-cut feel — no
// crossfades here (unlike the full-length WapiVideo).
const SCENE_CHICA = 180; // 6.0s — the presenter clip's own footage
const SCENE_EDITOR_SHORT = 350; // logo, business info, portada + promo banner, one product
const SCENE_CATALOG_SHORT = 90;
const SCENE_CIERRE_SHORT = 81;

export const WAPI_AD_SHORT_FPS = FPS;
export const WAPI_AD_SHORT_WIDTH = VIDEO_WIDTH;
export const WAPI_AD_SHORT_HEIGHT = VIDEO_HEIGHT;
export const WAPI_AD_SHORT_DURATION = SCENE_CHICA + SCENE_EDITOR_SHORT + SCENE_CATALOG_SHORT + SCENE_CIERRE_SHORT;

const AUDIO_URL = staticFile("/short-ad/audio.wav");

// Confirmation toasts over the editor beat — frame numbers match
// EDITOR_CUES_SHORT's own cues (see editorCuesShort.ts), just nudged a
// few frames later so each toast reads as "that thing you just saw
// happen", and staggered so no two are ever on screen together.
// "Banner agregado" was dropped — the banner itself never actually
// shows on screen at this scroll position, so confirming it felt
// disconnected from what's visible.
const EDITOR_CALLOUTS = [
  { atFrame: 15, holdFrames: 28, text: "Logo cargado" },
  { atFrame: 152, holdFrames: 22, text: "Datos guardados" },
  { atFrame: 177, holdFrames: 22, text: "Portada agregada" },
  { atFrame: 334, holdFrames: 16, text: "Producto agregado" },
];

export const WapiAdShort: React.FC = () => {
  const s2 = SCENE_CHICA;
  const s3 = s2 + SCENE_EDITOR_SHORT;
  const s4 = s3 + SCENE_CATALOG_SHORT;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
      <Audio src={AUDIO_URL} />
      <Sequence durationInFrames={SCENE_CHICA}>
        <ChicaScene />
      </Sequence>
      <Sequence from={s2} durationInFrames={SCENE_EDITOR_SHORT}>
        <EditorScene cues={EDITOR_CUES_SHORT} />
      </Sequence>
      <Sequence from={s2} durationInFrames={SCENE_EDITOR_SHORT}>
        <CalloutsOverlay callouts={EDITOR_CALLOUTS} />
      </Sequence>
      <Sequence from={s3} durationInFrames={SCENE_CATALOG_SHORT}>
        <CatalogScene durationInFrames={SCENE_CATALOG_SHORT} />
      </Sequence>
      <Sequence from={s4} durationInFrames={SCENE_CIERRE_SHORT}>
        <ClosingScene />
      </Sequence>
    </AbsoluteFill>
  );
};
