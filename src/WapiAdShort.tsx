import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { ChicaScene } from "./scenes/ChicaScene";
import { EditorScene } from "./scenes/EditorScene";
import { CatalogScene } from "./scenes/CatalogScene";
import { ClosingScene } from "./scenes/ClosingScene";
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
const SCENE_EDITOR_SHORT = 330; // 11.0s — logo/promo-banner beats skipped, see editorCuesShort.ts
const SCENE_CATALOG_SHORT = 105; // 3.5s
const SCENE_CIERRE_SHORT = 86; // ~2.87s

export const WAPI_AD_SHORT_FPS = FPS;
export const WAPI_AD_SHORT_WIDTH = VIDEO_WIDTH;
export const WAPI_AD_SHORT_HEIGHT = VIDEO_HEIGHT;
export const WAPI_AD_SHORT_DURATION = SCENE_CHICA + SCENE_EDITOR_SHORT + SCENE_CATALOG_SHORT + SCENE_CIERRE_SHORT;

const AUDIO_URL = staticFile("/short-ad/audio.wav");

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
      <Sequence from={s3} durationInFrames={SCENE_CATALOG_SHORT}>
        <CatalogScene durationInFrames={SCENE_CATALOG_SHORT} />
      </Sequence>
      <Sequence from={s4} durationInFrames={SCENE_CIERRE_SHORT}>
        <ClosingScene />
      </Sequence>
    </AbsoluteFill>
  );
};
