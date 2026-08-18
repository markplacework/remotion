import { AbsoluteFill, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { PhoneMockup, mockupHeightFor } from "../components/PhoneMockup";
import { AdText } from "../components/AdText";
import { ACTIVE_BUSINESS } from "../business";
import { COLORS, VIDEO_HEIGHT } from "../theme";

const CATALOG_URL = staticFile(`/catalogo/${ACTIVE_BUSINESS.slug}.html`);
const FONT_STACK = '"Helvetica Neue", Helvetica, Arial, sans-serif';

const PHONE_WIDTH = 420;
const PHONE_HEIGHT = mockupHeightFor(PHONE_WIDTH);
const PHONE_TOP = 150;
const PHONE_BOTTOM = PHONE_TOP + PHONE_HEIGHT;

const useEnter = (delay: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entrance = spring({ frame: frame - delay, fps, config: { damping: 200, mass: 0.6 } });
  return { opacity: entrance, translateY: interpolate(entrance, [0, 1], [22, 0]) };
};

const WapiWordmark: React.FC<{ delay: number; top: number }> = ({ delay, top }) => {
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
          fontSize: 88,
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

const CtaButton: React.FC<{ delay: number; top: number }> = ({ delay, top }) => {
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
          fontSize: 38,
          color: COLORS.black,
          background: COLORS.wapiGreenLight,
          padding: "26px 64px",
          borderRadius: 999,
          boxShadow: "0 16px 40px -8px rgba(37,211,102,0.45)",
        }}
      >
        Conocé Wapi
      </div>
    </div>
  );
};

/** Institutional close — no free-trial offer. Small, static product shot up
 * top; wordmark, tagline and CTA stacked below it, well clear of the mockup. */
export const ClosingScene: React.FC = () => {
  return (
    <AbsoluteFill>
      <Backdrop />

      <div style={{ position: "absolute", top: PHONE_TOP, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <PhoneMockup width={PHONE_WIDTH} src={CATALOG_URL} />
      </div>

      <WapiWordmark delay={8} top={PHONE_BOTTOM + 90} />

      <AdText
        top={PHONE_BOTTOM + 210}
        delay={24}
        fontSize={44}
        weight={700}
        lines={[[{ text: "Convertí tu WhatsApp en un" }], [{ text: "catálogo " }, { text: "profesional", accent: true }, { text: "." }]]}
      />

      <CtaButton delay={44} top={VIDEO_HEIGHT - 500} />
    </AbsoluteFill>
  );
};
