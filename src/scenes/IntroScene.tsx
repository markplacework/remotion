import { AbsoluteFill } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { TextBeat } from "../components/TextBeat";

/**
 * Gancho only. Text on its own, nothing else — no mockup on screen here
 * at all, so the product demo scenes that follow never carry a caption
 * over them and this never carries a phone over it either.
 */
export const IntroScene: React.FC = () => {
  return (
    <AbsoluteFill>
      <Backdrop />
      <TextBeat
        top="40%"
        fontSize={76}
        window={[0, 15, 92, 112]}
        lines={[[{ text: "¿Vendés por " }, { text: "WhatsApp?", accent: true }], [{ text: "Recibí pedidos de forma" }], [{ text: "simple y ordenada." }]]}
      />
    </AbsoluteFill>
  );
};
