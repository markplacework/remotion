import "@fontsource/poppins/700.css";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const FONT_STACK = 'Poppins, "Helvetica Neue", Helvetica, Arial, sans-serif';
const FADE = 8;
// A line stays up until the next one starts, but never longer than this
// — through an instrumental gap the screen clears instead of holding a
// line long after it was sung.
const MAX_HOLD_FRAMES = 6 * 30;

export type SungLine = { text: string; atFrame: number };

/** "(...)" parts are a backing-vocal echo: on their own line under the
 * main one, smaller and softer, so they never wrap mid-phrase. */
function renderText(text: string) {
  return text
    .split(/(\([^)]*\))/g)
    .filter(Boolean)
    .map((part, i) =>
      part.startsWith("(") ? (
        <span key={i} style={{ display: "block", opacity: 0.7, fontStyle: "italic", fontSize: "0.82em" }}>
          {part}
        </span>
      ) : (
        <span key={i}>{part.trim()}</span>
      ),
    );
}

const Line: React.FC<{ text: string; from: number; to: number; fontSize: number }> = ({ text, from, to, fontSize }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < from || frame >= to) return null;
  const enter = spring({ frame: frame - from, fps, config: { damping: 18, mass: 0.6 } });
  const fadeOut = interpolate(frame, [to - FADE, to], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        opacity: Math.min(enter, fadeOut),
        transform: `translateY(${interpolate(enter, [0, 1], [18, 0])}px)`,
        fontFamily: FONT_STACK,
        fontWeight: 700,
        fontSize,
        lineHeight: 1.2,
        textWrap: "balance",
        color: "#fff",
        // Soft dark halo so the white reads over both sky and trees.
        textShadow: "0 2px 6px rgba(0,0,0,0.75), 0 0 28px rgba(0,0,0,0.45)",
      }}
    >
      <div>{renderText(text)}</div>
    </div>
  );
};

/**
 * Song subtitles, one sung line at a time, centered in a fixed box. Each
 * line runs from its atFrame to the next line's (or MAX_HOLD_FRAMES,
 * whichever comes first).
 */
export const LyricSubtitles: React.FC<{
  lines: SungLine[];
  width: number;
  height: number;
  fontSize?: number;
}> = ({ lines, width, height, fontSize = 68 }) => {
  return (
    <div style={{ position: "relative", width, height }}>
      {lines.map((l, i) => {
        const next = lines[i + 1];
        const to = Math.min(next ? next.atFrame : Infinity, l.atFrame + MAX_HOLD_FRAMES);
        return <Line key={i} text={l.text} from={l.atFrame} to={to} fontSize={fontSize} />;
      })}
    </div>
  );
};
