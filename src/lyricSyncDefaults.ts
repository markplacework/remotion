import { FPS } from "./theme";

/**
 * Standard layout for every lyric-sync scene going forward — locked in
 * after LyricSyncScene9, which the user confirmed they liked. Import
 * these instead of retyping the numbers in each new LyricSyncSceneN.tsx
 * (past scenes 4-9 still have them inlined; not retrofitted since they're
 * already delivered/approved, and touching them risks a pixel drift for
 * no benefit).
 *
 * Usage in a new scene file:
 *
 *   import { AbsoluteFill, Img, staticFile } from "remotion";
 *   import { AutoScrollChatLog } from "../components/AutoScrollChatLog";
 *   import {
 *     LYRIC_SYNC_CANVAS_TOP_MARGIN,
 *     LYRIC_SYNC_CANVAS_LEFT_MARGIN,
 *     LYRIC_SYNC_CONTENT_WIDTH,
 *     LYRIC_SYNC_VIEWPORT_HEIGHT,
 *     LYRIC_SYNC_SCALE,
 *   } from "../lyricSyncDefaults";
 *
 *   <AbsoluteFill
 *     style={{
 *       alignItems: "flex-start",
 *       justifyContent: "flex-start",
 *       paddingTop: LYRIC_SYNC_CANVAS_TOP_MARGIN,
 *       paddingLeft: LYRIC_SYNC_CANVAS_LEFT_MARGIN,
 *     }}
 *   >
 *     <div style={{ transform: `scale(${LYRIC_SYNC_SCALE})`, transformOrigin: "top left" }}>
 *       <AutoScrollChatLog
 *         bubbles={BUBBLES}
 *         viewportHeight={LYRIC_SYNC_VIEWPORT_HEIGHT}
 *         width={LYRIC_SYNC_CONTENT_WIDTH}
 *         dateLabel="Hoy"
 *       />
 *     </div>
 *   </AbsoluteFill>
 *
 * And for duration (natural pacing, no fixed length requested):
 *
 *   export const LYRIC_SYNC_N_DURATION = LYRIC_SYNC_N_LAST_FRAME + LYRIC_SYNC_HOLD_FRAMES;
 */

// Top/bottom keep the chat clear of TikTok's own top status chrome and
// bottom caption/username/engagement-button band — tuned on
// LyricSyncScene4/5/7. Left is a plain, comfortable margin. Right is
// pinned close to (but short of) TikTok's right-side action column —
// nudged from the original 920 (~85%, fully clear of the icons) to
// 935 (~87%) on request, then confirmed as the look to keep.
export const LYRIC_SYNC_CANVAS_TOP_MARGIN = 190;
export const LYRIC_SYNC_CANVAS_BOTTOM_MARGIN = 320;
export const LYRIC_SYNC_CANVAS_LEFT_MARGIN = 40;
export const LYRIC_SYNC_SAFE_RIGHT_EDGE = 935; // ~87% of the 1080-wide frame
export const LYRIC_SYNC_SCALE = 1.6;

export const LYRIC_SYNC_CONTENT_WIDTH = Math.round(
  (LYRIC_SYNC_SAFE_RIGHT_EDGE - LYRIC_SYNC_CANVAS_LEFT_MARGIN) / LYRIC_SYNC_SCALE,
);
export const LYRIC_SYNC_VIEWPORT_HEIGHT = Math.round(
  (1920 - LYRIC_SYNC_CANVAS_TOP_MARGIN - LYRIC_SYNC_CANVAS_BOTTOM_MARGIN) / LYRIC_SYNC_SCALE,
);

// Natural-length pacing default: last bubble's atFrame + this hold,
// unless a fixed total duration is requested instead (e.g. "same
// length as the source clip").
export const LYRIC_SYNC_HOLD_FRAMES = 8 * FPS;
