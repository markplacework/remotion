import { AbsoluteFill } from "remotion";
import { FakeChatScene, FAKE_CHAT_LAST_FRAME } from "./scenes/FakeChatScene";
import { VIDEO_WIDTH, VIDEO_HEIGHT, FPS } from "./theme";

// Standalone, unrelated to the Wapi business videos — a fictional,
// humorous WhatsApp conversation for a TikTok-style clip. Just the
// conversation area (no header, no contact photo/name), composited
// over the user's own dark WhatsApp-wallpaper background image.
export const FAKE_CHAT_FPS = FPS;
export const FAKE_CHAT_WIDTH = VIDEO_WIDTH;
export const FAKE_CHAT_HEIGHT = VIDEO_HEIGHT;
// A longer hold after the last bubble settles, so the punchline lands
// before the clip ends.
export const FAKE_CHAT_DURATION = FAKE_CHAT_LAST_FRAME + 100;

export const FakeChat: React.FC = () => {
  return (
    <AbsoluteFill>
      <FakeChatScene />
    </AbsoluteFill>
  );
};
