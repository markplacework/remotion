import { COLORS } from "../theme";
import { wapiFont } from "../fonts";

export const WapiMark: React.FC<{ size?: number }> = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <path
      d="M12 12V9a8 8 0 0 1 16 0v3"
      stroke={COLORS.green}
      strokeWidth={3}
      strokeLinecap="round"
      fill="none"
    />
    <rect x={2} y={11} width={36} height={27} rx={9} fill={COLORS.green} />
    <circle cx={15} cy={22} r={1.8} fill={COLORS.black} />
    <circle cx={25} cy={22} r={1.8} fill={COLORS.black} />
    <path
      d="M14 27c1.6 3 2.7 4 6 4s4.4-1 6-4"
      stroke={COLORS.black}
      strokeWidth={3}
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

export const WapiWordmark: React.FC<{ fontSize?: number }> = ({
  fontSize = 48,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: fontSize * 0.28,
    }}
  >
    <span
      style={{
        fontFamily: wapiFont,
        fontWeight: 900,
        fontSize,
        color: COLORS.white,
        letterSpacing: -1,
      }}
    >
      Wapi
    </span>
    <WapiMark size={fontSize * 0.85} />
  </div>
);
