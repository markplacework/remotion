import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT_STACK, WA, IconReadTicks, renderText, HoyPill, type DarkBubble } from "./DarkChatLog";

// Self-destruct/"burn" variant of DarkChatLog — same exact bubble look
// (reuses DarkChatLog's own color/font/text pieces rather than
// duplicating them), but each bubble additionally disappears via an
// actual animated fire — a turbulent, licking flame body (not a thin
// line) rising from a ragged burnt edge, with embers and a glow bloom
// — cascading top-to-bottom across the conversation. Built for
// LyricSyncScene3 specifically (Telegram-style self-destruct look, to
// match the song's own "se prende fuego" lyrics) rather than added as
// an option on the shared DarkChatLog, so the normal chat scenes can't
// regress from it.
//
// v3: v1 was a blurred gradient bar (an orange smear, no fire). v2 drew
// a flame per column but each one was still just a single vertical
// gradient sliver — same height, same shape, just flickering size —
// which reads as a repeated icon rather than fire. This version fills
// a whole 2D region above the burn line with fractal (multi-octave)
// noise that scrolls upward over time — real flame turbulence — and
// runs it through a black -> red -> orange -> yellow -> white heat
// ramp, so the flame has body, curls, and dark gaps instead of a flat
// silhouette. A blurred duplicate of the same texture behind it adds
// the soft light-bloom real fire casts on its surroundings.

export type BurningBubble = DarkBubble & {
  /** Frame this bubble starts burning away. Fully visible (normal
   * DarkChatLog behavior) before this; fully gone burnDuration frames
   * after it. */
  burnStart: number;
};

const BURN_DURATION = 34;
// The edge/mask canvas is rendered at low resolution on purpose —
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

// The flame canvas covers extra height above the bubble itself (as a
// fraction of the bubble's own height) so tall flame licks have room
// to rise past the bubble's top edge instead of getting clipped.
const FLAME_EXT = 0.7;
const FLAME_W = 56;
const FLAME_H = 130;
// How far above the burn line (in bubble-height units) the flame
// reaches before fully fading to nothing.
const FLAME_REACH = 0.6;

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

// Fractal (multi-octave) trig noise, 2D — stands in for Perlin/simplex
// noise without pulling in a library. Four octaves of sine waves at
// increasing frequency/decreasing amplitude give it the same "rough at
// every scale" look real turbulence has, and it's a pure function of
// (x, y) so it's trivially reproducible frame to frame.
function fbm2(x: number, y: number, seed: number) {
  let sum = 0;
  sum += Math.sin(x * 2.1 + y * 3.3 + seed * 1.7) * 0.5;
  sum += Math.sin(x * 4.7 - y * 4.1 + seed * 3.1) * 0.28;
  sum += Math.sin(x * 9.3 + y * 8.2 + seed * 5.9) * 0.15;
  sum += Math.sin(x * 17.9 - y * 14.6 + seed * 9.3) * 0.09;
  return sum; // roughly [-1, 1]
}

// Fire heat-ramp: 0 -> nothing, rising through deep red, orange,
// yellow, to a white-hot core at 1. Returns [r, g, b, a].
const FIRE_STOPS: [number, number, number, number, number][] = [
  [0.0, 20, 0, 0, 0],
  [0.16, 120, 12, 0, 130],
  [0.36, 200, 50, 0, 195],
  [0.58, 255, 120, 10, 225],
  [0.78, 255, 190, 60, 245],
  [1.0, 255, 250, 220, 255],
];
function fireColor(t: number): [number, number, number, number] {
  const c = Math.max(0, Math.min(1, t));
  for (let i = 1; i < FIRE_STOPS.length; i++) {
    const [p0, r0, g0, b0, a0] = FIRE_STOPS[i - 1];
    const [p1, r1, g1, b1, a1] = FIRE_STOPS[i];
    if (c <= p1) {
      const k = (c - p0) / (p1 - p0 || 1);
      return [r0 + (r1 - r0) * k, g0 + (g1 - g0) * k, b0 + (b1 - b0) * k, a0 + (a1 - a0) * k];
    }
  }
  return [255, 250, 220, 255];
}

/** A turbulent flame texture (transparent background) covering the
 * bubble plus extra height above it: per-pixel fractal noise scrolling
 * upward over time, shaped by a falloff above the current (jagged)
 * burn line and run through the fire heat ramp — real flame body and
 * curl instead of a uniform silhouette. */
