import { useLayoutEffect, useRef, useState } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { DarkChatBubble, HoyPill, type DarkBubble } from "./DarkChatLog";

// Long-conversation variant of DarkChatLog. The plain DarkChatLog lays
// bubbles out in normal flow inside a block that the scene then
// centers as a whole — fine for a short exchange, but once the stack
// gets taller than the frame (a 16-line song easily does), centering a
// growing block just pushes the earliest bubbles above frame 0 and the
// latest below the bottom edge, both invisible, with nothing "wrong"
// showing in any single frame to notice by eye.
//
// This variant fixes that the way real WhatsApp does: a fixed-size
// viewport that clips overflow, with the conversation auto-scrolling
// up as each new line arrives so it stays anchored near the bottom —
// older lines scroll out of view above instead of the whole thing
// silently overflowing the frame.
export const AutoScrollChatLog: React.FC<{
  bubbles: DarkBubble[];
  /** Local (pre-scale) pixel height of the visible chat viewport —
   * the scene's own wrapping scale() determines how that maps to the
   * final frame. */
  viewportHeight: number;
  compact?: boolean;
  dateLabel?: string;
}> = ({ bubbles, viewportHeight, compact = false, dateLabel = "HOY" }) => {
  const fontSize = compact ? 18 : 22;
  const senderChangeGap = compact ? 18 : 26;
  const sameSenderGap = compact ? 10 : 14;
  const hoyGap = compact ? 20 : 30;

  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const contentRef = useRef<HTMLDivElement>(null);
  // Bottom edge (px, relative to the scrollable content's own top) of
  // each bubble, measured once after mount. Layout doesn't change
  // frame to frame (only opacity/transform do), so one measurement is
  // valid for the whole render.
  const [bottoms, setBottoms] = useState<number[] | null>(null);

  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    // First child is the Hoy-pill wrapper; the rest are bubbles, in order.
    const bubbleEls = Array.from(el.children).slice(1) as HTMLElement[];
    setBottoms(bubbleEls.map((c) => c.offsetTop + c.offsetHeight));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bubbles.length]);

  let activeIndex = -1;
  for (let i = 0; i < bubbles.length; i++) {
    if (bubbles[i].atFrame <= frame) activeIndex = i;
  }

  const BOTTOM_PADDING = 18;
  const scrollFor = (index: number) =>
    index >= 0 && bottoms ? Math.max(0, bottoms[index] - viewportHeight + BOTTOM_PADDING) : 0;
  const prevScroll = scrollFor(activeIndex - 1);
  const nextScroll = scrollFor(activeIndex);
  // Same easing feel as a bubble's own entrance, keyed off that
  // bubble's atFrame — the chat visibly glides into place as the new
  // line arrives instead of snapping.
  const activeAtFrame = activeIndex >= 0 ? bubbles[activeIndex].atFrame : 0;
  const ease = spring({ frame: Math.max(0, frame - activeAtFrame), fps, config: { damping: 18, mass: 0.7 } });
  const scrollY = interpolate(Math.min(ease, 1), [0, 1], [prevScroll, nextScroll]);

  return (
    <div style={{ width: 620, height: viewportHeight, overflow: "hidden", position: "relative" }}>
      <div ref={contentRef} style={{ padding: "24px 12px 0", transform: `translateY(${-scrollY}px)` }}>
        <div style={{ marginBottom: hoyGap }}>
          <HoyPill label={dateLabel} />
        </div>
        {bubbles.map((b, i) => {
          const prev = bubbles[i - 1];
          const marginTop = i === 0 ? 0 : prev.from !== b.from ? senderChangeGap : sameSenderGap;
          return <DarkChatBubble key={i} {...b} marginTop={marginTop} fontSize={fontSize} />;
        })}
      </div>
    </div>
  );
};
