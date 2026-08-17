import { WAPI_VIEWPORT_WIDTH } from "../theme";
import { WapiIframe } from "./WapiIframe";

type Props = {
  width: number;
  src: string;
  onReady?: (win: Window) => void;
  driveFrame?: (win: Window, frame: number) => void | Promise<void>;
  /** 0-1 highlight sweep position for the glass reflection, e.g. driven by camera/frame. */
  sheenPosition?: number;
};

/**
 * A premium, realistic phone shell built entirely from CSS (gradients,
 * shadows, a highlight sweep) — no external mockup images. The real Wapi
 * page renders inside the screen cutout via WapiIframe, scaled to fit
 * exactly.
 */
export const PhoneMockup: React.FC<Props> = ({
  width,
  src,
  onReady,
  driveFrame,
  sheenPosition = 0.3,
}) => {
  const height = width * 2.162;
  const bezel = width * 0.032;
  const bodyRadius = width * 0.135;
  const screenRadius = bodyRadius - bezel * 0.55;
  const screenWidth = width - bezel * 2;
  const screenHeight = height - bezel * 2;
  const scale = screenWidth / WAPI_VIEWPORT_WIDTH;

  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        borderRadius: bodyRadius,
        background:
          "linear-gradient(155deg, #3a3d3f 0%, #101213 22%, #0a0b0c 55%, #232527 82%, #3a3d3f 100%)",
        boxShadow:
          "0 60px 120px -20px rgba(0,0,0,0.75), 0 20px 45px -10px rgba(0,0,0,0.55), inset 0 0 0 1.5px rgba(255,255,255,0.08)",
        padding: bezel,
      }}
    >
      {/* Screen */}
      <div
        style={{
          position: "relative",
          width: screenWidth,
          height: screenHeight,
          borderRadius: screenRadius,
          overflow: "hidden",
          background: "#000",
          boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.6)",
        }}
      >
        <WapiIframe src={src} scale={scale} onReady={onReady} driveFrame={driveFrame} />

        {/* Glass reflection sweep */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: `linear-gradient(115deg, rgba(255,255,255,0) ${
              sheenPosition * 100 - 22
            }%, rgba(255,255,255,0.16) ${sheenPosition * 100}%, rgba(255,255,255,0) ${
              sheenPosition * 100 + 22
            }%)`,
            mixBlendMode: "overlay",
          }}
        />

        {/* Subtle top/bottom vignette to sell depth against the screen glass */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            boxShadow: "inset 0 3px 10px rgba(0,0,0,0.35), inset 0 -3px 10px rgba(0,0,0,0.25)",
          }}
        />
      </div>

      {/* Side button details */}
      <div
        style={{
          position: "absolute",
          right: -2,
          top: height * 0.19,
          width: 3,
          height: height * 0.07,
          borderRadius: 2,
          background: "linear-gradient(#4a4d4f, #1a1c1d)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -2,
          top: height * 0.14,
          width: 3,
          height: height * 0.035,
          borderRadius: 2,
          background: "linear-gradient(#4a4d4f, #1a1c1d)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -2,
          top: height * 0.19,
          width: 3,
          height: height * 0.06,
          borderRadius: 2,
          background: "linear-gradient(#4a4d4f, #1a1c1d)",
        }}
      />
    </div>
  );
};
