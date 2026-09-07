import { AbsoluteFill, Img, staticFile } from "remotion";
import { AutoScrollChatLog } from "../components/AutoScrollChatLog";
import type { DarkBubble } from "../components/DarkChatLog";

// Same real WhatsApp dark-mode wallpaper doodle used by the other
// lyric-sync scenes — generic (not song-specific), reused as-is.
const BACKGROUND_SRC = staticFile("/fake-chat/background.png");

// User-supplied lines. Timestamps are the REAL sung start times,
// transcribed word-by-word from the user's fifth uploaded clip with
// faster-whisper (small model, word_timestamps=True, biased with an
// initial_prompt built from these same 16 lines). Most matched the
// transcript in full; three lines (10, 13, 16) partially diverge from
// what's actually sung (e.g. line 10 says "vuelve" where the vocal is
// "volvió" the second time, line 16 says "joyas" where Whisper heard
// "cosas") — for lines 10 and 16 the alignment search only found the
// tail of the phrase ("loco tu forma de ser." / "en el barro..."), so
// their start times were corrected by hand from the real word
// timestamps of the actual first word ("a" / "son") rather than the
// mismatched word. Line 13 has no identifiable lead-in for "Me" in the
// transcript at all (goes straight from the prior line into "Tu egoío
// loco..."), so its difflib-found start stands as the closest anchor
// available. Text is corrected from what was originally typed — added
// the missing accents ("volvio" -> "volvió", "a mi me" -> "a mí me",
// the pronoun use of "mí" that takes a tilde, unlike the possessive
// "mi") and capitalized every line's first letter (each line is its
// own WhatsApp bubble, so it reads as a set of separate messages
// rather than one poem split at the commas) — on request. Seconds ->
// frames at 30fps (the project's own fps), rounded to the nearest
// frame:
//   "Te vi llegar del brazo de un amigo"           0.00s ->    0
//   "Cuando entraste al bar y te caíste al piso,"  5.08s ->  152
//   "Me tiraste el pingüino, me tiraste el sifón," 9.52s ->  286
//   "Y estallaron los vidrios de mi corazón."     13.46s ->  404
//   "Te vi bailar, brillando con tu ausencia"     18.32s ->  550
//   "Sin sentir piedad chocando con las mesas."   21.94s ->  658
//   "Te burlaste de todos, te reíste de mí"       26.42s ->  793
//   "Y tus amigos escaparon de vos."               29.90s ->  897
//   "Y a mí me volvió loco tu forma de ser,"       33.26s ->  998
//   "A mí me vuelve loco tu forma de ser."         37.64s -> 1129 (corrected)
//   "Tu egoísmo y tu soledad"                      42.22s -> 1267
//   "Son estrellas en la noche de la mediocridad." 45.80s -> 1374
//   "Me vuelve loco tu forma de ser,"              51.28s -> 1538
//   "A mí me volvió loco tu forma de ser."         53.68s -> 1610
//   "Tu egoísmo y tu soledad"                      58.16s -> 1745
//   "Son joyas en el barro de la mediocridad."     61.48s -> 1844 (corrected)
//
// No burn/delete effect on this one — plain conversation. 16 lines run
// well past a single screen, so it uses AutoScrollChatLog (auto-
// scrolls to keep the latest line in view) rather than DarkChatLog's
// static centered block, and the TikTok-safe top/bottom/right margins
// tuned on the previous (4th) lyric-sync clip.
export const BUBBLES: DarkBubble[] = [
  { from: "me", text: "Te vi llegar del brazo de un amigo", timestamp: "22:14", atFrame: 0 },
  { from: "me", text: "Cuando entraste al bar y te caíste al piso,", timestamp: "22:14", atFrame: 152 },
  { from: "me", text: "Me tiraste el pingüino, me tiraste el sifón,", timestamp: "22:15", atFrame: 286 },
  { from: "me", text: "Y estallaron los vidrios de mi corazón.", timestamp: "22:15", atFrame: 404 },
  { from: "me", text: "Te vi bailar, brillando con tu ausencia", timestamp: "22:16", atFrame: 550 },
  { from: "me", text: "Sin sentir piedad chocando con las mesas.", timestamp: "22:16", atFrame: 658 },
  { from: "me", text: "Te burlaste de todos, te reíste de mí", timestamp: "22:17", atFrame: 793 },
  { from: "me", text: "Y tus amigos escaparon de vos.", timestamp: "22:17", atFrame: 897 },
  { from: "me", text: "Y a mí me volvió loco tu forma de ser,", timestamp: "22:18", atFrame: 998 },
  { from: "me", text: "A mí me vuelve loco tu forma de ser.", timestamp: "22:18", atFrame: 1129 },
  { from: "me", text: "Tu egoísmo y tu soledad", timestamp: "22:19", atFrame: 1267 },
  { from: "me", text: "Son estrellas en la noche de la mediocridad.", timestamp: "22:19", atFrame: 1374 },
  { from: "me", text: "Me vuelve loco tu forma de ser,", timestamp: "22:20", atFrame: 1538 },
  { from: "me", text: "A mí me volvió loco tu forma de ser.", timestamp: "22:20", atFrame: 1610 },
  { from: "me", text: "Tu egoísmo y tu soledad", timestamp: "22:21", atFrame: 1745 },
  { from: "me", text: "Son joyas en el barro de la mediocridad.", timestamp: "22:21", atFrame: 1844 },
];

// Last bubble's entrance settles ~15-20 frames after its atFrame — the
// composition holds a few seconds past that so the final line is
// readable before the clip ends.
export const LYRIC_SYNC_5_LAST_FRAME = 1844;

// Same TikTok-safe margins tuned on LyricSyncScene4: pinned top/left
// instead of centered so early lines don't start flush against the
// top edge, and the right edge stays clear of TikTok's own action
// column (measured off an actually-posted clip).
const CANVAS_TOP_MARGIN = 190;
const CANVAS_BOTTOM_MARGIN = 320;
const CANVAS_LEFT_MARGIN = 40;
const SAFE_RIGHT_EDGE = 920; // ~85% of the 1080-wide frame
const SCALE = 1.6;
const CONTENT_WIDTH = Math.round((SAFE_RIGHT_EDGE - CANVAS_LEFT_MARGIN) / SCALE);
const VIEWPORT_HEIGHT = Math.round((1920 - CANVAS_TOP_MARGIN - CANVAS_BOTTOM_MARGIN) / SCALE);

export const LyricSyncScene5: React.FC = () => {
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
          paddingTop: CANVAS_TOP_MARGIN,
          paddingLeft: CANVAS_LEFT_MARGIN,
        }}
      >
        <div style={{ transform: `scale(${SCALE})`, transformOrigin: "top left" }}>
          <AutoScrollChatLog
            bubbles={BUBBLES}
            viewportHeight={VIEWPORT_HEIGHT}
            width={CONTENT_WIDTH}
            dateLabel="Hoy"
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
