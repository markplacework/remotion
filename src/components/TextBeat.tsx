import { Easing, interpolate, useCurrentFrame } from "remotion";
import { COLORS } from "../theme";
import type { TextPart } from "./AdText";

type Props = {
  lines: TextPart[][];
  fontSize: number;
  top?: number | string;
  bottom?: number | string;
  /** [fade-in start, fade-in end, fade-out start, fade-out end], local frames. */
  window: [number, number, number, number];
  weight?: number;
};

const FONT_STACK = '"Helvetica Neue", Helvetica, Arial, sans-serif';

/**
 * Like AdText, but fades back out too — for scenes that show more than one
 * line of copy in sequence over the same fixed shot (see HookScene) rather
 * than one line that just stays up for the whole scene.
 */
export const TextBeat: React.FC<Props> = ({ lines, fontSize, top, bottom, window, weight = 800 }) => {
  const frame = useCurrentFrame();
  const [inStart, inEnd, outStart, outEnd] = window;

  const opacity = interpolate(frame, [inStart, inEnd, outStart, outEnd], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(frame, [inStart, inEnd], [22, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      style={{
        position: "absolute",
        top,
        bottom,
        left: 0,
        right: 0,
        textAlign: "center",
        padding: "0 72px",
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      {lines.map((parts, i) => (
        <div
          key={i}
          style={{
            fontFamily: FONT_STACK,
            fontWeight: weight,
            fontSize,
            lineHeight: 1.15,
            letterSpacing: -0.5,
            textShadow: "0 8px 28px rgba(0,0,0,0.5)",
          }}
        >
          {parts.map((part, j) => (
            <span key={j} style={{ color: part.accent ? COLORS.wapiGreenLight : COLORS.white }}>
              {part.text}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
};
