import { AbsoluteFill } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { TextBeat } from "../components/TextBeat";

/**
 * Gancho + Solución. Text only, nothing else — no mockup on screen here at
 * all, so the product demo scenes that follow never carry a caption over
 * them and this never carries a phone over it either.
 */
export const IntroScene: React.FC = () => {
  return (
    <AbsoluteFill>
      <Backdrop />
      <TextBeat
        top="36%"
        fontSize={76}
        window={[0, 15, 78, 98]}
        lines={[[{ text: "¿Vendés por " }, { text: "WhatsApp?", accent: true }], [{ text: "Recibí pedidos de forma" }], [{ text: "simple y ordenada." }]]}
      />
      <TextBeat
        top="42%"
        fontSize={46}
        window={[108, 128, 162, 180]}
        lines={[[{ text: "Un solo link." }], [{ text: "Un catálogo " }, { text: "profesional", accent: true }, { text: "." }], [{ text: "Pedidos por WhatsApp." }]]}
      />
    </AbsoluteFill>
  );
};
