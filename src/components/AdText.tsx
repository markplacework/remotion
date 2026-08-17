import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../theme";

export type TextPart = { text: string; accent?: boolean };

type Props = {
  lines: TextPart[][];
  fontSize: number;
  top?: number | string;
  bottom?: number | string;
  align?: "left" | "center";
  delay?: number;
  weight?: number;
};

const FONT_STACK = '"Helvetica Neue", Helvetica, Arial, sans-serif';

export const AdText: React.FC<Props> = ({
  lines,
  fontSize,
  top,
  bottom,
  align = "center",
  delay = 0,
  weight = 800,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        position: "absolute",
        top,
        bottom,
        left: 0,
        right: 0,
        textAlign: align,
        padding: "0 72px",
      }}
    >
      {lines.map((parts, i) => {
        const entrance = spring({
          frame: frame - delay - i * 4,
          fps,
          config: { damping: 200, mass: 0.6, stiffness: 190 },
        });
        const translateY = interpolate(entrance, [0, 1], [26, 0]);

        return (
          <div
            key={i}
            style={{
              fontFamily: FONT_STACK,
              fontWeight: weight,
              fontSize,
              lineHeight: 1.1,
              letterSpacing: -0.5,
              opacity: entrance,
              transform: `translateY(${translateY}px)`,
              textShadow: "0 8px 28px rgba(0,0,0,0.5)",
            }}
          >
            {parts.map((part, j) => (
              <span key={j} style={{ color: part.accent ? COLORS.wapiGreenLight : COLORS.white }}>
                {part.text}
              </span>
            ))}
          </div>
        );
      })}
    </div>
  );
};
