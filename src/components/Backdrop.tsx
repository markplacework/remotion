import { AbsoluteFill } from "remotion";
import { COLORS } from "../theme";

/** Plain and quiet on purpose — nothing competing with the text or the
 * product for attention, just enough depth that it isn't a flat void. */
export const Backdrop: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
    <AbsoluteFill
      style={{
        background: "radial-gradient(ellipse 70% 55% at 50% 40%, #0d0f0d 0%, #050706 60%, #030403 100%)",
      }}
    />
  </AbsoluteFill>
);
