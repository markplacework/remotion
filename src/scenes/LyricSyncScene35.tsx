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

// New wallpaper format, continuing from LyricSync18Alt/19Alt/20-34.
const BACKGROUND_SRC = staticFile("/fake-chat/background-alt.png");

// User-supplied lines, exact wording. The first 8 lines were confirmed by
// transcribing the user's thirty-fifth uploaded clip with faster-whisper
// (biased + unbiased full-clip and isolated-segment passes). Lines 9-13
// couldn't be reliably matched from audio alone (two separate isolated
// re-transcription attempts both failed), so per the user's own
// instruction ("Segui los subtitulos propios del video") the video's own
// burned-in subtitles were read directly off extracted frames and used
// as the source of truth for that section instead.
//
// Two things the burned-in subtitles revealed:
//   - "Te doy pan, quieres sal" never appears anywhere in the video's own
//     subtitles — checked the entire gap between "muy lejos del sol" and
//     "que quema de amor" frame-by-frame, no caption for it exists. This
//     line is dropped from the video; it isn't sung/captioned in this cut.
//   - The video's own caption for line 6 reads "Dónde vas, dónde voy",
//     not "¿Dónde estás? ¿Dónde voy?" as typed (audio-based transcription
//     had actually agreed with the typed wording here). Kept the user's
//     original typed wording for the bubble since this conflict wasn't
//     part of what was ambiguous/escalated — flagging the discrepancy
//     back to the user instead of silently picking a side.
//
// Seconds -> frames at 30fps (the project's own fps), rounded to the
// nearest frame, derived from reading burned-in subtitle on/off frames
// (extracted at 2fps, so timing precision here is roughly +/-0.5s):
//   "Vas aquí, vas allá"                    1.00s ->   30
//   "Pero nunca te encontrarás"             5.00s ->  150
//   "Al escaparte"                         10.00s ->  300
//   "No hay fuerza alrededor"              17.00s ->  510
//   "No hay pociones para el amor"         21.00s ->  630
//   "¿Dónde estás? ¿Dónde voy?"            25.00s ->  750
//   "Porque estamos en la calle"           31.00s ->  930
//   "De la sensación, muy lejos del sol"   35.00s -> 1050
//   "Que quema de amor"                    44.50s -> 1335
//   "Te doy Dios, quieres más"             47.00s -> 1410
//   "Nena, nunca te voy a dar"             51.00s -> 1530
//   "Lo que me pides"                      56.00s -> 1680
//
// No burn/delete effect — plain conversation, 12 lines (13 typed, minus
// the one confirmed absent from the video). Uses AutoScrollChatLog with
// the shared lyric-sync layout defaults (locked in after Scene9).
export const BUBBLES: DarkBubble[] = [
  { from: "me", text: "Vas aquí, vas allá", timestamp: "21:04", atFrame: 30 },
  { from: "me", text: "Pero nunca te encontrarás", timestamp: "21:04", atFrame: 150 },
  { from: "me", text: "Al escaparte", timestamp: "21:05", atFrame: 300 },
  { from: "me", text: "No hay fuerza alrededor", timestamp: "21:05", atFrame: 510 },
  { from: "me", text: "No hay pociones para el amor", timestamp: "21:06", atFrame: 630 },
  { from: "me", text: "¿Dónde estás? ¿Dónde voy?", timestamp: "21:06", atFrame: 750 },
  { from: "me", text: "Porque estamos en la calle", timestamp: "21:07", atFrame: 930 },
  { from: "me", text: "De la sensación, muy lejos del sol", timestamp: "21:07", atFrame: 1050 },
  { from: "me", text: "Que quema de amor", timestamp: "21:08", atFrame: 1335 },
  { from: "me", text: "Te doy Dios, quieres más", timestamp: "21:08", atFrame: 1410 },
  { from: "me", text: "Nena, nunca te voy a dar", timestamp: "21:09", atFrame: 1530 },
  { from: "me", text: "Lo que me pides", timestamp: "21:09", atFrame: 1680 },
];

// Last bubble's entrance settles ~15-20 frames after its atFrame — the
// composition holds a few seconds past that so the final line is
// readable before the clip ends.
export const LYRIC_SYNC_35_LAST_FRAME = 1680;

export const LyricSyncScene35: React.FC = () => {
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
