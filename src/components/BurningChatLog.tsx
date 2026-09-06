import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT_STACK, WA, IconReadTicks, renderText, HoyPill, type DarkBubble } from "./DarkChatLog";

// Self-destruct/"burn" variant of DarkChatLog — same exact bubble look
// (reuses DarkChatLog's own color/font/text pieces rather than
// duplicating them), but each bubble additionally disappears via an
// actual animated flame — a flickering, jagged fire licking up from a
// ragged burnt edge, plus rising embers — eating it from the bottom
// up, cascading top-to-bottom across the conversation. Built for
// LyricSyncScene3 specifically (Telegram-style self-destruct look, to
// match the song's own "se prende fuego" lyrics) rather than added as
// an option on the shared DarkChatLog, so the normal chat scenes can't
// regress from it.
//
// v2: the first version was just a blurred gradient bar riding a noise
// mask — reads as "wipe with an orange smear," not fire. This version
// draws an actual flame layer (per-column flickering flame tongues,
// hot-core-to-transparent-tip gradient, animated frame to frame) plus
// drifting ember particles on top of a jaggier burn mask.

export type BurningBubble = DarkBubble & {
  /** Frame this bubble starts burning away. Fully visible (normal
   * DarkChatLog behavior) before this; fully gone burnDuration frames
   * after it. */
  burnStart: number;
};

const BURN_DURATION = 30;
// Mask/flame canvases are rendered at low resolution on purpose —
// scaled up via CSS it produces the soft, organic (not pixel-crisp)
// burnt edge a paper/cloth burn actually has, rather than a clean
// digital wipe.
const MASK_W = 64;
const MASK_H = 96;
const BAND = 0.045; // soft-edge width, in normalized height units
const NOISE_AMP = 0.16;
// How far progress must overshoot 1 for every column's mask to fully
// clear — the soft-edge band plus the worst-case noise trough — so no
// permanent fleck is left wherever the boundary lands right on (or
// just past) the canvas edge.
const REACH = 1 + NOISE_AMP + 2 * BAND;

// Deterministic (seeded) pseudo-noise, 4 octaves — same bubble+column
// always produces the same jitter, so the mask is stable frame to
// frame instead of flickering randomly, and reproducible across
// re-renders. The extra high-frequency octave vs. a plain 3-octave
// noise gives the edge a charred, torn-paper irregularity instead of
// a smooth wave.
function edgeNoise(xNorm: number, seed: number) {
  return (
    Math.sin(xNorm * Math.PI * 2 * 2 + seed * 13.1) * 0.45 +
    Math.sin(xNorm * Math.PI * 2 * 5 + seed * 7.7) * 0.3 +
    Math.sin(xNorm * Math.PI * 2 * 11 + seed * 3.3) * 0.15 +
    Math.sin(xNorm * Math.PI * 2 * 23 + seed * 19.7) * 0.1
  );
}

