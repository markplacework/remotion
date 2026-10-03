# Project notes

## Lyric-sync WhatsApp chat videos (TikTok) — the standard for every new one

When the user sends a song clip + lyrics, build a new `LyricSyncN` (next
number after the highest existing `src/LyricSyncN.tsx`). Copy the newest
`src/scenes/LyricSyncSceneN.tsx` / `src/LyricSyncN.tsx` as the template and
register it in `src/Composition.tsx`.

Fixed references — always use these, never the old ones:

- **Background:** `staticFile("/fake-chat/background-alt.png")` (the new
  wallpaper). NOT `/fake-chat/background.png` — that was the first one and
  is no longer used.
- **TikTok-safe margins:** import from `src/lyricSyncDefaults.ts`, never
  retype the numbers. Keeps the chat clear of TikTok's top chrome, bottom
  caption/username band and right-side button column (1080x1920 frame):
  - top 190px (`LYRIC_SYNC_CANVAS_TOP_MARGIN`)
  - bottom 320px (`LYRIC_SYNC_CANVAS_BOTTOM_MARGIN`)
  - left 40px (`LYRIC_SYNC_CANVAS_LEFT_MARGIN`)
  - right edge x=935 (`LYRIC_SYNC_SAFE_RIGHT_EDGE`, ~87%)
  - scale 1.6 (`LYRIC_SYNC_SCALE`), plus the derived
    `LYRIC_SYNC_CONTENT_WIDTH` / `LYRIC_SYNC_VIEWPORT_HEIGHT`
- **Chat component:** `AutoScrollChatLog` (scrolls like real WhatsApp so
  long songs never overflow the safe area), `dateLabel="Hoy"`.
- **Audio:** render silent (no `<Audio>`); the user adds the song in
  TikTok/CapCut. `atFrame` values are relative to the song's 0:00.
- **Duration:** last bubble's `atFrame` + `LYRIC_SYNC_HOLD_FRAMES` (8s),
  unless a fixed length is requested.
- **Timing:** faster-whisper (small, `word_timestamps=True`,
  `initial_prompt` = the given lyrics); if the clip has burned-in
  subtitles, cross-check line starts against them.
- Lyrics text exactly as the user wrote it, one bubble per line, all
  `from: "me"` unless told otherwise.

Rendering in the cloud container: pass
`--browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell`
(Remotion can't download its own browser here).
