import { AbsoluteFill } from "remotion";
import { FakeChatSoloScene } from "./scenes/FakeChatSoloScene";
import { SONG_DURATION_FRAMES } from "./scenes/FakeChatScene";
import { VIDEO_WIDTH, VIDEO_HEIGHT, FPS } from "./theme";

// "Only his messages" version of FakeChat — same background, scale,
// and per-message timing. Silent, same as FakeChat.
export const FAKE_CHAT_SOLO_FPS = FPS;
export const FAKE_CHAT_SOLO_WIDTH = VIDEO_WIDTH;
export const FAKE_CHAT_SOLO_HEIGHT = VIDEO_HEIGHT;
export const FAKE_CHAT_SOLO_DURATION = SONG_DURATION_FRAMES;

export const FakeChatSolo: React.FC = () => {
  return (
    <AbsoluteFill>
      <FakeChatSoloScene />
    </AbsoluteFill>
  );
};
