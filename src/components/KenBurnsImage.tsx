import { AbsoluteFill, Easing, Img, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

type Focal = { x: number; y: number };

type Props = {
  src: string;
  /** Natural pixel size of the source image. */
  naturalWidth: number;
  naturalHeight: number;
  from: Focal;
  to: Focal;
  zoomFrom: number;
  zoomTo: number;
  durationInFrames: number;
  brightness?: number;
  saturate?: number;
  entranceFrames?: number;
};

/**
 * Simulates a camera pan/zoom (Ken Burns) across a single flat source image,
 * so we never have to cut the original artwork into layers.
 *
 * Positions the image manually (rather than relying on CSS object-position)
 * so a given focal point (in % of the source image) always lands at the
 * center of the frame, at any zoom level.
 */
export const KenBurnsImage: React.FC<Props> = ({
  src,
  naturalWidth,
  naturalHeight,
  from,
  to,
  zoomFrom,
  zoomTo,
  durationInFrames,
  brightness = 1,
  saturate = 1,
  entranceFrames = 18,
}) => {
  const frame = useCurrentFrame();
  const { width: containerW, height: containerH } = useVideoConfig();

  const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.33, 0, 0.2, 1),
  });

  const focalX = interpolate(progress, [0, 1], [from.x, to.x]);
  const focalY = interpolate(progress, [0, 1], [from.y, to.y]);
  const zoom = interpolate(progress, [0, 1], [zoomFrom, zoomTo]);

  const entrance = interpolate(frame, [0, entranceFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const blur = interpolate(
    frame,
    [0, entranceFrames * 0.5, entranceFrames],
    [6, 2, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const coverScale = Math.max(
    containerW / naturalWidth,
    containerH / naturalHeight,
  );
  const totalScale = coverScale * zoom * (0.94 + entrance * 0.06);

  const scaledW = naturalWidth * totalScale;
  const scaledH = naturalHeight * totalScale;

  const rawX = containerW / 2 - (focalX / 100) * scaledW;
  const rawY = containerH / 2 - (focalY / 100) * scaledH;

  // Clamp so the image always fully covers the frame (no edge gaps).
  const translateX = Math.min(0, Math.max(containerW - scaledW, rawX));
  const translateY = Math.min(0, Math.max(containerH - scaledH, rawY));

  return (
    <AbsoluteFill style={{ overflow: "hidden", opacity: entrance }}>
      <Img
        src={src}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: scaledW,
          height: scaledH,
          maxWidth: "none",
          transform: `translate(${translateX}px, ${translateY}px)`,
          filter: `brightness(${brightness}) saturate(${saturate}) blur(${blur}px)`,
        }}
      />
    </AbsoluteFill>
  );
};
