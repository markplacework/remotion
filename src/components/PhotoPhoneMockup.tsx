import { Easing, Img, interpolate, useCurrentFrame } from "remotion";

// The reference iPhone photo is 853x1844 — close enough to the CSS
// PhoneMockup's own 1:2.162 ratio that both read the same size on
// screen at the same `width`.
const IMAGE_ASPECT = 1844 / 853;

// Percentage insets locating the blank chat area within the photo,
// measured directly from the source pixels (853x1844): header block
// (status bar + WhatsApp header, both baked into the photo) bottom
// edge at y≈310, input bar top edge at y≈1590, screen sides at
// x≈45/813. Re-measure these if the reference image is ever swapped.
const CHAT_AREA = { top: "16.8%", bottom: "13.8%", left: "5.3%", right: "4.7%" };

type Props = {
  width: number;
  src: string;
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
export const PhotoPhoneMockup: React.FC<Props> = ({ width, src, children }) => {
  const frame = useCurrentFrame();
  const height = width * IMAGE_ASPECT;

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
          top: CHAT_AREA.top,
          bottom: CHAT_AREA.bottom,
          left: CHAT_AREA.left,
          right: CHAT_AREA.right,
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
};
