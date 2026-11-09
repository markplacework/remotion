import "@fontsource/poppins/700.css";
import { useLayoutEffect, useRef, useState } from "react";
import { continueRender, delayRender, interpolate, interpolateColors, spring, useCurrentFrame, useVideoConfig } from "remotion";

const FONT_STACK = 'Poppins, "Helvetica Neue", Helvetica, Arial, sans-serif';

// Spotify's own lyrics-view language: one big bold block of lines on a
// flat color. Lines still to come are dark, the line being sung right
// now is bright white, lines already sung stay white but a little
// softer — and the whole block scrolls so the current line sits at a
// fixed spot near the top.
const UPCOMING = "rgba(0, 0, 0, 0.55)";
const ACTIVE = "rgba(255, 255, 255, 1)";
const SUNG = "rgba(255, 255, 255, 0.72)";
const COLOR_FADE_FRAMES = 8;
const EDGE_FADE = 90;

export type LyricLine = { text: string; atFrame: number };

export const SpotifyLyrics: React.FC<{
  lines: LyricLine[];
  /** Visible area, in final-frame pixels. */
  width: number;
  height: number;
  fontSize?: number;
  /** Where (px from the viewport top) the current line's top edge sits. */
  anchorY?: number;
}> = ({ lines, width, height, fontSize = 62, anchorY = 260 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const contentRef = useRef<HTMLDivElement>(null);
  // Top edge of each line, measured once after the font is in (wrapping
  // depends on it) — layout never changes frame to frame, only color
  // and the scroll offset do.
  const [tops, setTops] = useState<number[] | null>(null);
  const [handle] = useState(() => delayRender("SpotifyLyrics: font + measure"));

  useLayoutEffect(() => {
    let cancelled = false;
    document.fonts.load(`700 ${fontSize}px Poppins`).then(() => {
      if (cancelled || !contentRef.current) return;
      const els = Array.from(contentRef.current.children) as HTMLElement[];
      setTops(els.map((el) => el.offsetTop));
      continueRender(handle);
    });
    return () => {
      cancelled = true;
    };
  }, [fontSize, handle, lines.length]);

  let activeIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].atFrame <= frame) activeIndex = i;
  }

  // Before the first line, the block rests with line 0 at the anchor.
  const scrollFor = (index: number) => (tops ? tops[Math.max(0, index)] - anchorY : 0);
  const prevScroll = scrollFor(activeIndex - 1);
  const nextScroll = scrollFor(activeIndex);
  const activeAtFrame = activeIndex >= 0 ? lines[activeIndex].atFrame : 0;
  const ease = spring({ frame: Math.max(0, frame - activeAtFrame), fps, config: { damping: 20, mass: 0.8 } });
  const scrollY = interpolate(Math.min(ease, 1), [0, 1], [prevScroll, nextScroll]);

  return (
    <div
      style={{
        width,
        height,
        overflow: "hidden",
        position: "relative",
        // Lines fade out at both edges instead of being cut off flat.
        maskImage: `linear-gradient(180deg, transparent 0, black ${EDGE_FADE}px, black calc(100% - ${EDGE_FADE}px), transparent 100%)`,
      }}
    >
      <div ref={contentRef} style={{ transform: `translateY(${-scrollY}px)` }}>
        {lines.map((line, i) => {
          const sinceStart = frame - line.atFrame;
          const next = lines[i + 1];
          const sinceEnd = next ? frame - next.atFrame : -1;
          let color = UPCOMING;
          if (sinceStart >= 0) {
            color = interpolateColors(Math.min(sinceStart, COLOR_FADE_FRAMES), [0, COLOR_FADE_FRAMES], [UPCOMING, ACTIVE]);
          }
          if (sinceEnd >= 0) {
            color = interpolateColors(Math.min(sinceEnd, COLOR_FADE_FRAMES), [0, COLOR_FADE_FRAMES], [ACTIVE, SUNG]);
          }
          return (
            <div
              key={i}
              style={{
                fontFamily: FONT_STACK,
                fontWeight: 700,
                fontSize,
                lineHeight: 1.22,
                letterSpacing: -0.5,
                color,
                marginBottom: fontSize * 0.42,
              }}
            >
              {line.text}
            </div>
          );
        })}
      </div>
    </div>
  );
};
