import { AbsoluteFill, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { Camera } from "../components/Camera";
import { PhoneMockup } from "../components/PhoneMockup";
import { AdText } from "../components/AdText";
import { ACTIVE_BUSINESS } from "../business";
import { COLORS, SCENE_4_CTA } from "../theme";
import { stopPortadaAutoplay } from "./catalogWindow";

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

export const CtaScene: React.FC = () => {
  return (
    <AbsoluteFill>
      <Backdrop />

      <AbsoluteFill style={{ opacity: 0.35, filter: "blur(1px)" }}>
        <Camera from={{ scale: 0.62, y: 40 }} to={{ scale: 0.68, y: 20 }} durationInFrames={SCENE_4_CTA}>
          <PhoneMockup
            width={560}
            src={CATALOG_URL}
            sheenPosition={0.5}
            onReady={stopPortadaAutoplay}
          />
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
        top={800}
        delay={16}
        fontSize={60}
        lines={[[{ text: "Creá tu catálogo" }], [{ text: "con Wapi." }]]}
      />

      <AdText
        bottom={210}
        delay={32}
        fontSize={40}
        weight={700}
        lines={[[{ text: "Probá Wapi " }, { text: "gratis", accent: true }, { text: " 15 días." }]]}
      />
    </AbsoluteFill>
  );
};
