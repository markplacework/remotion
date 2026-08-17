import { Easing, interpolate, useCurrentFrame } from "remotion";

export type CameraKeyframe = {
  scale: number;
  x?: number; // px
  y?: number; // px
  rotateX?: number; // deg
  rotateY?: number; // deg
  rotateZ?: number; // deg
};

type Props = {
  from: CameraKeyframe;
  to: CameraKeyframe;
  durationInFrames: number;
  /** Delay, in frames, before the camera move starts. */
  delay?: number;
  perspective?: number;
  children: React.ReactNode;
};

const withDefaults = (k: CameraKeyframe): Required<CameraKeyframe> => ({
  scale: k.scale,
  x: k.x ?? 0,
  y: k.y ?? 0,
  rotateX: k.rotateX ?? 0,
  rotateY: k.rotateY ?? 0,
  rotateZ: k.rotateZ ?? 0,
});

/**
 * Wraps children in a slow, elegant camera move (dolly/pan/tilt) driven by
 * the current frame — a cinematic zoom+parallax, not a Ken Burns pan over a
 * flat image, since here the "shot" is a live-rendered mockup.
 */
export const Camera: React.FC<Props> = ({
  from,
  to,
  durationInFrames,
  delay = 0,
  perspective = 1600,
  children,
}) => {
  const frame = useCurrentFrame();
  const a = withDefaults(from);
  const b = withDefaults(to);

  const progress = interpolate(frame, [delay, delay + durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.45, 0, 0.15, 1),
  });

  const lerp = (x: number, y: number) => x + (y - x) * progress;

  const transform = `perspective(${perspective}px) rotateX(${lerp(
    a.rotateX,
    b.rotateX,
  )}deg) rotateY(${lerp(a.rotateY, b.rotateY)}deg) rotateZ(${lerp(
    a.rotateZ,
    b.rotateZ,
  )}deg) translate(${lerp(a.x, b.x)}px, ${lerp(a.y, b.y)}px) scale(${lerp(a.scale, b.scale)})`;

  return (
    <div style={{ width: "100%", height: "100%", transformStyle: "preserve-3d" }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform,
        }}
      >
        {children}
      </div>
    </div>
  );
};
