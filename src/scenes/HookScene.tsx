import { AbsoluteFill, staticFile } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { Camera } from "../components/Camera";
import { PhoneMockup } from "../components/PhoneMockup";
import { TextBeat } from "../components/TextBeat";
import { ACTIVE_BUSINESS } from "../business";
import { SCENE_HOOK } from "../theme";

const CATALOG_URL = staticFile(`/catalogo/${ACTIVE_BUSINESS.slug}.html`);

/**
 * Gancho + Solución. One fixed shot of the real published catalog, two
 * beats of copy in sequence. No driveFrame here on purpose — the portada
 * carousel is left to run on Wapi's own real behavior, untouched; if it
 * does a natural transition while this is on screen, that's fine.
 */
export const HookScene: React.FC = () => {
  return (
    <AbsoluteFill>
      <Backdrop />
      <Camera from={{ scale: 0.88, y: 14 }} to={{ scale: 0.95, y: 0 }} durationInFrames={SCENE_HOOK}>
        <PhoneMockup width={660} src={CATALOG_URL} sheenPosition={0.25} />
      </Camera>
      <TextBeat
        top={130}
        fontSize={74}
        window={[0, 15, 95, 115]}
        lines={[[{ text: "¿Vendés por " }, { text: "WhatsApp?", accent: true }], [{ text: "Recibí pedidos de forma" }], [{ text: "simple y ordenada." }]]}
      />
      <TextBeat
        bottom={200}
        fontSize={44}
        window={[120, 140, 180, 195]}
        lines={[[{ text: "Un solo link. Un catálogo " }, { text: "profesional", accent: true }, { text: "." }], [{ text: "Pedidos por WhatsApp." }]]}
      />
    </AbsoluteFill>
  );
};
