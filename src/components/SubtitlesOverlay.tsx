import { interpolate, useCurrentFrame } from "remotion";
import { COLORS } from "../theme";

const FONT_STACK = '"Helvetica Neue", Helvetica, Arial, sans-serif';

export type Subtitle = { from: number; to: number; text: string };

const FADE = 6;

const SubtitleLine: React.FC<Subtitle> = ({ from, to, text }) => {
  const frame = useCurrentFrame();
  if (frame < from || frame > to) return null;
  const opacity =
    Math.min(interpolate(frame, [from, from + FADE], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), interpolate(frame, [to - FADE, to], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

  return (
    <div
      style={{
        position: "absolute",
        left: "6%",
        right: "6%",
        bottom: "16%",
        display: "flex",
        justifyContent: "center",
        opacity,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          background: "rgba(6,10,8,0.72)",
          borderRadius: 16,
          padding: "16px 26px",
          maxWidth: "100%",
        }}
      >
        <span
          style={{
            fontFamily: FONT_STACK,
            fontWeight: 700,
            fontSize: 34,
            lineHeight: 1.3,
            color: COLORS.white,
            textAlign: "center",
            display: "block",
          }}
        >
          {text}
        </span>
      </div>
    </div>
  );
};

/**
 * Burned-in captions for the whole ad — most social video is watched
 * muted, so this carries the voiceover's meaning without sound. Mounted
 * at the root (absolute frame numbers across the whole composition, not
 * scene-local) since it spans every scene.
 */
export const SubtitlesOverlay: React.FC<{ lines: Subtitle[] }> = ({ lines }) => {
  return (
    <>
      {lines.map((l, i) => (
        <SubtitleLine key={i} {...l} />
      ))}
    </>
  );
};
