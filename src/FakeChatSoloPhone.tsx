import { AbsoluteFill, Audio } from "remotion";
import { FakeChatSoloPhoneScene } from "./scenes/FakeChatSoloPhoneScene";
import { SONG_URL, SONG_DURATION_FRAMES } from "./scenes/FakeChatScene";
import { VIDEO_WIDTH, VIDEO_HEIGHT, FPS } from "./theme";

// Framing trial for FakeChatSolo: same conversation/timing/song, inside
// the real photographed phone mockup instead of the full-bleed
// background.
export const FAKE_CHAT_SOLO_PHONE_FPS = FPS;
export const FAKE_CHAT_SOLO_PHONE_WIDTH = VIDEO_WIDTH;
export const FAKE_CHAT_SOLO_PHONE_HEIGHT = VIDEO_HEIGHT;
export const FAKE_CHAT_SOLO_PHONE_DURATION = SONG_DURATION_FRAMES;

export const FakeChatSoloPhone: React.FC = () => {
  return (
    <AbsoluteFill>
      <Audio src={SONG_URL} />
      <FakeChatSoloPhoneScene />
    </AbsoluteFill>
  );
};
