import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../theme";

const FONT_STACK = '"Helvetica Neue", Helvetica, Arial, sans-serif';

const NumberBadge: React.FC<{ n: number }> = ({ n }) => (
  <div
    style={{
      width: 34,
      height: 34,
      borderRadius: "50%",
      background: COLORS.wapiGreenLight,
      color: COLORS.black,
      fontFamily: FONT_STACK,
      fontWeight: 800,
      fontSize: 19,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}
  >
    {n}
  </div>
);

type Step = { atFrame: number; holdFrames: number; number: number; text: string };

const StepBadge: React.FC<Step> = ({ atFrame, holdFrames, number, text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - atFrame;
  if (local < -2 || local > holdFrames) return null;

  const enter = spring({ frame: local, fps, config: { damping: 14, mass: 0.55 } });
  const exitProgress = interpolate(local, [holdFrames - 8, holdFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = Math.min(enter, 1) * (1 - exitProgress);
  const translateY = interpolate(enter, [0, 1], [-14, 0]);

  return (
    <div
      style={{
        position: "absolute",
        top: "6%",
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        opacity,
        transform: `translateY(${translateY}px)`,
        pointerEvents: "none",
        padding: "0 64px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          background: "rgba(8,14,11,0.94)",
          border: `1.5px solid ${COLORS.wapiGreenLight}`,
          borderRadius: 28,
          padding: "16px 28px",
          boxShadow: "0 16px 34px -10px rgba(0,0,0,0.65)",
          maxWidth: 880,
        }}
      >
        <NumberBadge n={number} />
        <span
          style={{
            fontFamily: FONT_STACK,
            fontWeight: 700,
            fontSize: 27,
            lineHeight: 1.25,
            color: COLORS.white,
          }}
        >
          {text}
        </span>
      </div>
    </div>
  );
};

/**
 * Steps 3-5 of the "Mirá qué fácil..." hook (steps 1-2 are the Hook
 * scene's own text) — brief numbered toasts synced to the moment each
 * one is actually happening on screen, rather than a checklist sitting
 * over the mockup the whole time. Scene-local: `atFrame` matches the
 * same Sequence the mockup scene it annotates lives in.
 */
export const StepCalloutsOverlay: React.FC<{ steps: Step[] }> = ({ steps }) => {
  return (
    <>
      {steps.map((s, i) => (
        <StepBadge key={i} {...s} />
      ))}
    </>
  );
};
