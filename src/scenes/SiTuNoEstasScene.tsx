import { AbsoluteFill, Img, OffthreadVideo, staticFile } from "remotion";
import { LyricSubtitles, type SungLine } from "../components/LyricSubtitles";
import {
  LYRIC_SYNC_CANVAS_TOP_MARGIN,
  LYRIC_SYNC_CANVAS_BOTTOM_MARGIN,
  LYRIC_SYNC_CANVAS_LEFT_MARGIN,
  LYRIC_SYNC_SAFE_RIGHT_EDGE,
} from "../lyricSyncDefaults";

// "Si tú no estás": the user's own vertical landscape clip (sunset over
// a forest path, song already mixed in) with their logo on top and the
// lyrics burned in as subtitles. Unlike the LyricSync chats, this one
// keeps the clip's own audio.
const VIDEO_SRC = staticFile("/paisaje/video.mp4");
// User-supplied logo: white brush lettering on a transparent PNG
// (2172x724).
const LOGO_SRC = staticFile("/paisaje/logo.png");
const LOGO_WIDTH = 600;

// 177s clip at 30fps.
export const SI_TU_NO_ESTAS_DURATION_FRAMES = 5310;

// User-supplied lyrics, exact wording, one subtitle per sung line;
// section labels ([Chorus], [Outro]...) dropped, the duet's echoes kept
// in parentheses. Timing: faster-whisper (small, word_timestamps=True)
// run with and without the lyrics as a prompt (both agree on every
// word and on which repeat is which), then each line placed by the
// vocal onset in the demucs-isolated vocals just before its second
// word, where that onset is clear; where the vocal runs legato from the
// previous line, ~0.45s before the second word (the gap the clear ones
// show). In the slow outro, both repeats give the same per-word spacing,
// so those lines start on Whisper's own first-word time. Vocals end
// ~147s; the rest of the clip is instrumental.
// Seconds -> frames at 30fps:
//   "Si tú no estás, nada es igual"           1.80s ->   54
//   "Si tú no estás cerca de mí"              7.50s ->  225
//   "Si tú no estás, nada es igual"          13.40s ->  402
//   "Si tú no estás cerca de mí"             19.30s ->  579
//   "El sol se vuelve oscuro"                29.55s ->  886
//   "Si tú no estás conmigo"                 32.45s ->  974
//   "El cielo azul se nubla"                 35.50s -> 1065
//   "Si tú no estás"                         38.50s -> 1155
//   "La senda frente a mí"                   41.25s -> 1238
//   "Va desapareciendo"                      44.20s -> 1326
//   "Y no encuentro el camino"               47.20s -> 1416
//   "Si tú no estás (Si tú no estás)"        51.45s -> 1544
//   "Nada es igual (Nada es igual)"          54.60s -> 1638
//   "Si tú no estás cerca de mí"             57.40s -> 1722
//   "Si tú no estás, nada es igual"          66.10s -> 1983
//   "Si tú no estás cerca de mí"             71.95s -> 2158
//   "El sol se vuelve oscuro"                82.50s -> 2475
//   "Si tú no estás conmigo"                 85.10s -> 2553
//   "El cielo azul se nubla"                 88.15s -> 2644
//   "Si tú no estás"                         91.00s -> 2730
//   "La senda frente a mí"                   93.95s -> 2818
//   "Va desapareciendo"                      96.90s -> 2907
//   "Y no encuentro el camino"               99.85s -> 2996
//   "Que me lleve"                          105.40s -> 3162
//   "Junto a ti"                            110.00s -> 3300
//   "A tus brazos"                          117.00s -> 3510
//   "De amor"                               122.00s -> 3660
//   "Que me lleve"                          128.70s -> 3861
//   "Junto a ti"                            133.40s -> 4002
//   "A tus brazos"                          140.30s -> 4209
//   "De amor"                               145.35s -> 4360
export const LINES: SungLine[] = [
  { text: "Si tú no estás, nada es igual", atFrame: 54 },
  { text: "Si tú no estás cerca de mí", atFrame: 225 },
  { text: "Si tú no estás, nada es igual", atFrame: 402 },
  { text: "Si tú no estás cerca de mí", atFrame: 579 },
  { text: "El sol se vuelve oscuro", atFrame: 886 },
  { text: "Si tú no estás conmigo", atFrame: 974 },
  { text: "El cielo azul se nubla", atFrame: 1065 },
  { text: "Si tú no estás", atFrame: 1155 },
  { text: "La senda frente a mí", atFrame: 1238 },
  { text: "Va desapareciendo", atFrame: 1326 },
  { text: "Y no encuentro el camino", atFrame: 1416 },
  { text: "Si tú no estás (Si tú no estás)", atFrame: 1544 },
  { text: "Nada es igual (Nada es igual)", atFrame: 1638 },
  { text: "Si tú no estás cerca de mí", atFrame: 1722 },
  { text: "Si tú no estás, nada es igual", atFrame: 1983 },
  { text: "Si tú no estás cerca de mí", atFrame: 2158 },
  { text: "El sol se vuelve oscuro", atFrame: 2475 },
  { text: "Si tú no estás conmigo", atFrame: 2553 },
  { text: "El cielo azul se nubla", atFrame: 2644 },
  { text: "Si tú no estás", atFrame: 2730 },
  { text: "La senda frente a mí", atFrame: 2818 },
  { text: "Va desapareciendo", atFrame: 2907 },
  { text: "Y no encuentro el camino", atFrame: 2996 },
  { text: "Que me lleve", atFrame: 3162 },
  { text: "Junto a ti", atFrame: 3300 },
  { text: "A tus brazos", atFrame: 3510 },
  { text: "De amor", atFrame: 3660 },
  { text: "Que me lleve", atFrame: 3861 },
  { text: "Junto a ti", atFrame: 4002 },
  { text: "A tus brazos", atFrame: 4209 },
  { text: "De amor", atFrame: 4360 },
];

const SUBTITLE_TOP = 1130;

export const SiTuNoEstasScene: React.FC = () => {
  const safeWidth = LYRIC_SYNC_SAFE_RIGHT_EDGE - LYRIC_SYNC_CANVAS_LEFT_MARGIN;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <OffthreadVideo src={VIDEO_SRC} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      {/* Logo over the sky, inside TikTok's safe top margin; a soft dark
          glow keeps the white lettering readable on the pale clouds. */}
      <Img
        src={LOGO_SRC}
        style={{
          position: "absolute",
          top: LYRIC_SYNC_CANVAS_TOP_MARGIN,
          left: LYRIC_SYNC_CANVAS_LEFT_MARGIN + (safeWidth - LOGO_WIDTH) / 2,
          width: LOGO_WIDTH,
          filter: "drop-shadow(0 0 14px rgba(0,0,0,0.55))",
        }}
      />
      {/* Subtitles over the dark trees and path, above TikTok's bottom
          caption band and clear of its right-hand buttons. */}
      <div style={{ position: "absolute", top: SUBTITLE_TOP, left: LYRIC_SYNC_CANVAS_LEFT_MARGIN }}>
        <LyricSubtitles
          lines={LINES}
          width={safeWidth}
          height={1920 - LYRIC_SYNC_CANVAS_BOTTOM_MARGIN - SUBTITLE_TOP}
        />
      </div>
    </AbsoluteFill>
  );
};
