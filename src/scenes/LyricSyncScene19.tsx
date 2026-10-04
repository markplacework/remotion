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

// Same real WhatsApp dark-mode wallpaper doodle used by the other
// lyric-sync scenes — generic (not song-specific), reused as-is.
const BACKGROUND_SRC = staticFile("/fake-chat/background.png");

// User-supplied lines, exact wording — transcribed word-by-word from
// the user's nineteenth uploaded clip with faster-whisper (small
// model, word_timestamps=True, biased with an initial_prompt built
// from these same 6 lines). All 6 matched the transcript in full,
// with the forward-only cursor correctly resolving the repeated "Me
// arde" phrases inside each line to their own positions. The song
// then repeats a second, slightly reworded verse afterward ("En
// serio, me arde..." / "carne" instead of "sangre") — not part of the
// lines the user gave, so no extra bubbles were added for it; the
// video just holds after the last line while that plays.
// Seconds -> frames at 30fps (the project's own fps), rounded to the
// nearest frame:
//   "Me arde, me arde, es tarde para curarme"            1.96s ->   59
//   "Me arde, me quema, dejé la sangre en la arena"      9.78s ->  293
//   "Me arde, me está quemando, estoy disimulando"      18.96s ->  569
//   "Como el fuego sobre la superficie del mar"         26.12s ->  784
//   "Como el viento caliente del desierto"              31.14s ->  934
//   "Me quema, me quema, saber, que no vas a volver"    34.58s -> 1037
//
// No burn/delete effect — plain conversation, 6 lines. Uses
// AutoScrollChatLog with the shared lyric-sync layout defaults (locked
// in after Scene9).
export const BUBBLES: DarkBubble[] = [
  { from: "me", text: "Me arde, me arde, es tarde para curarme", timestamp: "17:38", atFrame: 59 },
  { from: "me", text: "Me arde, me quema, dejé la sangre en la arena", timestamp: "17:38", atFrame: 293 },
  { from: "me", text: "Me arde, me está quemando, estoy disimulando", timestamp: "17:39", atFrame: 569 },
  { from: "me", text: "Como el fuego sobre la superficie del mar", timestamp: "17:39", atFrame: 784 },
  { from: "me", text: "Como el viento caliente del desierto", timestamp: "17:40", atFrame: 934 },
  { from: "me", text: "Me quema, me quema, saber, que no vas a volver", timestamp: "17:40", atFrame: 1037 },
];

// Last bubble's entrance settles ~15-20 frames after its atFrame — the
// composition holds a few seconds past that so the final line is
// readable before the clip ends.
export const LYRIC_SYNC_19_LAST_FRAME = 1037;

export const LyricSyncScene19: React.FC = () => {
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