function buildFlameDataUrl(seed: number, progress: number, frame: number): string | null {
  if (progress <= 0 || progress >= 1) return null;
  const canvas = document.createElement("canvas");
  canvas.width = FLAME_W;
  canvas.height = FLAME_H;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(FLAME_W, FLAME_H);
  const t = frame * 0.18;

  for (let x = 0; x < FLAME_W; x++) {
    const xNorm = x / (FLAME_W - 1);
    const boundary = burntBoundary(xNorm, seed, progress);
    for (let y = 0; y < FLAME_H; y++) {
      // Map this pixel row to bubble-space y (0 = bubble top, 1 =
      // bubble bottom, negative = above the bubble).
      const yNorm = -FLAME_EXT + (y / (FLAME_H - 1)) * (1 + FLAME_EXT);
      const heightAbove = boundary - yNorm; // > 0 means above the burn line
      const i = (y * FLAME_W + x) * 4;
      if (heightAbove <= -0.03 || heightAbove > FLAME_REACH + 0.05) {
        img.data[i + 3] = 0;
        continue;
      }
      const reach = Math.max(0, Math.min(1, heightAbove / FLAME_REACH));
      // Turbulence scrolls upward (y decreasing over time) and drifts
      // slightly sideways so neighboring columns don't flicker in
      // lockstep.
      const n = fbm2(xNorm * 5 + Math.sin(t * 0.3 + seed) * 0.4, yNorm * 7 - t, seed);
      const turbulence = 0.5 + 0.5 * n; // [0, 1]
      // Hottest near the burn line, fading with height, sharpened by
      // turbulence so it curls/breaks up instead of a flat gradient.
      const falloff = Math.pow(1 - reach, 1.6);
      const heat = Math.max(0, falloff * (0.55 + 0.75 * turbulence) - reach * 0.15);
      const [r, g, b, a] = fireColor(heat);
      img.data[i] = r;
      img.data[i + 1] = g;
      img.data[i + 2] = b;
      img.data[i + 3] = a;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL();
}

const EMBER_COUNT = 9;

/** Small drifting spark divs — spawned at even intervals across the
 * burn, each rising from that moment's burn line and fading out — laid
 * on top of the flame layer for a bit of floating-ash production
 * value. Deterministic per (seed, k, progress), no per-frame RNG. */
function EmberParticles({ seed, progress }: { seed: number; progress: number }) {
  if (progress <= 0 || progress >= 1) return null;
  const embers = [];
  for (let k = 0; k < EMBER_COUNT; k++) {
    const birth = k / EMBER_COUNT;
    const life = 0.45; // fraction of total progress span this ember lives for
    const age = progress - birth;
    if (age < 0 || age > life) continue;
    const t = age / life; // 0 -> 1 over this ember's life
    const xNorm = (k + 0.5) / EMBER_COUNT + 0.06 * Math.sin(seed * 4.1 + k * 2.7);
    // Spawn right at that moment's burn line (bubble-space, 0 = top,
    // 1 = bottom), then drift up and sideways in plain pixels —
    // translateY is free to push the dot above the bubble's own box
    // since nothing here clips overflow.
    const boundary = Math.min(1, Math.max(0, burntBoundary(xNorm, seed, birth)));
    const driftX = Math.sin(seed * 2.3 + k * 5.5 + t * 3) * 8 + t * 10 * Math.sign(Math.sin(seed + k));
    const riseY = 6 + t * t * 46;
    const opacity = Math.sin(Math.min(1, t * 1.3) * Math.PI * 0.85);
    const size = 2.5 + 2.4 * Math.abs(Math.sin(seed * 6.1 + k));
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
          background: "rgba(255,224,160,0.95)",
          boxShadow: "0 0 7px 1.5px rgba(255,130,30,0.9)",
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
  // A quick bright flash right as the bubble ignites — sells the
  // "catches fire" moment instead of the flame just materializing.
  const ignitionAge = frame - burnStart;
  const ignitionFlash = ignitionAge >= 0 && ignitionAge < 8 ? (1 - ignitionAge / 8) * 0.8 : 0;

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
          <>
            {/* Soft blurred duplicate first, for the light-bloom real
                fire casts on its surroundings, then the sharp flame on
                top of it. Both additive so they light up the dark
                wallpaper instead of just sitting on top of it. */}
            <div
              style={{
                position: "absolute",
                top: `${-FLAME_EXT * 100}%`,
                left: "-15%",
                right: "-15%",
                bottom: 0,
                backgroundImage: `url(${flameUrl})`,
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat",
                filter: "blur(9px) saturate(1.3)",
                opacity: 0.8,
                mixBlendMode: "screen",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: `${-FLAME_EXT * 100}%`,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `url(${flameUrl})`,
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat",
                mixBlendMode: "screen",
                pointerEvents: "none",
              }}
            />
          </>
        )}
        {burning && (
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <EmberParticles seed={seed} progress={burnProgress} />
          </div>
        )}
        {ignitionFlash > 0 && (
          <div
            style={{
              position: "absolute",
              inset: "-20%",
              borderRadius: "50%",
              background: "radial-gradient(closest-side, rgba(255,238,190,0.9), rgba(255,150,40,0) 70%)",
              opacity: ignitionFlash,
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
