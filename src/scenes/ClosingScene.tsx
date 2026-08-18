import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { AdText } from "../components/AdText";
import { COLORS } from "../theme";

const FONT_STACK = '"Helvetica Neue", Helvetica, Arial, sans-serif';

const useEnter = (delay: number, config?: { damping?: number; mass?: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const raw = spring({
    frame: frame - delay,
    fps,
    config: { damping: config?.damping ?? 200, mass: config?.mass ?? 0.6 },
  });
  return { raw, opacity: Math.min(raw, 1), translateY: interpolate(raw, [0, 1], [22, 0]) };
};

const WapiWordmark: React.FC<{ delay: number; top: number | string }> = ({ delay, top }) => {
  const { opacity, translateY } = useEnter(delay);
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, textAlign: "center" }}>
      <div
        style={{
          display: "inline-block",
          opacity,
          transform: `translateY(${translateY}px)`,
          fontFamily: FONT_STACK,
          fontWeight: 900,
          fontSize: 108,
          letterSpacing: -2,
          background: `linear-gradient(135deg, ${COLORS.wapiGreen} 0%, ${COLORS.wapiGreen} 55%, ${COLORS.wapiGreenLight} 100%)`,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        Wapi
      </div>
    </div>
  );
};

const ArrowIcon: React.FC = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" style={{ display: "block" }}>
    <path d="M5 12h13M13 6l6 6-6 6" stroke={COLORS.black} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CtaButton: React.FC<{ delay: number; top: number | string }> = ({ delay, top }) => {
  // A snappier, bouncier arrival than the calmer wordmark/tagline above it
  // — this is the one thing on screen that should feel like an action.
  const { raw, opacity, translateY } = useEnter(delay, { damping: 11, mass: 0.7 });
  const scale = interpolate(raw, [0, 1], [0.9, 1]);
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, textAlign: "center" }}>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 14,
          opacity,
          transform: `translateY(${translateY}px) scale(${scale})`,
          fontFamily: FONT_STACK,
          fontWeight: 800,
          fontSize: 42,
          color: COLORS.black,
          background: `linear-gradient(135deg, ${COLORS.wapiGreenLight} 0%, #34e879 100%)`,
          padding: "30px 56px",
          borderRadius: 999,
          boxShadow: "0 20px 50px -10px rgba(37,211,102,0.55), 0 0 0 1px rgba(255,255,255,0.25) inset",
        }}
      >
        Conocé Wapi
        <ArrowIcon />
      </div>
    </div>
  );
};

/** Institutional close — text and logo only, no mockup, no free-trial offer. */
export const ClosingScene: React.FC = () => {
  return (
    <AbsoluteFill>
      <Backdrop />
      <WapiWordmark delay={4} top="28%" />
      <AdText
        top="41%"
        delay={20}
        fontSize={48}
        weight={700}
        lines={[[{ text: "Convertí tu WhatsApp en un" }], [{ text: "catálogo " }, { text: "profesional", accent: true }, { text: "." }]]}
      />
      <CtaButton delay={42} top="59%" />
    </AbsoluteFill>
  );
};
