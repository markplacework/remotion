import { AbsoluteFill, Img, staticFile } from "remotion";
import { AutoScrollChatLog } from "../components/AutoScrollChatLog";
import type { DarkBubble } from "../components/DarkChatLog";
import {
  LYRIC_SYNC_CANVAS_TOP_MARGIN,
  LYRIC_SYNC_CANVAS_LEFT_MARGIN,
  LYRIC_SYNC_CONTENT_WIDTH,
  LYRIC_SYNC_VIEWPORT_HEIGHT,
  LYRIC_SYNC_SCALE,
} from "../lyricSyncDefaults";

// New wallpaper format, continuing from LyricSync18Alt/19Alt/20/21.
const BACKGROUND_SRC = staticFile("/fake-chat/background-alt.png");

// User-supplied lines, exact wording — transcribed word-by-word from
// the user's twenty-second upload, this time a bare audio file (.m4a,
// no video) with faster-whisper (small model, word_timestamps=True,
// biased with an initial_prompt built from these same 11 lines). All
// 11 matched the transcript in full, no repeats, no gaps.
//
// The source clip is 103.2s: a ~12.4s instrumental intro before the
// first line, then the 11 lines (12.42s-54.76s), then the closing
// phrase "y darte todo mi existir" repeats 3x as a melodic outro until
// 103.18s. Per the user's request this video is trimmed tightly —
// starting almost exactly at the first lyric and ending almost exactly
// after the last one, but (per their special request for this song)
// extending a little further into the melodic outro instead of cutting
// abruptly, since they're pairing this with a companion audio clip
// that has an actual fade-out over its last 3s (delivered alongside
// this video — see the render notes).
//
// Trim start = 12.1s (source) -> new frame 0. Seconds below are
// original source seconds; frames are relative to the 12.1s trim
// point, at 30fps:
//   "Otro año más que se va sin saludar,"        12.42s ->   10
//   "y yo aún aquí, igual que siempre,"           18.40s ->  189
//   "viendo el sol caer."                         22.96s ->  326
//   "Pensando solo en ti"                         27.00s ->  447
//   "y en lo que harás en este instante."         29.58s ->  524
//   "Y no puedo evitar"                           34.72s ->  679
//   "una lágrima soltar"                          37.26s ->  755
//   "en esta oscura soledad."                     40.22s ->  844
//   "Ya quisiera estar ahí"                       45.90s -> 1014
//   "para hacerte sonreír"                        48.60s -> 1095
//   "y darte todo mi existir."                    52.16s -> 1202
//
// No burn/delete effect — plain conversation, 11 lines. Uses
// AutoScrollChatLog with the shared lyric-sync layout defaults (locked
// in after Scene9).
export const BUBBLES: DarkBubble[] = [
  { from: "me", text: "Otro año más que se va sin saludar,", timestamp: "23:58", atFrame: 10 },
  { from: "me", text: "y yo aún aquí, igual que siempre,", timestamp: "23:58", atFrame: 189 },
  { from: "me", text: "viendo el sol caer.", timestamp: "23:59", atFrame: 326 },
  { from: "me", text: "Pensando solo en ti", timestamp: "23:59", atFrame: 447 },
  { from: "me", text: "y en lo que harás en este instante.", timestamp: "00:00", atFrame: 524 },
  { from: "me", text: "Y no puedo evitar", timestamp: "00:00", atFrame: 679 },
  { from: "me", text: "una lágrima soltar", timestamp: "00:01", atFrame: 755 },
  { from: "me", text: "en esta oscura soledad.", timestamp: "00:01", atFrame: 844 },
  { from: "me", text: "Ya quisiera estar ahí", timestamp: "00:02", atFrame: 1014 },
  { from: "me", text: "para hacerte sonreír", timestamp: "00:02", atFrame: 1095 },
  { from: "me", text: "y darte todo mi existir.", timestamp: "00:03", atFrame: 1202 },
];

// Last bubble's entrance settles ~15-20 frames after its atFrame.
export const LYRIC_SYNC_22_LAST_FRAME = 1202;

export const LyricSyncScene22: React.FC = () => {
  return (
    <AbsoluteFill>
      <Img
        src={BACKGROUND_SRC}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
      <AbsoluteFill
        style={{
          alignItems: "flex-start",
          justifyContent: "flex-start",
          paddingTop: LYRIC_SYNC_CANVAS_TOP_MARGIN,
          paddingLeft: LYRIC_SYNC_CANVAS_LEFT_MARGIN,
        }}
      >
        <div style={{ transform: `scale(${LYRIC_SYNC_SCALE})`, transformOrigin: "top left" }}>
          <AutoScrollChatLog
            bubbles={BUBBLES}
            viewportHeight={LYRIC_SYNC_VIEWPORT_HEIGHT}
            width={LYRIC_SYNC_CONTENT_WIDTH}
            dateLabel="Hoy"
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
