import { AbsoluteFill, Audio } from "remotion";
import { FakeChatScene, SONG_URL, SONG_DURATION_FRAMES } from "./scenes/FakeChatScene";
import { VIDEO_WIDTH, VIDEO_HEIGHT, FPS } from "./theme";

// Standalone, unrelated to the Wapi business videos — a fictional,
// humorous WhatsApp conversation for a TikTok-style clip. Just the
// conversation area (no header, no contact photo/name), composited
// over the user's own dark WhatsApp-wallpaper background image.
export const FAKE_CHAT_FPS = FPS;
export const FAKE_CHAT_WIDTH = VIDEO_WIDTH;
export const FAKE_CHAT_HEIGHT = VIDEO_HEIGHT;
// Runs the full length of the song rather than a fixed hold after the
// last bubble, so the track always plays out completely.
export const FAKE_CHAT_DURATION = SONG_DURATION_FRAMES;

export const FakeChat: React.FC = () => {
  return (
    <AbsoluteFill>
      <Audio src={SONG_URL} />
      <FakeChatScene />
    </AbsoluteFill>
  );
};
