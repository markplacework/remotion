import { Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { WAPI_VIEWPORT_HEIGHT, WAPI_VIEWPORT_WIDTH } from "../theme";
import { WapiIframe } from "./WapiIframe";

type Props = {
  /** Rendered width in px — height follows the mockup photo's own aspect ratio. */
  width: number;
  src: string;
  onReady?: (win: Window) => void;
  driveFrame?: (win: Window, frame: number) => void | Promise<void>;
};

// The client's own mockup photo (public/mockup/phone-frame.png), used
// exactly as provided — no generated/alternate device. 1024x1536 native.
const IMAGE_ASPECT = 1024 / 1536;
const MOCKUP_SRC = staticFile("/mockup/phone-frame.png");

// The screen cutout's rect within that photo, measured directly off the
// image (see the project notes for how — pixel sampling of where the
// bezel ends and the true display area begins), as fractions of the
// photo's own width/height so it scales cleanly at any render size.
const SCREEN_RECT = { left: 0.2002, top: 0.03255, width: 0.5957, height: 0.9199 };
// Rough match for the screen's own rounded corners, as a fraction of the
// cutout's width, so the real UI's square corners don't spill onto the
// photographed bezel curve.
const SCREEN_CORNER_RADIUS = 0.08;

/** Height, in px, of the mockup photo at a given rendered width. */
export const mockupHeightFor = (width: number) => width / IMAGE_ASPECT;

/**
 * The client's real mockup photo, used unmodified — same device, same
 * perspective, same proportions in every scene. Only an extremely subtle
 * settle-in at the start of each shot; once placed, it does not move,
 * zoom, or rotate. The real Wapi page renders into the screen cutout,
 * scaled to cover it (never stretched/distorted) and cropped to fit.
 */
export const PhoneMockup: React.FC<Props> = ({ width, src, onReady, driveFrame }) => {
  const frame = useCurrentFrame();
  const height = mockupHeightFor(width);

  const settle = interpolate(frame, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const entranceScale = interpolate(settle, [0, 1], [0.985, 1]);
  const entranceOpacity = interpolate(settle, [0, 1], [0, 1]);

  const screenLeft = width * SCREEN_RECT.left;
  const screenTop = height * SCREEN_RECT.top;
  const screenWidth = width * SCREEN_RECT.width;
  const screenHeight = height * SCREEN_RECT.height;

  // "Cover" the cutout (never letterbox, never stretch): scale by
  // whichever axis needs more, then center and crop the overflow.
  const scale = Math.max(screenWidth / WAPI_VIEWPORT_WIDTH, screenHeight / WAPI_VIEWPORT_HEIGHT);
  const contentWidth = WAPI_VIEWPORT_WIDTH * scale;
  const contentHeight = WAPI_VIEWPORT_HEIGHT * scale;

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
      {/* The photo's own screen area is an opaque photographed-off black
          rectangle, not a transparent cutout — so the frame image goes
          UNDERNEATH, and the real screen content paints over just the
          screen rect on top of it, leaving the rest of the photo (bezel,
          buttons, glass edge) visible around it. */}
      <Img
        src={MOCKUP_SRC}
        alt=""
        style={{ position: "absolute", inset: 0, width, height, pointerEvents: "none" }}
      />

      <div
        style={{
          position: "absolute",
          left: screenLeft,
          top: screenTop,
          width: screenWidth,
          height: screenHeight,
          overflow: "hidden",
          borderRadius: screenWidth * SCREEN_CORNER_RADIUS,
          background: "#000",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: (screenWidth - contentWidth) / 2,
            top: (screenHeight - contentHeight) / 2,
            width: contentWidth,
            height: contentHeight,
          }}
        >
          <WapiIframe src={src} scale={scale} onReady={onReady} driveFrame={driveFrame} />
        </div>
      </div>
    </div>
  );
};
