import { AbsoluteFill, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { Camera } from "../components/Camera";
import { PhoneMockup } from "../components/PhoneMockup";
import { AdText } from "../components/AdText";
import { ACTIVE_BUSINESS } from "../business";
import { COLORS, SCENE_CIERRE } from "../theme";

const CATALOG_URL = staticFile(`/catalogo/${ACTIVE_BUSINESS.slug}.html`);
const FONT_STACK = '"Helvetica Neue", Helvetica, Arial, sans-serif';

const WapiWordmark: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entrance = spring({ frame: frame - delay, fps, config: { damping: 200, mass: 0.6 } });
  const translateY = interpolate(entrance, [0, 1], [22, 0]);

  return (
    <div
      style={{
        opacity: entrance,
        transform: `translateY(${translateY}px)`,
        fontFamily: FONT_STACK,
        fontWeight: 900,
        fontSize: 96,
        letterSpacing: -2,
        background: `linear-gradient(135deg, ${COLORS.wapiGreen} 0%, ${COLORS.wapiGreen} 55%, ${COLORS.wapiGreenLight} 100%)`,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
      }}
    >
      Wapi
    </div>
  );
};

/** Institutional close — no free-trial offer, just the product + wordmark. */
export const ClosingScene: React.FC = () => {
  return (
    <AbsoluteFill>
      <Backdrop />

      <AbsoluteFill style={{ opacity: 0.35, filter: "blur(1px)" }}>
        <Camera from={{ scale: 0.64, y: 14 }} to={{ scale: 0.68, y: 0 }} durationInFrames={SCENE_CIERRE}>
          <PhoneMockup width={560} src={CATALOG_URL} sheenPosition={0.5} />
        </Camera>
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse at 50% 45%, rgba(5,7,6,0.25) 0%, rgba(5,7,6,0.9) 72%)",
        }}
      />

      <AbsoluteFill style={{ alignItems: "center" }}>
        <div style={{ marginTop: 640 }}>
          <WapiWordmark delay={4} />
        </div>
      </AbsoluteFill>

      <AdText
        bottom={260}
        delay={18}
        fontSize={46}
        weight={700}
        lines={[[{ text: "Un catálogo " }, { text: "profesional", accent: true }, { text: "." }], [{ text: "Pedidos por WhatsApp." }]]}
      />
    </AbsoluteFill>
  );
};
