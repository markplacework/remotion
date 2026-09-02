import { AbsoluteFill } from "remotion";
import { FakeChatSoloScene } from "./scenes/FakeChatSoloScene";
import { FAKE_CHAT_LAST_FRAME } from "./scenes/FakeChatScene";
import { VIDEO_WIDTH, VIDEO_HEIGHT, FPS } from "./theme";

// "Only his messages" version of FakeChat — same background, same
// scale, same timing per message (his last line is still the last
// bubble chronologically either way, so FAKE_CHAT_LAST_FRAME is
// unchanged).
export const FAKE_CHAT_SOLO_FPS = FPS;
export const FAKE_CHAT_SOLO_WIDTH = VIDEO_WIDTH;
export const FAKE_CHAT_SOLO_HEIGHT = VIDEO_HEIGHT;
export const FAKE_CHAT_SOLO_DURATION = FAKE_CHAT_LAST_FRAME + 100;

export const FakeChatSolo: React.FC = () => {
  return (
    <AbsoluteFill>
      <FakeChatSoloScene />
    </AbsoluteFill>
  );
};
