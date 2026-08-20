import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { ChicaScene } from "./scenes/ChicaScene";
import { EditorScene } from "./scenes/EditorScene";
import { CatalogScene } from "./scenes/CatalogScene";
import { ClosingScene } from "./scenes/ClosingScene";
import { CalloutsOverlay } from "./components/CalloutsOverlay";
import { SubtitlesOverlay } from "./components/SubtitlesOverlay";
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

// Burned-in captions for the voiceover. There's no way to detect the
// voice's exact word timing from this file (background music never dips
// enough for silence-detection to isolate the pauses between lines), so
// each line is placed against the part of the video it describes —
// e.g. "Cargá tu logo, portada y banners" over that part of the editor
// demo — rather than being timed sample-accurately off the audio track
// itself. Absolute frame numbers (spans the whole composition).
const SUBTITLES = [
  { from: 0, to: 95, text: "¿Sos un negocio local que toma pedidos por WhatsApp?" },
  { from: 98, to: 144, text: "Entonces esto es para vos." },
  { from: 147, to: 177, text: "Te presento Wapi." },
  { from: 180, to: 274, text: "Con Wapi creás tu catálogo profesional en minutos." },
  { from: 278, to: 338, text: "Y todo personalizalo a tu estilo." },
  { from: 342, to: 402, text: "Cargá tu logo, portada y banners." },
  { from: 406, to: 526, text: "Después cargás tus productos con fotos, precios y descripciones." },
  { from: 530, to: 616, text: "¡Y listo! Ya tenés tu catálogo para compartir." },
  { from: 624, to: 699, text: "¡Probalo hoy mismo!" },
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
      <SubtitlesOverlay lines={SUBTITLES} />
    </AbsoluteFill>
  );
};
