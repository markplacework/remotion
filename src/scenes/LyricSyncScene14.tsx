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

// User-supplied lines, exact wording (incl. "averguenza" as typed, no
// spelling fixes) — transcribed word-by-word from the user's
// fourteenth uploaded clip with faster-whisper (small model,
// word_timestamps=True, biased with an initial_prompt built from these
// same 10 lines). All 10 matched the transcript in full, no repeats,
// no gaps. There's a ~10s instrumental intro before the vocals start.
// Seconds -> frames at 30fps (the project's own fps), rounded to the
// nearest frame:
//   "Somos culpables de este amor escandaloso"    10.18s ->  305
//   "Que el fuego mismo de pasión alimentó"       14.74s ->  442
//   "Que en el remanso de la noche impostergable" 20.80s ->  624
//   "Nos averguenza seguir sintiéndolo"           24.76s ->  743
//   "Poco a poco"                                 30.94s ->  928
//   "Fuimos volviéndonos locos"                   32.62s ->  979
//   "Y ese vapor de nuestro amor"                 39.42s -> 1183
//   "Nos embriagó con su licor"                   42.24s -> 1267
//   "Y culpa al carnaval interminable"            44.54s -> 1336
//   "Nos hizo confundir, irresponsables"          49.82s -> 1495
//
// No burn/delete effect — plain conversation, 10 lines. Uses
// AutoScrollChatLog with the shared lyric-sync layout defaults (locked
// in after Scene9).
export const BUBBLES: DarkBubble[] = [
  { from: "me", text: "Somos culpables de este amor escandaloso", timestamp: "23:41", atFrame: 305 },
  { from: "me", text: "Que el fuego mismo de pasión alimentó", timestamp: "23:41", atFrame: 442 },
  { from: "me", text: "Que en el remanso de la noche impostergable", timestamp: "23:42", atFrame: 624 },
  { from: "me", text: "Nos averguenza seguir sintiéndolo", timestamp: "23:42", atFrame: 743 },
  { from: "me", text: "Poco a poco", timestamp: "23:43", atFrame: 928 },
  { from: "me", text: "Fuimos volviéndonos locos", timestamp: "23:43", atFrame: 979 },
  { from: "me", text: "Y ese vapor de nuestro amor", timestamp: "23:44", atFrame: 1183 },
  { from: "me", text: "Nos embriagó con su licor", timestamp: "23:44", atFrame: 1267 },
  { from: "me", text: "Y culpa al carnaval interminable", timestamp: "23:45", atFrame: 1336 },
  { from: "me", text: "Nos hizo confundir, irresponsables", timestamp: "23:45", atFrame: 1495 },
];

// Last bubble's entrance settles ~15-20 frames after its atFrame — the
// composition holds a few seconds past that so the final line is
// readable before the clip ends.
export const LYRIC_SYNC_14_LAST_FRAME = 1495;

export const LyricSyncScene14: React.FC = () => {
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
