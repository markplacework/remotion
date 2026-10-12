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

// New wallpaper format, continuing from LyricSync18Alt/19Alt/20-37.
const BACKGROUND_SRC = staticFile("/fake-chat/background-alt.png");

// User-supplied lines, exact wording. The full song repeats the same
// verse+chorus+verse2 structure twice; the user asked this clip to
// start almost exactly at the start of the SECOND pass ("Hace que
// empiece casi justo en esta parte para adelante de la cancion") and
// typed that second pass's lines with their own small wording
// differences from the first pass ("Calme tu dolor" with no accent,
// "solo por tu amor" / "y ahora donde esta" lowercase, no comma) --
// kept exactly as typed.
//
// Unlike every prior song in this series, this source file (m4a) had
// an embedded SRT-style subtitle track with per-line timestamps
// already baked in (visible via `ffmpeg -i audio.m4a -map 0:1
// subs.srt`) -- almost certainly written by whatever AI tool generated
// the song, so it is exact, not a transcription guess. Matched it
// directly against the typed lyrics line-for-line, including the
// wording variants above, confirming it's the right track. No
// faster-whisper pass was needed this time.
//
// One thing the subtitles reveal that the user didn't type: right
// after the marker, the sung audio repeats "Ay amor, amor amor" TWICE
// in a row (1:13.48 and 1:20.67) before "Hoy he entrado en razon" --
// the user only typed it once for this pass, so only one bubble is
// used here, timed to the first of the two (per the "no guessing /
// don't add lines the user didn't type" rule).
//
// Video t=0 is set ~1s before that first "Ay amor" of the second pass
// (73.48s in the source audio), so the clip starts "casi justo" there
// as asked, with a hair of lead-in instead of landing cold on frame 0.
// Seconds (relative to that t=0) -> frames at 30fps, rounded:
//   "Ay amor, amor amor"                  1.00s ->   30
//   "Hoy he entrado en razón"             13.61s ->  408
//   "Después de tanto tanto tiempo"       19.19s ->  576
//   "Hoy por fin vuelvo a ser yo"         24.54s ->  736
//   "Ay amor, amor amor"                  28.05s ->  841
//   "Es que ahora entiendo más que nunca" 35.31s -> 1059
//   "Que yo jamás debí entregarte"        40.89s -> 1227
//   "Por completo el corazón"             46.32s -> 1390
//   "Besé tus heridas"                    52.22s -> 1567
//   "Calme tu dolor"                      57.65s -> 1729
//   "Me expuse al peligro"                63.08s -> 1892
//   "solo por tu amor"                    68.50s -> 2055
//   "y ahora donde estás"                 73.85s -> 2215
//
// No burn/delete effect -- plain conversation, 13 lines. Uses
// AutoScrollChatLog with the shared lyric-sync layout defaults (locked
// in after Scene9).
export const BUBBLES: DarkBubble[] = [
  { from: "me", text: "Ay amor, amor amor", timestamp: "00:04", atFrame: 30 },
  { from: "me", text: "Hoy he entrado en razón", timestamp: "00:04", atFrame: 408 },
  { from: "me", text: "Después de tanto tanto tiempo", timestamp: "00:04", atFrame: 576 },
  { from: "me", text: "Hoy por fin vuelvo a ser yo", timestamp: "00:05", atFrame: 736 },
  { from: "me", text: "Ay amor, amor amor", timestamp: "00:05", atFrame: 841 },
  { from: "me", text: "Es que ahora entiendo más que nunca", timestamp: "00:05", atFrame: 1059 },
  { from: "me", text: "Que yo jamás debí entregarte", timestamp: "00:06", atFrame: 1227 },
  { from: "me", text: "Por completo el corazón", timestamp: "00:06", atFrame: 1390 },
  { from: "me", text: "Besé tus heridas", timestamp: "00:06", atFrame: 1567 },
  { from: "me", text: "Calme tu dolor", timestamp: "00:07", atFrame: 1729 },
  { from: "me", text: "Me expuse al peligro", timestamp: "00:07", atFrame: 1892 },
  { from: "me", text: "solo por tu amor", timestamp: "00:07", atFrame: 2055 },
  { from: "me", text: "y ahora donde estás", timestamp: "00:08", atFrame: 2215 },
];

// Last bubble's entrance settles ~15-20 frames after its atFrame -- the
// composition holds a few seconds past that so the final line is
// readable before the clip ends.
export const LYRIC_SYNC_38_LAST_FRAME = 2215;

export const LyricSyncScene38: React.FC = () => {
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