// Fast time-varying flicker (independent of the static edge jaggedness
// above) that animates the flame's height/intensity frame to frame.
function flicker(xNorm: number, seed: number, frame: number) {
  return (
    Math.sin(frame * 0.6 + xNorm * 37 + seed * 5.1) * 0.5 +
    Math.sin(frame * 1.3 + xNorm * 13 + seed * 2.2) * 0.3 +
    Math.sin(frame * 0.22 + xNorm * 71 + seed * 8.8) * 0.2
  );
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/** Normalized (0 = top, 1 = bottom) y above which the column is still
 * unburnt, for a given column and burn progress. Can run outside
 * [0, 1] on purpose (see REACH) so the caller's soft-edge math clears
 * fully at the extremes instead of leaving a residual sliver. */
function burntBoundary(xNorm: number, seed: number, progress: number) {
  const burntFraction = Math.min(REACH, Math.max(0, progress * REACH + edgeNoise(xNorm, seed) * NOISE_AMP));
  return 1 - burntFraction;
}

/** Small white-on-transparent PNG: opaque where the bubble is still
 * there, transparent where the fire has already eaten through, with a
 * jagged boundary and a soft antialiased transition band. */
function buildBurnMaskDataUrl(seed: number, progress: number): string {
  const canvas = document.createElement("canvas");
  canvas.width = MASK_W;
  canvas.height = MASK_H;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(MASK_W, MASK_H);

  for (let x = 0; x < MASK_W; x++) {
    const xNorm = x / (MASK_W - 1);
    const boundary = burntBoundary(xNorm, seed, progress);
    for (let y = 0; y < MASK_H; y++) {
      const yNorm = y / (MASK_H - 1);
      const visible = 1 - smoothstep(boundary - BAND, boundary + BAND, yNorm);
      const i = (y * MASK_W + x) * 4;
      img.data[i] = 255;
      img.data[i + 1] = 255;
      img.data[i + 2] = 255;
      img.data[i + 3] = Math.round(visible * 255);
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL();
}

/** Small flame-colored PNG (transparent background, additive-blended
 * on top of the masked bubble): a flickering, hot-core-to-transparent
 * flame tongue riding right along the burnt edge of every column. */
function buildFlameDataUrl(seed: number, progress: number, frame: number): string | null {
  if (progress <= 0 || progress >= 1) return null;
  const canvas = document.createElement("canvas");
  canvas.width = MASK_W;
  canvas.height = MASK_H;
  const ctx = canvas.getContext("2d")!;
  ctx.globalCompositeOperation = "lighter";

  const baseHeight = MASK_H * 0.22;
  for (let x = 0; x < MASK_W; x++) {
    const xNorm = x / (MASK_W - 1);
    const boundary = burntBoundary(xNorm, seed, progress);
    if (boundary >= 1.05 || boundary <= -0.05) continue; // fully unburnt or fully gone: no flame to draw
    const boundaryY = boundary * (MASK_H - 1);
    const f = 0.55 + 0.45 * flicker(xNorm, seed, frame); // ~[-0.35, 1]
    const flameH = Math.max(2, baseHeight * Math.max(0.15, f));
    const topY = boundaryY - flameH;

    const gradient = ctx.createLinearGradient(0, boundaryY, 0, topY);
    gradient.addColorStop(0, "rgba(255,244,214,0.95)");
    gradient.addColorStop(0.35, "rgba(255,163,44,0.9)");
    gradient.addColorStop(0.7, "rgba(255,80,20,0.55)");
    gradient.addColorStop(1, "rgba(255,60,0,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(x - 0.5, topY, 2, boundaryY - topY);
  }
  ctx.globalCompositeOperation = "source-over";
  return canvas.toDataURL();
}

const EMBER_COUNT = 7;

/** Small drifting spark divs — spawned at even intervals across the
 * burn, each rising from that moment's burn line and fading out — laid
 * on top of the flame layer for a bit of floating-ash production
 * value. Deterministic per (seed, k, progress), no per-frame RNG. */
function EmberParticles({ seed, progress }: { seed: number; progress: number }) {
  if (progress <= 0 || progress >= 1) return null;
  const embers = [];
  for (let k = 0; k < EMBER_COUNT; k++) {
    const birth = k / EMBER_COUNT;
    const life = 0.4; // fraction of total progress span this ember lives for
    const age = progress - birth;
    if (age < 0 || age > life) continue;
    const t = age / life; // 0 -> 1 over this ember's life
    const xNorm = (k + 0.5) / EMBER_COUNT + 0.06 * Math.sin(seed * 4.1 + k * 2.7);
    // Spawn right at that moment's burn line (bubble-space, 0 = top,
    // 1 = bottom), then drift up and sideways in plain pixels —
    // translateY is free to push the dot above the bubble's own box
    // since nothing here clips overflow.
    const boundary = Math.min(1, Math.max(0, burntBoundary(xNorm, seed, birth)));
    const driftX = Math.sin(seed * 2.3 + k * 5.5 + t * 3) * 6;
    const riseY = t * 34;
    const opacity = Math.sin(t * Math.PI); // fades in then out
    const size = 2.5 + 2 * Math.abs(Math.sin(seed * 6.1 + k));
    embers.push(
      <div
        key={k}
        style={{
          position: "absolute",
          left: `${xNorm * 100}%`,
          top: `${boundary * 100}%`,
          width: size,
          height: size,
          borderRadius: "50%",
          background: "rgba(255,214,140,0.95)",
          boxShadow: "0 0 6px 1px rgba(255,140,40,0.85)",
          opacity,
          transform: `translate(${driftX}px, ${-riseY}px)`,
          pointerEvents: "none",
        }}
      />,
    );
  }
  return <>{embers}</>;
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
  const flameUrl = burning ? buildFlameDataUrl(seed, burnProgress, frame) : null;

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
        {flameUrl && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${flameUrl})`,
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
              mixBlendMode: "screen",
              pointerEvents: "none",
            }}
          />
        )}
        {burning && (
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <EmberParticles seed={seed} progress={burnProgress} />
          </div>
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
