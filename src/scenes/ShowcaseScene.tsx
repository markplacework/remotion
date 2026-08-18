import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { SHOWCASE_SEGMENT_FRAMES } from "../theme";

const IMAGES = [
  staticFile("/showcase/showcase-1-panaderia.png"),
  staticFile("/showcase/showcase-2-heladeria.png"),
  staticFile("/showcase/showcase-3-sandwiches.png"),
  staticFile("/showcase/showcase-4-burgerhouse.png"),
];

const SEGMENT = SHOWCASE_SEGMENT_FRAMES; // frames per image
const CROSSFADE = 10;

/**
 * A quick showcase carousel, one image at a time with a simple crossfade
 * between them — static images, no pan/zoom, right after the gancho and
 * before the real Wapi demo starts.
 */
export const ShowcaseScene: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      <Backdrop />
      {IMAGES.map((src, i) => {
        const start = i * SEGMENT;
        const end = start + SEGMENT;
        const opacity = interpolate(
          frame,
          [start - CROSSFADE, start, end, end + CROSSFADE],
          [0, 1, 1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );
        return (
          <AbsoluteFill key={src} style={{ opacity }}>
            <Img src={src} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};
