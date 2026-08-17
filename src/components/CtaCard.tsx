import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../theme";
import { wapiFont } from "../fonts";
import { WapiWordmark } from "./WapiLogo";

type Benefit = { icon: "card" | "cancel" | "headset"; label: string };

const BENEFITS: Benefit[] = [
  { icon: "card", label: "Sin tarjeta\nde crédito" },
  { icon: "cancel", label: "Cancelá\ncuando quieras" },
  { icon: "headset", label: "Soporte\npersonalizado" },
];

const BenefitIcon: React.FC<{ type: Benefit["icon"] }> = ({ type }) => {
  const common = {
    width: 30,
    height: 30,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: COLORS.white,
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (type === "card") {
    return (
      <svg {...common}>
        <rect x={2.5} y={5} width={19} height={14} rx={2.4} />
        <line x1={2.5} y1={9.5} x2={21.5} y2={9.5} />
      </svg>
    );
  }

  if (type === "cancel") {
    return (
      <svg {...common}>
        <circle cx={12} cy={12} r={9} />
        <line x1={8.5} y1={8.5} x2={15.5} y2={15.5} />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M4 13v-1a8 8 0 0 1 16 0v1" />
      <rect x={3} y={13} width={4.5} height={6} rx={1.6} />
      <rect x={16.5} y={13} width={4.5} height={6} rx={1.6} />
    </svg>
  );
};

const useStagger = (index: number, baseDelay: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entrance = spring({
    frame: frame - baseDelay - index * 6,
    fps,
    config: { damping: 200, mass: 0.6, stiffness: 190 },
  });
  return entrance;
};

const Reveal: React.FC<{
  index: number;
  baseDelay: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ index, baseDelay, children, style }) => {
  const entrance = useStagger(index, baseDelay);
  const translateY = interpolate(entrance, [0, 1], [24, 0]);

  return (
    <div
      style={{
        opacity: entrance,
        transform: `translateY(${translateY}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const CtaCard: React.FC = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 28,
        width: "100%",
        padding: "0 64px",
      }}
    >
      <Reveal index={0} baseDelay={0}>
        <WapiWordmark fontSize={72} />
      </Reveal>

      <Reveal
        index={1}
        baseDelay={0}
        style={{ textAlign: "center", marginTop: 6 }}
      >
        <div
          style={{
            fontFamily: wapiFont,
            fontWeight: 900,
            fontSize: 56,
            lineHeight: 1.1,
            letterSpacing: -0.5,
          }}
        >
          <span style={{ color: COLORS.white }}>PROBÁ WAPI </span>
          <span style={{ color: COLORS.green }}>GRATIS</span>
        </div>
      </Reveal>

      <Reveal index={2} baseDelay={0}>
        <div
          style={{
            fontFamily: wapiFont,
            fontWeight: 800,
            fontSize: 30,
            color: COLORS.black,
            background: COLORS.green,
            padding: "14px 34px",
            borderRadius: 999,
          }}
        >
          15 DÍAS SIN COSTO
        </div>
      </Reveal>

      <Reveal
        index={3}
        baseDelay={4}
        style={{
          width: "100%",
          maxWidth: 760,
          height: 1,
          background: "rgba(255,255,255,0.18)",
          marginTop: 8,
        }}
      >
        <div />
      </Reveal>

      <Reveal
        index={4}
        baseDelay={4}
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          maxWidth: 760,
        }}
      >
        {BENEFITS.map((benefit) => (
          <div
            key={benefit.icon}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
              flex: 1,
            }}
          >
            <BenefitIcon type={benefit.icon} />
            <div
              style={{
                fontFamily: wapiFont,
                fontWeight: 600,
                fontSize: 19,
                color: COLORS.offWhite,
                textAlign: "center",
                whiteSpace: "pre-line",
                lineHeight: 1.25,
              }}
            >
              {benefit.label}
            </div>
          </div>
        ))}
      </Reveal>
    </div>
  );
};
