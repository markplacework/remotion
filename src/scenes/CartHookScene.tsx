import { AbsoluteFill } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { TextBeat } from "../components/TextBeat";

/**
 * Gancho + steps 1-2 of a 5-step walkthrough (steps 3-5 are
 * StepCalloutsOverlay toasts synced to the scenes where they actually
 * happen — see CartScene/WhatsAppScene). Text on its own here, no
 * mockup in this scene at all — two beats in sequence over the same
 * fixed shot, same pattern as TextBeat's own doc comment describes.
 */
export const CartHookScene: React.FC = () => {
  return (
    <AbsoluteFill>
      <Backdrop />
      <TextBeat
        top="38%"
        fontSize={58}
        window={[0, 15, 55, 70]}
        lines={[
          [{ text: "Mirá qué fácil pueden hacer pedidos" }],
          [{ text: "tus clientes con ", }, { text: "Wapi", accent: true }, { text: " 👇" }],
        ]}
      />
      <TextBeat
        top="42%"
        fontSize={44}
        weight={700}
        window={[65, 80, 135, 150]}
        lines={[
          [{ text: "1. Te piden el catálogo" }],
          [{ text: "2. Les compartís el link de tu tienda Wapi" }],
        ]}
      />
    </AbsoluteFill>
  );
};
