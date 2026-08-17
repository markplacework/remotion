import { AbsoluteFill } from "remotion";

type Props = { edge: "top" | "bottom"; height?: number };

/**
 * A gradient panel behind caption text, so our overlay copy stays legible
 * no matter what part of the source photo the camera is panned over.
 */
export const CaptionScrim: React.FC<Props> = ({ edge, height = 680 }) => {
  const gradient =
    edge === "bottom"
      ? "linear-gradient(to top, rgba(3,4,3,0.94) 0%, rgba(3,4,3,0.6) 48%, rgba(3,4,3,0) 100%)"
      : "linear-gradient(to bottom, rgba(3,4,3,0.94) 0%, rgba(3,4,3,0.6) 48%, rgba(3,4,3,0) 100%)";

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          [edge]: 0,
          height,
          background: gradient,
        }}
      />
    </AbsoluteFill>
  );
};
