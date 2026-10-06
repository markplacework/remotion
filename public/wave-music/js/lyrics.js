// Wave Music · LETRA
// Turns pasted text into lyric lines. Knows nothing about time, except
// that it recognises LRC tags ("[00:12.34] línea") if the user pastes
// an already-synced file, and hands those times back separately.
(function (WM) {
  const LRC_TAG = /^\s*\[(\d{1,2}):(\d{1,2}(?:[.:]\d{1,3})?)\]\s*/;

  /**
   * @returns {{ lines: {id:string, text:string}[], embeddedStarts: number[]|null }}
   */
  function parseLyrics(raw) {
    const lines = [];
    const starts = [];
    let allTagged = true;

    String(raw || "")
      .split(/\r?\n/)
      .forEach((row) => {
        let text = row.trim();
        if (!text) return;
        // Ignore LRC metadata like [ar:Artist]
        if (/^\[[a-z]+:.*\]$/i.test(text)) return;
        const m = LRC_TAG.exec(text);
        if (m) {
          starts.push(Number(m[1]) * 60 + Number(m[2].replace(":", ".")));
          text = text.replace(LRC_TAG, "").trim();
          if (!text) return;
        } else {
          allTagged = false;
        }
        lines.push({ id: "l" + lines.length, text });
      });

    return {
      lines,
      embeddedStarts: lines.length && allTagged && starts.length === lines.length ? starts : null,
    };
  }

  WM.Lyrics = { parseLyrics };
})((window.WaveMusic = window.WaveMusic || {}));
