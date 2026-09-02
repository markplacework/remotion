import { AbsoluteFill } from "remotion";
import { FakeChatSoloPhoneScene } from "./scenes/FakeChatSoloPhoneScene";
import { FAKE_CHAT_LAST_FRAME } from "./scenes/FakeChatScene";
import { VIDEO_WIDTH, VIDEO_HEIGHT, FPS } from "./theme";

// Framing trial for FakeChatSolo: same conversation/timing, inside the
// real photographed phone mockup instead of the full-bleed background.
export const FAKE_CHAT_SOLO_PHONE_FPS = FPS;
export const FAKE_CHAT_SOLO_PHONE_WIDTH = VIDEO_WIDTH;
export const FAKE_CHAT_SOLO_PHONE_HEIGHT = VIDEO_HEIGHT;
// Same ~5s-extended hold as the current FakeChatSolo.
export const FAKE_CHAT_SOLO_PHONE_DURATION = FAKE_CHAT_LAST_FRAME + 250;

export const FakeChatSoloPhone: React.FC = () => {
  return (
    <AbsoluteFill>
      <FakeChatSoloPhoneScene />
    </AbsoluteFill>
  );
};
