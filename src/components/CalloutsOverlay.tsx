import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../theme";

const FONT_STACK = '"Helvetica Neue", Helvetica, Arial, sans-serif';

const CheckIcon: React.FC = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ display: "block", flexShrink: 0 }}>
    <circle cx="12" cy="12" r="11" fill={COLORS.wapiGreenLight} />
    <path d="M7 12.5l3 3 7-7.5" stroke={COLORS.black} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

type Callout = { atFrame: number; holdFrames: number; text: string };

const CalloutBadge: React.FC<Callout> = ({ atFrame, holdFrames, text }) => {
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
        top: "7%",
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        opacity,
        transform: `translateY(${translateY}px)`,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: "rgba(8,14,11,0.94)",
          border: `1.5px solid ${COLORS.wapiGreenLight}`,
          borderRadius: 999,
          padding: "16px 30px",
          boxShadow: "0 16px 34px -10px rgba(0,0,0,0.65)",
        }}
      >
        <CheckIcon />
        <span
          style={{
            fontFamily: FONT_STACK,
            fontWeight: 700,
            fontSize: 32,
            color: COLORS.white,
            whiteSpace: "nowrap",
          }}
        >
          {text}
        </span>
      </div>
    </div>
  );
};

/**
 * Small confirmation toasts over the editor beat, reinforcing what just
 * happened (logo/portada/banner/product) without relying on narration
 * alone. Scene-local — meant to sit in a Sequence with the same `from`
 * as the EditorScene it annotates, so `atFrame` lines up with the same
 * cue numbers used to drive the real demo.
 */
export const CalloutsOverlay: React.FC<{ callouts: Callout[] }> = ({ callouts }) => {
  return (
    <>
      {callouts.map((c, i) => (
        <CalloutBadge key={i} {...c} />
      ))}
    </>
  );
};
