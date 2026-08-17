import { AbsoluteFill } from "remotion";

export const Grain: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      opacity: 0.5,
      mixBlendMode: "overlay",
      backgroundImage:
        "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)",
      backgroundSize: "3px 3px",
    }}
  />
);
