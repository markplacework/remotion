import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT_STACK, WA, IconReadTicks, renderText, HoyPill, type DarkBubble } from "./DarkChatLog";

// Self-destruct/"burn" variant of DarkChatLog — same exact bubble look
// (reuses DarkChatLog's own color/font/text-rendering building blocks),
// but each bubble additionally disappears via a ragged, glowing burn
// front that eats it from the bottom up, in a top-to-bottom cascade
// across the conversation. Built for LyricSyncScene3 specifically
// (Telegram-style self-destruct look, requested to match the song's
// own "se prende fuego" lyrics) rather than added as an option on the
// shared DarkChatLog, so the normal chat scenes can't regress from it.

export type BurningBubble = DarkBubble & {
  /** Frame this bubble starts burning away. Fully visible (normal
   * DarkChatLog behavior) before this; fully gone burnDuration frames
   * after it. */
  burnStart: number;
};

const BURN_DURATION = 24;
// Mask is rendered at low resolution on purpose — scaled up via CSS it
// produces the soft, organic (not pixel-crisp) burnt edge a paper/cloth
// burn actually has, rather than a clean digital wipe.
const MASK_W = 48;
const MASK_H = 80;

// Deterministic (seeded) pseudo-noise — same bubble+column always
// produces the same jitter, so the mask is stable frame to frame
// instead of flickering, and reproducible across re-renders.
function noise(xNorm: number, seed: number) {
  return (
    Math.sin(xNorm * Math.PI * 2 * 2 + seed * 13.1) * 0.5 +
    Math.sin(xNorm * Math.PI * 2 * 5 + seed * 7.7) * 0.3 +
    Math.sin(xNorm * Math.PI * 2 * 11 + seed * 3.3) * 0.2
  );
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/** Builds a small white-on-transparent PNG data URL: opaque where the
 * bubble is still there, transparent where the fire has already eaten
 * through, with a jagged (noise-jittered) boundary and a soft
 * antialiased transition band instead of a hard edge. */
function buildBurnMaskDataUrl(seed: number, progress: number): string {
  const canvas = document.createElement("canvas");
  canvas.width = MASK_W;
  canvas.height = MASK_H;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(MASK_W, MASK_H);
  const band = 0.05; // soft-edge width, in normalized height units
  const noiseAmp = 0.14;
  // Push progress===1 past the top edge — by the soft-edge band AND
  // the worst-case noise trough — so the transition clears the canvas
  // entirely for every column instead of leaving tiny unburnt flecks
  // wherever the noise happened to dip (the transition band straddles
  // the boundary symmetrically, so a boundary landing exactly on or
  // just past the edge only gets partially erased).
  const reach = 1 + noiseAmp + 2 * band;

  for (let x = 0; x < MASK_W; x++) {
    const xNorm = x / (MASK_W - 1);
    const burntFraction = Math.min(reach, Math.max(0, progress * reach + noise(xNorm, seed) * noiseAmp));
    // Boundary y (normalized, 0 = top, 1 = bottom) above which pixels
    // are still visible — the burn eats upward from the bottom.
    const boundary = 1 - burntFraction;
    for (let y = 0; y < MASK_H; y++) {
      const yNorm = y / (MASK_H - 1);
      // 1 = fully visible (above the boundary), 0 = fully burnt away.
      const visible = 1 - smoothstep(boundary - band, boundary + band, yNorm);
      const alpha = Math.round(visible * 255);
      const i = (y * MASK_W + x) * 4;
      img.data[i] = 255;
      img.data[i + 1] = 255;
      img.data[i + 2] = 255;
      img.data[i + 3] = alpha;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL();
}

const BurningChatBubble: React.FC<
  BurningBubble & { marginTop: number; fontSize: number; seed: number }
> = ({ from, text, timestamp, atFrame, burnStart, marginTop, fontSize, seed }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - atFrame;
  const enter = spring({ frame: Math.max(0, local), fps, config: { damping: 15, mass: 0.6 } });
  const entryOpacity = local < 0 ? 0 : Math.min(enter, 1);
  const scale = interpolate(enter, [0, 1], [0.85, 1]);
  const translateY = interpolate(enter, [0, 1], [14, 0]);
  const outgoing = from === "me";

  const burnProgress = Math.min(1, Math.max(0, (frame - burnStart) / BURN_DURATION));
  const burning = burnProgress > 0;
  const maskUrl = burning ? buildBurnMaskDataUrl(seed, burnProgress) : null;
  // The glow band's own vertical position tracks the average burn
  // front (bottom -> top) so it rides right along the ragged edge.
  const glowBottomPercent = burnProgress * 100;
  // sin(progress * pi) rises from 0, peaks mid-burn, and returns to
  // exactly 0 at progress===1 — capping the input (as an earlier
  // version did) left a residual glow frozen in place forever after
  // the bubble had fully burnt away.
  const glowOpacity = burning ? Math.sin(burnProgress * Math.PI) : 0;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: outgoing ? "flex-end" : "flex-start",
        opacity: entryOpacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
        transformOrigin: outgoing ? "top right" : "top left",
        marginTop,
      }}
    >
      <div style={{ position: "relative", maxWidth: "82%" }}>
        <div
          style={{
            background: outgoing ? WA.bubbleOut : WA.bubbleIn,
            color: WA.text,
            borderRadius: outgoing ? "14px 3px 14px 14px" : "3px 14px 14px 14px",
            padding: "9px 12px 8px",
            WebkitMaskImage: maskUrl ? `url(${maskUrl})` : undefined,
            maskImage: maskUrl ? `url(${maskUrl})` : undefined,
            WebkitMaskSize: "100% 100%",
            maskSize: "100% 100%",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
          }}
        >
          <div style={{ fontFamily: FONT_STACK, fontSize, lineHeight: 1.32 }}>{renderText(text)}</div>
          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 4, marginTop: 2 }}>
            <span style={{ fontFamily: FONT_STACK, fontSize: fontSize * 0.68, color: WA.timestamp }}>
              {timestamp}
            </span>
            {outgoing && <IconReadTicks />}
          </div>
        </div>
        {burning && (
          <div
            style={{
              position: "absolute",
              left: -6,
              right: -6,
              bottom: `${glowBottomPercent}%`,
              height: 22,
              transform: "translateY(50%)",
              opacity: glowOpacity,
              background:
                "linear-gradient(to top, rgba(255,94,0,0.95), rgba(255,170,40,0.65) 45%, rgba(255,170,40,0) 100%)",
              filter: "blur(3px)",
              mixBlendMode: "screen",
              pointerEvents: "none",
            }}
          />
        )}
      </div>
    </div>
  );
};

export const BurningChatLog: React.FC<{
  bubbles: BurningBubble[];
  compact?: boolean;
  dateLabel?: string;
}> = ({ bubbles, compact = false, dateLabel = "HOY" }) => {
  const fontSize = compact ? 18 : 22;
  const senderChangeGap = compact ? 18 : 26;
  const sameSenderGap = compact ? 10 : 14;
  const hoyGap = compact ? 20 : 30;

  return (
    <div style={{ padding: "24px 12px 0" }}>
      <div style={{ marginBottom: hoyGap }}>
        <HoyPill label={dateLabel} />
      </div>
      {bubbles.map((b, i) => {
        const prev = bubbles[i - 1];
        const marginTop = i === 0 ? 0 : prev.from !== b.from ? senderChangeGap : sameSenderGap;
        return <BurningChatBubble key={i} {...b} marginTop={marginTop} fontSize={fontSize} seed={i} />;
      })}
    </div>
  );
};
