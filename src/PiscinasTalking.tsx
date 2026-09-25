import {
  AbsoluteFill,
  Audio,
  Img,
  OffthreadVideo,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// TikTok 9:16 talking-head piece for the pool-business WhatsApp campaign
// case. Exactly 6s. No music, no captions, no logos.
//
// Script (voiced by the person, not shown on screen):
// "250 consultas son las que obtuvimos con una campaña de mensajes a
// WhatsApp para un cliente que vende piscinas."
//
// Remotion can't synthesize the lip-synced performance itself. Generate
// that clip externally (Veo / Kling / HeyGen / Hedra) from
// public/piscinas/reference.png, drop it in as `talkingVideoSrc`, and this
// composition trims it to exactly 180 frames and adds the subtle
// WhatsApp / campaign / pool accents on top. Without a clip it falls back
// to the reference still with a slow push-in.
export const PISCINAS_FPS = 30;
export const PISCINAS_WIDTH = 1080;
export const PISCINAS_HEIGHT = 1920;
export const PISCINAS_DURATION = 6 * PISCINAS_FPS;

export type PiscinasTalkingProps = {
  // Path under public/, e.g. "piscinas/talking.mp4". Its own audio track
  // (the voice) is kept.
  talkingVideoSrc?: string;
  // Optional separate voice-over under public/, used when the clip is silent.
  voiceoverSrc?: string;
};

const GREEN = "#25D366";

// Generic speech-bubble glyph — deliberately not the WhatsApp logo.
const ChatGlyph: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="12" fill={GREEN} />
    <path
      d="M7 8.5h10a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-5.5L9 17.5V15.5H7a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1z"
      fill="#fff"
    />
  </svg>
);

// Short "new inquiry" toasts popping on the chest, between the phone and
// the pointing hand, kept below the face.
const TOASTS = [
  { from: 12, y: 1440 },
  { from: 42, y: 1360 },
  { from: 72, y: 1280 },
  { from: 102, y: 1400 },
  { from: 132, y: 1320 },
];

const Toast: React.FC<{ from: number; y: number }> = ({ from, y }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - from;
  if (local < 0 || local > 40) return null;
  const pop = spring({ frame: local, fps, config: { damping: 14 } });
  const opacity = interpolate(local, [0, 6, 30, 40], [0, 0.95, 0.95, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 360,
        top: y - local * 0.8,
        transform: `scale(${0.6 + pop * 0.4})`,
        transformOrigin: "left center",
        opacity,
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 20px 12px 12px",
        borderRadius: 999,
        background: "rgba(255,255,255,0.92)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
      }}
    >
      <ChatGlyph size={40} />
      <div style={{ width: 90, height: 10, borderRadius: 5, background: "#d8dde3" }} />
    </div>
  );
};

// Small campaign card with a rising line, near the laptop on the right.
const CampaignCard: React.FC = () => {
  const frame = useCurrentFrame();
  const appear = interpolate(frame, [20, 36], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const draw = interpolate(frame, [30, 150], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const points = [
    [0, 70], [30, 62], [60, 64], [90, 48], [120, 50], [150, 32], [180, 12],
  ];
  const d = points.map(([x, y], i) => `${i ? "L" : "M"}${x},${y}`).join(" ");
  return (
    <div
      style={{
        position: "absolute",
        right: 40,
        top: 1030,
        width: 230,
        padding: 18,
        borderRadius: 22,
        background: "rgba(255,255,255,0.9)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
        opacity: appear * 0.95,
        transform: `translateY(${(1 - appear) * 30}px)`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <ChatGlyph size={28} />
        <div style={{ width: 100, height: 9, borderRadius: 5, background: "#d8dde3" }} />
      </div>
      <svg width={194} height={80} viewBox="0 0 180 80">
        <path
          d={d}
          fill="none"
          stroke={GREEN}
          strokeWidth={5}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - draw}
        />
      </svg>
    </div>
  );
};

// Soft caustic shimmer over the pool on the left of the frame.
const PoolShimmer: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / PISCINAS_FPS;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen" }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 20 + i * 110 + Math.sin(t * 1.4 + i) * 25,
            top: 760 + i * 45 + Math.cos(t * 1.1 + i * 2) * 12,
            width: 200,
            height: 36,
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(255,255,255,0.35), transparent 70%)",
            filter: "blur(6px)",
            opacity: 0.5 + 0.5 * Math.sin(t * 2 + i),
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

export const PiscinasTalking: React.FC<PiscinasTalkingProps> = ({
  talkingVideoSrc,
  voiceoverSrc,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const zoom = interpolate(frame, [0, durationInFrames], [1, 1.06]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {talkingVideoSrc ? (
        <OffthreadVideo
          src={staticFile(talkingVideoSrc)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <Img
          src={staticFile("piscinas/reference.png")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${zoom})`,
            transformOrigin: "50% 45%",
          }}
        />
      )}
      <PoolShimmer />
      <CampaignCard />
      {TOASTS.map((t) => (
        <Toast key={t.from} from={t.from} y={t.y} />
      ))}
      {voiceoverSrc ? <Audio src={staticFile(voiceoverSrc)} /> : null}
    </AbsoluteFill>
  );
};
