import { AbsoluteFill } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { TextBeat } from "../components/TextBeat";

/**
 * Gancho only, same treatment as the main video's IntroScene — text on
 * its own, no mockup in this scene at all.
 */
export const CartHookScene: React.FC = () => {
  return (
    <AbsoluteFill>
      <Backdrop />
      <TextBeat
        top="40%"
        fontSize={72}
        window={[0, 15, 92, 112]}
        lines={[
          [{ text: "Tu cliente arma el pedido" }],
          [{ text: "y vos lo recibís al toque," }],
          [{ text: "directo por ", }, { text: "WhatsApp.", accent: true }],
        ]}
      />
    </AbsoluteFill>
  );
};
