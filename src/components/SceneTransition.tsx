import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";

type Props = {
  durationInFrames: number;
  transitionFrames: number;
  children: React.ReactNode;
};

/**
 * Fades a scene in/out (with a slight scale settle + a motion-blur whip at
 * the cut) instead of hard-cutting straight into dense real UI content —
 * two busy screenshots cross-dissolving tends to look muddy, so this fades
 * through black instead, which reads as a clean, deliberate edit.
 */
export const SceneTransition: React.FC<Props> = ({
  durationInFrames,
  transitionFrames,
  children,
}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [0, transitionFrames, durationInFrames - transitionFrames, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const scale = interpolate(frame, [0, transitionFrames], [0.965, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const blur = interpolate(
    frame,
    [0, transitionFrames * 0.6, durationInFrames - transitionFrames * 0.6, durationInFrames],
    [6, 0, 0, 6],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ opacity, transform: `scale(${scale})`, filter: `blur(${blur}px)` }}>
      {children}
    </AbsoluteFill>
  );
};
