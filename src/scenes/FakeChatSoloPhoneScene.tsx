import { AbsoluteFill, staticFile } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { PhotoPhoneMockup } from "../components/PhotoPhoneMockup";
import { DarkChatLog } from "../components/DarkChatLog";
import { SOLO_BUBBLES } from "./FakeChatSoloScene";

// Trial: the same conversation (text + timing, untouched) composited
// into the real photographed phone mockup used elsewhere in the Wapi
// project instead of the full-bleed background image. Reuses the
// WhatsAppScene reference photo/measurements as-is — its header still
// shows that photo's own baked-in contact ("Martina Gómez"), since
// this is just a framing trial, not a redesign of the conversation.
const MOCKUP_SRC = staticFile("/mockups/whatsapp-dark-iphone-business.png");
const IMAGE_ASPECT = 1844 / 853;
const CHAT_AREA = { top: "15.5%", bottom: "13.6%", left: "9.1%", right: "9.7%" };

export const FakeChatSoloPhoneScene: React.FC = () => {
  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <PhotoPhoneMockup width={760} src={MOCKUP_SRC} imageAspect={IMAGE_ASPECT} chatArea={CHAT_AREA}>
          <DarkChatLog bubbles={SOLO_BUBBLES} dateLabel="Hoy" compact />
        </PhotoPhoneMockup>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
