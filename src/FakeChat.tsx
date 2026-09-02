import { AbsoluteFill } from "remotion";
import { FakeChatScene, SONG_DURATION_FRAMES } from "./scenes/FakeChatScene";
import { VIDEO_WIDTH, VIDEO_HEIGHT, FPS } from "./theme";

// Standalone, unrelated to the Wapi business videos — a fictional,
// humorous WhatsApp conversation for a TikTok-style clip. Just the
// conversation area (no header, no contact photo/name), composited
// over the user's own dark WhatsApp-wallpaper background image.
export const FAKE_CHAT_FPS = FPS;
export const FAKE_CHAT_WIDTH = VIDEO_WIDTH;
export const FAKE_CHAT_HEIGHT = VIDEO_HEIGHT;
// No audio track — silent. Duration kept at the song's length (the
// message timing is still paced to it) in case audio comes back later.
export const FAKE_CHAT_DURATION = SONG_DURATION_FRAMES;

export const FakeChat: React.FC = () => {
  return (
    <AbsoluteFill>
      <FakeChatScene />
    </AbsoluteFill>
  );
};
