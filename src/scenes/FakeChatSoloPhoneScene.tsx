import { AbsoluteFill, staticFile } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { PhotoPhoneMockup } from "../components/PhotoPhoneMockup";
import { DarkChatLog } from "../components/DarkChatLog";
import { SOLO_BUBBLES } from "./FakeChatSoloScene";

// Same conversation (text + timing, untouched) composited into a real
// photographed phone mockup — this one a blank "Desconocido" chat
// (generic contact icon, no name/photo), with WhatsApp's own real
// encryption notice + first "Hoy" divider already baked into the
// photo. Measured directly from this photo's own pixels: screen sides
// x≈49/803 (of 853), the baked-in system-message block (header +
// date + encryption notice + its own "Hoy" pill) ends around y≈630,
// input bar starts around y≈1575 (of 1844) — chatArea.top starts
// right after that block so our bubbles continue naturally below it,
// and DarkChatLog's own date pill is turned off (showDateLabel) since
// the photo already has one.
const MOCKUP_SRC = staticFile("/mockups/whatsapp-dark-iphone-blank.png");
const IMAGE_ASPECT = 1844 / 853;
const CHAT_AREA = { top: "34.2%", bottom: "14.6%", left: "5.8%", right: "5.9%" };

export const FakeChatSoloPhoneScene: React.FC = () => {
  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <PhotoPhoneMockup width={760} src={MOCKUP_SRC} imageAspect={IMAGE_ASPECT} chatArea={CHAT_AREA}>
          <DarkChatLog bubbles={SOLO_BUBBLES} showDateLabel={false} compact />
        </PhotoPhoneMockup>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
