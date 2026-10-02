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

// User-supplied lines, exact wording except two typos fixed ("ya vez"
// -> "Ya ves", "rió" -> "río"), every line starting with a capital.
// Exclamation marks per Spanish usage ("¡Ay, viejo!").
// Timing: faster-whisper (small, word_timestamps=True, initial_prompt =
// these lines joined into one comma-separated string — with newlines
// in the prompt the model emitted junk tokens and skipped 14-44s),
// cross-checked against the clip's burned-in subtitles. Where Whisper
// stretched a line's first word back into the previous gap ("Yo sé",
// "Y pienses", "Siempre habrá", "Levanta"), the line starts where the
// subtitle and the line's second word agree instead.
//
// First lyric-sync scene that's a two-sided conversation: "me" (right,
// green) is him, "them" (left, gray) is her. First pass was assigned
// from the lyrics' meaning (the clip's demucs-isolated vocals sit in
// one continuous F#3-G4 range, and speaker-embedding clustering on sung
// vocals was too noisy to trust), then corrected by the user: "¡Ay,
// viejo! En este juego / A mí siempre me toca perder" is his, and her
// spoken reply "Te entiendo" (heard by Whisper even without a prompt,
// 35.74-36.56s) follows his "Tal vez lo puedas entender". That line
// itself moved from 32.7s to 33.4s, where the unprompted transcript
// and the subtitle agree.
// Seconds -> frames at 30fps (the project's own fps):
//   Él    "No sé bien qué día es hoy"               1.20s ->   36
//   Él    "Solo sé que te vi salir"                 4.50s ->  135
//   Él    "Y en cinco minutos perdí"                8.40s ->  252
//   Él    "Las letras para hablarte a vos."        11.90s ->  357
//   Ella  "Yo sé que no tengo palabras"           15.00s ->  450
//   Ella  "Y nunca las voy a tener"               18.90s ->  567
//   Ella  "Por eso aprovecho esta noche"          22.80s ->  684
//   Ella  "Ya ves estoy sola otra vez"            25.80s ->  774
//   Él    "Por eso aprovecho esta noche"          29.10s ->  873
//   Él    "Tal vez lo puedas entender"            33.40s -> 1002
//   Ella  "Te entiendo" (spoken, not sung)        36.00s -> 1080
//   Él    "No me importa poner las letras"        37.10s -> 1113
//   Él    "Solo me importa mi mujer"              40.70s -> 1221
//   Ella  "Mañana cuando te levantes"             43.60s -> 1308
//   Ella  "Y pienses lo que dije ayer"            47.70s -> 1431
//   Él    "¡Ay, viejo! En este juego"             51.20s -> 1536
//   Él    "A mí siempre me toca perder"           54.80s -> 1644
//   Él    "Siempre habrá vasos vacíos"            58.60s -> 1758
//   Él    "Con agua de la ciudad"                 61.10s -> 1833
//   Él    "La nuestra es agua de río"             64.80s -> 1944
//   Él    "Mezclada con mar"                      68.20s -> 2046
//   Él    "Levanta los brazos mujer"              72.60s -> 2178
//   Él    "Y ponte esta noche a bailar"           75.40s -> 2262
//   Él    "Que la nuestra es agua de río"         79.40s -> 2382
//   Él    "Mezclada con mar"                      82.60s -> 2478
export const BUBBLES: DarkBubble[] = [
  { from: "me", text: "No sé bien qué día es hoy", timestamp: "02:14", atFrame: 36 },
  { from: "me", text: "Solo sé que te vi salir", timestamp: "02:14", atFrame: 135 },
  { from: "me", text: "Y en cinco minutos perdí", timestamp: "02:14", atFrame: 252 },
  { from: "me", text: "Las letras para hablarte a vos.", timestamp: "02:14", atFrame: 357 },
  { from: "them", text: "Yo sé que no tengo palabras", timestamp: "02:15", atFrame: 450 },
  { from: "them", text: "Y nunca las voy a tener", timestamp: "02:15", atFrame: 567 },
  { from: "them", text: "Por eso aprovecho esta noche", timestamp: "02:15", atFrame: 684 },
  { from: "them", text: "Ya ves estoy sola otra vez", timestamp: "02:15", atFrame: 774 },
  { from: "me", text: "Por eso aprovecho esta noche", timestamp: "02:16", atFrame: 873 },
  { from: "me", text: "Tal vez lo puedas entender", timestamp: "02:16", atFrame: 1002 },
  { from: "them", text: "Te entiendo", timestamp: "02:16", atFrame: 1080 },
  { from: "me", text: "No me importa poner las letras", timestamp: "02:16", atFrame: 1113 },
  { from: "me", text: "Solo me importa mi mujer", timestamp: "02:16", atFrame: 1221 },
  { from: "them", text: "Mañana cuando te levantes", timestamp: "02:17", atFrame: 1308 },
  { from: "them", text: "Y pienses lo que dije ayer", timestamp: "02:17", atFrame: 1431 },
  { from: "me", text: "¡Ay, viejo! En este juego", timestamp: "02:17", atFrame: 1536 },
  { from: "me", text: "A mí siempre me toca perder", timestamp: "02:17", atFrame: 1644 },
  { from: "me", text: "Siempre habrá vasos vacíos", timestamp: "02:18", atFrame: 1758 },
  { from: "me", text: "Con agua de la ciudad", timestamp: "02:18", atFrame: 1833 },
  { from: "me", text: "La nuestra es agua de río", timestamp: "02:18", atFrame: 1944 },
  { from: "me", text: "Mezclada con mar", timestamp: "02:18", atFrame: 2046 },
  { from: "me", text: "Levanta los brazos mujer", timestamp: "02:19", atFrame: 2178 },
  { from: "me", text: "Y ponte esta noche a bailar", timestamp: "02:19", atFrame: 2262 },
  { from: "me", text: "Que la nuestra es agua de río", timestamp: "02:19", atFrame: 2382 },
  { from: "me", text: "Mezclada con mar", timestamp: "02:19", atFrame: 2478 },
];

// Last bubble's entrance settles ~15-20 frames after its atFrame — the
// composition holds a few seconds past that so the final line is
// readable before the clip ends.
export const LYRIC_SYNC_35_LAST_FRAME = 2478;

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
