import { Easing, interpolate, useCurrentFrame } from "remotion";
import { WAPI_VIEWPORT_WIDTH } from "../theme";
import { WapiIframe } from "./WapiIframe";

type Props = {
  width: number;
  /** A real Wapi page to load in an iframe (the normal case). Omit and
   * pass `children` instead for screen content that isn't a Wapi page at
   * all (e.g. a recreated third-party app UI like WhatsApp). */
  src?: string;
  onReady?: (win: Window) => void;
  driveFrame?: (win: Window, frame: number) => void | Promise<void>;
  /** 0-1 highlight sweep position for the glass reflection — a fixed
   * position per scene, not animated over time. */
  sheenPosition?: number;
  /** Frame finish — lets two phones on screen in different scenes (e.g.
   * customer vs. business owner) read as visually distinct devices
   * without ever putting text on the same scene as the mockup. */
  frameVariant?: "graphite" | "gold";
  /** Screen content rendered directly instead of the Wapi iframe. */
  children?: React.ReactNode;
};

/** Height, in px, of the mockup at a given rendered width. */
export const mockupHeightFor = (width: number) => width * 2.162;

const FRAME_GRADIENTS = {
  graphite: "linear-gradient(150deg, #626568 0%, #2e3032 10%, #141516 28%, #0a0a0b 50%, #18191b 68%, #45484a 86%, #64676a 100%)",
  gold: "linear-gradient(150deg, #9c8a68 0%, #6b5a3e 10%, #332a1c 28%, #1a150e 50%, #291f14 68%, #7c684a 86%, #9c8a68 100%)",
} as const;

/**
 * A premium, high-end flagship-style phone shell built entirely from CSS
 * (gradients, layered shadows, a fixed highlight sweep) — no external
 * mockup image. Completely static: one brief settle-in when a shot
 * starts, then it holds rigid — no zoom, pan, or rotation. The real Wapi
 * page renders inside the screen cutout, scaled to fit exactly.
 */
export const PhoneMockup: React.FC<Props> = ({
  width,
  src,
  onReady,
  driveFrame,
  sheenPosition = 0.3,
  frameVariant = "graphite",
  children,
}) => {
  const frame = useCurrentFrame();
  const height = mockupHeightFor(width);
  const bezel = width * 0.032;
  const bodyRadius = width * 0.125;
  const screenRadius = bodyRadius - bezel * 0.4;
  const screenWidth = width - bezel * 2;
  const screenHeight = height - bezel * 2;
  const scale = screenWidth / WAPI_VIEWPORT_WIDTH;

  const settle = interpolate(frame, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const entranceScale = interpolate(settle, [0, 1], [0.985, 1]);
  const entranceOpacity = interpolate(settle, [0, 1], [0, 1]);

  return (
    <div style={{ position: "relative", width, height, opacity: entranceOpacity, transform: `scale(${entranceScale})` }}>
      {/* Soft contact shadow grounding the phone against the backdrop */}
      <div
        style={{
          position: "absolute",
          left: "8%",
          right: "8%",
          bottom: -height * 0.05,
          height: height * 0.09,
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 72%)",
          filter: "blur(4px)",
        }}
      />

      {/* Titanium frame */}
      <div
        style={{
          position: "relative",
          width,
          height,
          borderRadius: bodyRadius,
          background: FRAME_GRADIENTS[frameVariant],
          boxShadow:
            "0 70px 130px -24px rgba(0,0,0,0.8), 0 24px 50px -12px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.16), inset 0 1px 1px rgba(255,255,255,0.4), inset 0 -1px 1px rgba(0,0,0,0.5)",
          padding: bezel,
        }}
      >
        {/* Inner bevel ring — separates frame from screen with a hairline of depth */}
        <div
          style={{
            position: "absolute",
            inset: bezel * 0.35,
            borderRadius: bodyRadius - bezel * 0.35,
            boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.65), inset 0 1px 1.5px rgba(0,0,0,0.5)",
            pointerEvents: "none",
          }}
        />

        {/* Screen */}
        <div
          style={{
            position: "relative",
            width: screenWidth,
            height: screenHeight,
            borderRadius: screenRadius,
            overflow: "hidden",
            background: "#000",
            boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.7)",
          }}
        >
          {src ? (
            <WapiIframe src={src} scale={scale} onReady={onReady} driveFrame={driveFrame} />
          ) : (
            <div style={{ width: "100%", height: "100%" }}>{children}</div>
          )}

          {/* Glass reflection sweep */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background: `linear-gradient(115deg, rgba(255,255,255,0) ${
                sheenPosition * 100 - 24
              }%, rgba(255,255,255,0.05) ${sheenPosition * 100 - 8}%, rgba(255,255,255,0.22) ${
                sheenPosition * 100
              }%, rgba(255,255,255,0.05) ${sheenPosition * 100 + 8}%, rgba(255,255,255,0) ${
                sheenPosition * 100 + 24
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

        {/* Right edge: power button + camera control */}
        <div
          style={{
            position: "absolute",
            right: -2.5,
            top: height * 0.165,
            width: 3.5,
            height: height * 0.052,
            borderRadius: 2,
            background: "linear-gradient(90deg, #1a1c1d, #5a5d60 45%, #1a1c1d)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: -2.5,
            top: height * 0.235,
            width: 3.5,
            height: height * 0.028,
            borderRadius: 2,
            background: "linear-gradient(90deg, #1a1c1d, #5a5d60 45%, #1a1c1d)",
          }}
        />

        {/* Left edge: action button + volume rocker */}
        <div
          style={{
            position: "absolute",
            left: -2.5,
            top: height * 0.1,
            width: 3.5,
            height: height * 0.022,
            borderRadius: 2,
            background: "linear-gradient(270deg, #1a1c1d, #5a5d60 45%, #1a1c1d)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -2.5,
            top: height * 0.15,
            width: 3.5,
            height: height * 0.045,
            borderRadius: 2,
            background: "linear-gradient(270deg, #1a1c1d, #5a5d60 45%, #1a1c1d)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -2.5,
            top: height * 0.205,
            width: 3.5,
            height: height * 0.045,
            borderRadius: 2,
            background: "linear-gradient(270deg, #1a1c1d, #5a5d60 45%, #1a1c1d)",
          }}
        />
      </div>
    </div>
  );
};
