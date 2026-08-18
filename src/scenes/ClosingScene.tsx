import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { AdText } from "../components/AdText";
import { COLORS } from "../theme";

const FONT_STACK = '"Helvetica Neue", Helvetica, Arial, sans-serif';

const useEnter = (delay: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entrance = spring({ frame: frame - delay, fps, config: { damping: 200, mass: 0.6 } });
  return { opacity: entrance, translateY: interpolate(entrance, [0, 1], [22, 0]) };
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

const CtaButton: React.FC<{ delay: number; top: number | string }> = ({ delay, top }) => {
  const { opacity, translateY } = useEnter(delay);
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, textAlign: "center" }}>
      <div
        style={{
          display: "inline-block",
          opacity,
          transform: `translateY(${translateY}px)`,
          fontFamily: FONT_STACK,
          fontWeight: 800,
          fontSize: 40,
          color: COLORS.black,
          background: COLORS.wapiGreenLight,
          padding: "28px 68px",
          borderRadius: 999,
          boxShadow: "0 16px 40px -8px rgba(37,211,102,0.45)",
        }}
      >
        Conocé Wapi
      </div>
    </div>
  );
};

/** Institutional close — text and logo only, no mockup, no free-trial offer. */
export const ClosingScene: React.FC = () => {
  return (
    <AbsoluteFill>
      <Backdrop />
      <WapiWordmark delay={4} top="30%" />
      <AdText
        top="42%"
        delay={20}
        fontSize={48}
        weight={700}
        lines={[[{ text: "Convertí tu WhatsApp en un" }], [{ text: "catálogo " }, { text: "profesional", accent: true }, { text: "." }]]}
      />
      <CtaButton delay={40} top="58%" />
    </AbsoluteFill>
  );
};
