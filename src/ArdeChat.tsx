import { AbsoluteFill, Audio } from "remotion";
import { ArdeChatScene, ARDE_SONG_URL, ARDE_SONG_DURATION_FRAMES } from "./scenes/ArdeChatScene";
import { VIDEO_WIDTH, VIDEO_HEIGHT, FPS } from "./theme";

// FakeChatSolo's format applied to "Arde la ciudad": his messages are
// the lyrics, each landing on its sung timestamp, over the full song.
export const ARDE_CHAT_FPS = FPS;
export const ARDE_CHAT_WIDTH = VIDEO_WIDTH;
export const ARDE_CHAT_HEIGHT = VIDEO_HEIGHT;
export const ARDE_CHAT_DURATION = ARDE_SONG_DURATION_FRAMES;

export const ArdeChat: React.FC = () => {
  return (
    <AbsoluteFill>
      <Audio src={ARDE_SONG_URL} />
      <ArdeChatScene />
    </AbsoluteFill>
  );
};
