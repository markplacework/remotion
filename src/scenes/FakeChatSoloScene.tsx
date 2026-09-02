import { AbsoluteFill, Img, staticFile } from "remotion";
import { DarkChatLog } from "../components/DarkChatLog";
import { BUBBLES } from "./FakeChatScene";

const BACKGROUND_SRC = staticFile("/fake-chat/background.png");

// "Only his messages" variant: same exact text and, critically, the
// same atFrame values as FakeChatScene — filtering the array doesn't
// touch timing at all, each remaining bubble still lands on the same
// frame it always did (that's what keeps it in sync with the song).
// The one visible difference is spacing: DarkChatLog gives consecutive
// same-sender bubbles a tighter gap than a sender change, and with
// hers gone every bubble here is now "same sender" as the one before
// it, so the vertical gaps between his lines shrink slightly — a
// layout detail, not a timing change.
const SOLO_BUBBLES = BUBBLES.filter((b) => b.from === "me");

export const FakeChatSoloScene: React.FC = () => {
  return (
    <AbsoluteFill>
      <Img
        src={BACKGROUND_SRC}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 620, transform: "scale(1.6)" }}>
          <DarkChatLog bubbles={SOLO_BUBBLES} dateLabel="Hoy" />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
