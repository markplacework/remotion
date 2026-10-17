import "@fontsource/poppins/600.css";
import { useEffect, useState } from "react";
import { continueRender, delayRender, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

export type CineLine = {
  // Seconds, straight from the word-level transcription of the voice.
  from: number;
  to: number;
  text: string;
  // Words drawn in gold to carry the line's key idea.
  highlight?: string[];
};

const GOLD = "#f5d27a";
const FADE = 5;

const Line: React.FC<CineLine & { bottom: number }> = ({ from, to, text, highlight = [], bottom }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const start = Math.round(from * fps);
  const end = Math.round(to * fps);
  if (frame < start || frame > end) return null;

  const opacity = Math.min(
    interpolate(frame, [start, start + FADE], [0, 1], { extrapolateRight: "clamp" }),
    interpolate(frame, [end - FADE, end], [1, 0], { extrapolateLeft: "clamp" }),
  );
  const rise = interpolate(frame, [start, start + FADE * 2], [14, 0], { extrapolateRight: "clamp" });
  const blur = interpolate(frame, [start, start + FADE], [6, 0], { extrapolateRight: "clamp" });
  const isKey = (w: string) => highlight.includes(w.replace(/[¿?¡!.,]/g, ""));

  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        right: 70,
        bottom,
        display: "flex",
        justifyContent: "center",
        opacity,
        transform: `translateY(${rise}px)`,
        filter: `blur(${blur}px)`,
      }}
    >
      <span
        style={{
          fontFamily: "Poppins, sans-serif",
          fontWeight: 600,
          fontSize: 58,
          lineHeight: 1.25,
          letterSpacing: 0.5,
          textAlign: "center",
          textWrap: "balance",
          color: "#fff",
          // Layered soft shadows instead of a box: readable on any
          // background while keeping the clean, film-subtitle look.
          textShadow: "0 2px 4px rgba(0,0,0,0.9), 0 0 18px rgba(0,0,0,0.75), 0 0 40px rgba(0,0,0,0.5)",
        }}
      >
        {text.split(" ").map((w, i) => (
          <span key={i} style={{ color: isKey(w) ? GOLD : undefined }}>
            {i > 0 ? " " : ""}
            {w}
          </span>
        ))}
      </span>
    </div>
  );
};

/** Film-style burned-in subtitles: one centred line at a time, no box. */
export const CineSubtitles: React.FC<{ lines: CineLine[]; bottom: number }> = ({ lines, bottom }) => {
  // Hold the render until Poppins is ready so no frame falls back to a
  // system font.
  const [handle] = useState(() => delayRender("Loading Poppins"));
  useEffect(() => {
    document.fonts.load('600 58px "Poppins"').then(() => continueRender(handle));
  }, [handle]);

  return (
    <>
      {lines.map((l, i) => (
        <Line key={i} {...l} bottom={bottom} />
      ))}
    </>
  );
};
