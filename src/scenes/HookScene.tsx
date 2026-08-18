import { AbsoluteFill, staticFile } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { PhoneMockup, mockupHeightFor } from "../components/PhoneMockup";
import { TextBeat } from "../components/TextBeat";
import { ACTIVE_BUSINESS } from "../business";
import { VIDEO_HEIGHT } from "../theme";

const CATALOG_URL = staticFile(`/catalogo/${ACTIVE_BUSINESS.slug}.html`);

const PHONE_WIDTH = 560;
const PHONE_HEIGHT = mockupHeightFor(PHONE_WIDTH);
const PHONE_TOP = (VIDEO_HEIGHT - PHONE_HEIGHT) / 2;
const PHONE_BOTTOM = PHONE_TOP + PHONE_HEIGHT;

/**
 * Gancho + Solución. One fixed shot of the real published catalog (single
 * portada — no carousel, none of Wapi's own timers ever activate since
 * there's only one image in the data). Two beats of copy in sequence,
 * always clear of the mockup: gancho above it, solución below it.
 */
export const HookScene: React.FC = () => {
  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <PhoneMockup width={PHONE_WIDTH} src={CATALOG_URL} />
      </AbsoluteFill>
      <TextBeat
        top={90}
        fontSize={72}
        window={[0, 15, 95, 115]}
        lines={[[{ text: "¿Vendés por " }, { text: "WhatsApp?", accent: true }], [{ text: "Recibí pedidos de forma" }], [{ text: "simple y ordenada." }]]}
      />
      <TextBeat
        top={PHONE_BOTTOM + 90}
        fontSize={42}
        window={[120, 140, 180, 195]}
        lines={[[{ text: "Un solo link." }], [{ text: "Un catálogo " }, { text: "profesional", accent: true }, { text: "." }], [{ text: "Pedidos por WhatsApp." }]]}
      />
    </AbsoluteFill>
  );
};
