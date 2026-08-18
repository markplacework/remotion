import { AbsoluteFill } from "remotion";
import { COLORS } from "../theme";

export const Backdrop: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% 38%, #101d16 0%, #060a08 55%, #030403 100%)",
      }}
    />
    {/* A soft brand-color glow behind where the phone sits, so the shot
        reads as a composed product scene rather than a flat black void. */}
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 55% 40% at 50% 42%, ${COLORS.wapiGreen}26 0%, ${COLORS.wapiGreen}00 70%)`,
      }}
    />
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 20%, rgba(0,0,0,0) 78%, rgba(0,0,0,0.6) 100%)",
      }}
    />
    <AbsoluteFill
      style={{
        opacity: 0.4,
        mixBlendMode: "overlay",
        backgroundImage: "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)",
        backgroundSize: "3px 3px",
      }}
    />
  </AbsoluteFill>
);
