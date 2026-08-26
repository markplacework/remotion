import { AbsoluteFill } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { TextBeat } from "../components/TextBeat";

/**
 * Gancho only — the opening line of a 5-step walkthrough. Steps 1-2 are
 * now their own WhatsApp mockup beat (see CatalogRequestScene), and
 * steps 3-5 are StepCalloutsOverlay toasts synced to the scenes where
 * they actually happen. Text on its own here, no mockup in this scene
 * at all.
 */
export const CartHookScene: React.FC = () => {
  return (
    <AbsoluteFill>
      <Backdrop />
      <TextBeat
        top="40%"
        fontSize={58}
        window={[0, 15, 65, 85]}
        lines={[
          [{ text: "Mirá qué fácil pueden hacer pedidos" }],
          [{ text: "tus clientes con ", }, { text: "Wapi", accent: true }, { text: " 👇" }],
        ]}
      />
    </AbsoluteFill>
  );
};
