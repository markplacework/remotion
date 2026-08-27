import { Easing, Img, interpolate, useCurrentFrame } from "remotion";

type ChatArea = { top: string; bottom: string; left: string; right: string };

// Default matches the first reference photo (853x1844): header block
// (status bar + WhatsApp header, both baked into the photo) bottom
// edge at y≈310, input bar top edge at y≈1590, screen sides at
// x≈45/813. Pass `imageAspect`/`chatArea` for a different photo —
// re-measure its pixels rather than reusing these blindly.
const DEFAULT_IMAGE_ASPECT = 1844 / 853;
const DEFAULT_CHAT_AREA: ChatArea = { top: "16.8%", bottom: "13.8%", left: "5.3%", right: "4.7%" };

type Props = {
  width: number;
  src: string;
  /** height / width of the source photo. */
  imageAspect?: number;
  /** Percentage insets locating the blank chat area within the photo. */
  chatArea?: ChatArea;
  children?: React.ReactNode;
};

/**
 * Uses a real photographed phone mockup image as-is (frame, status
 * bar, WhatsApp header and input bar all baked in) instead of the
 * hand-built CSS PhoneMockup — only the blank chat-log area gets
 * content composited on top, positioned to match the photo's own
 * pixels exactly. A trial alternative to PhoneMockup for scenes where
 * photographic realism matters more than live-driven content.
 */
export const PhotoPhoneMockup: React.FC<Props> = ({
  width,
  src,
  imageAspect = DEFAULT_IMAGE_ASPECT,
  chatArea = DEFAULT_CHAT_AREA,
  children,
}) => {
  const frame = useCurrentFrame();
  const height = width * imageAspect;

  const settle = interpolate(frame, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const entranceScale = interpolate(settle, [0, 1], [0.985, 1]);
  const entranceOpacity = interpolate(settle, [0, 1], [0, 1]);

  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        opacity: entranceOpacity,
        transform: `scale(${entranceScale})`,
      }}
    >
      <Img src={src} style={{ width: "100%", height: "100%", display: "block" }} />
      <div
        style={{
          position: "absolute",
          top: chatArea.top,
          bottom: chatArea.bottom,
          left: chatArea.left,
          right: chatArea.right,
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
};
