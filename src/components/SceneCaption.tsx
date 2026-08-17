import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../theme";
import { wapiFont } from "../fonts";

export type TextPart = { text: string; accent?: boolean };

type Props = {
  lines: TextPart[][];
  fontSize: number;
  durationInFrames: number;
  top?: number | string;
  bottom?: number | string;
  left?: number | string;
  align?: "left" | "center";
  maxWidth?: number;
  delay?: number;
  weight?: number;
};

export const SceneCaption: React.FC<Props> = ({
  lines,
  fontSize,
  durationInFrames,
  top,
  bottom,
  left = 64,
  align = "left",
  maxWidth = 920,
  delay = 0,
  weight = 800,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const exitStart = durationInFrames - 16;
  const exit = interpolate(frame, [exitStart, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top,
        bottom,
        left: align === "center" ? "50%" : left,
        transform: align === "center" ? "translateX(-50%)" : undefined,
        maxWidth,
        textAlign: align,
      }}
    >
      {lines.map((parts, i) => {
        const lineDelay = delay + i * 4;
        const entrance = spring({
          frame: frame - lineDelay,
          fps,
          config: { damping: 200, mass: 0.6, stiffness: 190 },
        });
        const translateY = interpolate(entrance, [0, 1], [30, 0]);

        return (
          <div
            key={i}
            style={{
              fontFamily: wapiFont,
              fontWeight: weight,
              fontSize,
              lineHeight: 1.08,
              letterSpacing: -0.5,
              opacity: entrance * exit,
              transform: `translateY(${translateY}px)`,
              textShadow: "0 6px 24px rgba(0,0,0,0.45)",
            }}
          >
            {parts.map((part, j) => (
              <span
                key={j}
                style={{ color: part.accent ? COLORS.green : COLORS.white }}
              >
                {part.text}
              </span>
            ))}
          </div>
        );
      })}
    </div>
  );
};
