/**
 * Sound design for the Wapi ad. All files live in public/audio/ and are
 * already part of the project — see public/audio/README.md for how each
 * asset was generated and how to swap in a professional voice-over later.
 *
 * Frame numbers assume 30fps / SCENE_DURATION = 90 frames per scene.
 */
export const VOICE_OVER = [
  { file: "audio/voice-1.mp3", from: 15 }, // Hook: "¿Vendés por WhatsApp?"
  { file: "audio/voice-2.mp3", from: 93 }, // Problem: "Catálogo de productos: fácil y profesional."
  { file: "audio/voice-3.mp3", from: 185 }, // Order: "Pedidos ordenados, directo por WhatsApp."
  { file: "audio/voice-4.mp3", from: 275 }, // Solution: "Arman su pedido, y vos vendés más fácil."
  { file: "audio/voice-5.mp3", from: 372 }, // CTA: "Probá Wapi gratis, quince días."
] as const;

export const MUSIC = {
  file: "audio/music.mp3",
  volume: 0.55,
};

export const TRANSITION_TICK = {
  file: "audio/tick.mp3",
  cues: [87, 177, 267, 357], // just before each scene cut
  volume: 0.7,
};

export const CTA_DING = {
  file: "audio/ding.mp3",
  from: 366, // right as the CTA card lands
  volume: 0.9,
};
