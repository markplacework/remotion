/**
 * Cue sheet for the Wapi ad soundtrack.
 *
 * No audio files ship with this scaffold (avoids copyrighted music and
 * missing-asset render errors). To add sound:
 *   1. Drop royalty-free files into public/audio/ using the names below.
 *   2. Uncomment the <Audio> tags in src/WapiAd.tsx.
 *
 * Frame numbers assume 30fps / SCENE_DURATION = 90 frames per scene.
 */
export const SOUND_CUES = {
  music: {
    file: "audio/background-music.mp3",
    from: 0,
    volume: 0.5,
  },
  whatsappNotification: {
    file: "audio/whatsapp-notification.mp3",
    from: 180, // start of the Order scene
    volume: 0.8,
  },
  whoosh: {
    file: "audio/whoosh.mp3",
    cues: [90, 270, 360], // scene-cut transitions
    volume: 0.6,
  },
  ctaChime: {
    file: "audio/cta-chime.mp3",
    from: 366, // just after the CTA scene fades in
    volume: 0.7,
  },
} as const;
