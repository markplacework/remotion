import { AbsoluteFill } from "remotion";
import { FakeChatSoloScene } from "./scenes/FakeChatSoloScene";
import { FAKE_CHAT_LAST_FRAME } from "./scenes/FakeChatScene";
import { VIDEO_WIDTH, VIDEO_HEIGHT, FPS } from "./theme";

// "Only his messages" version of FakeChat — same background, scale,
// and per-message timing (all untouched here). Silent, same as
// FakeChat, but holds ~5s longer after the last bubble (250f vs.
// FakeChat's 100f) per request.
export const FAKE_CHAT_SOLO_FPS = FPS;
export const FAKE_CHAT_SOLO_WIDTH = VIDEO_WIDTH;
export const FAKE_CHAT_SOLO_HEIGHT = VIDEO_HEIGHT;
export const FAKE_CHAT_SOLO_DURATION = FAKE_CHAT_LAST_FRAME + 250;

export const FakeChatSolo: React.FC = () => {
  return (
    <AbsoluteFill>
      <FakeChatSoloScene />
    </AbsoluteFill>
  );
};
