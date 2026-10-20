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

// New wallpaper format, continuing from LyricSync18Alt/19Alt/20-38.
const BACKGROUND_SRC = staticFile("/fake-chat/background-alt.png");

// No lyrics were typed for this one ("saca la letra del mismo video") --
// the user's thirty-ninth uploaded clip has its own burned-in captions
// (same TikTok-caption style as LyricSync35's source video), so those
// captions ARE the lyrics here. Read them straight off frames extracted
// at 2fps (ffmpeg -vf fps=2), the same technique used for LyricSync35,
// then narrowed each on/off transition with a few extra frames. Video
// is short (60.9s container, but the captioned content itself fades to
// black and loops back to a TikTok splash screen around 56s) and its
// 9 lines include one repeated line near the end, which is kept as its
// own bubble since the burned-in captions repeat it too.
//
// "Pero es inútil negarlo" was missed on the first pass -- it sits in a
// short gap (13-16s) between two other lines that looked blank at the
// coarser 2fps sampling interval used at first; the user flagged it and
// a closer re-check of that gap found it. Re-checked every other gap
// the same way afterwards; no other lines were missed.
//
// Seconds -> frames at 30fps (the project's own fps), rounded to the
// nearest frame (timing precision here is roughly +/-0.75s, since it's
// read off 2fps frame on/off transitions, same as LyricSync35):
//   "Me despierto pensando"             0.50s ->   15
//   "Si hoy te voy a ver"               6.25s ->  188
//   "Pero es inútil negarlo"           13.25s ->  398
//   "Tú me estás atrapando otra vez"   17.75s ->  533
//   "Eres un ángel maldito"            25.75s ->  773
//   "Eres la dama más cruel"           33.25s ->  998
//   "Un arma de doble filo"            40.75s -> 1223
//   "Contigo solo puedo perder"        45.75s -> 1373
//   "Tú me estás atrapando otra vez"   50.75s -> 1523
//
// No burn/delete effect -- plain conversation, 9 lines. Uses
// AutoScrollChatLog with the shared lyric-sync layout defaults (locked
// in after Scene9).
export const BUBBLES: DarkBubble[] = [
  { from: "me", text: "Me despierto pensando", timestamp: "00:04", atFrame: 15 },
  { from: "me", text: "Si hoy te voy a ver", timestamp: "00:04", atFrame: 188 },
  { from: "me", text: "Pero es inútil negarlo", timestamp: "00:04", atFrame: 398 },
  { from: "me", text: "Tú me estás atrapando otra vez", timestamp: "00:05", atFrame: 533 },
  { from: "me", text: "Eres un ángel maldito", timestamp: "00:05", atFrame: 773 },
  { from: "me", text: "Eres la dama más cruel", timestamp: "00:06", atFrame: 998 },
  { from: "me", text: "Un arma de doble filo", timestamp: "00:06", atFrame: 1223 },
  { from: "me", text: "Contigo solo puedo perder", timestamp: "00:07", atFrame: 1373 },
  { from: "me", text: "Tú me estás atrapando otra vez", timestamp: "00:07", atFrame: 1523 },
];

// Last bubble's entrance settles ~15-20 frames after its atFrame -- the
// composition holds a few seconds past that so the final line is
// readable before the clip ends.
export const LYRIC_SYNC_39_LAST_FRAME = 1523;

export const LyricSyncScene39: React.FC = () => {
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
