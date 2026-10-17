import { AbsoluteFill, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame } from "remotion";

export const B44_ZOCALOS_FPS = 24;
export const B44_ZOCALOS_DURATION = 8 * B44_ZOCALOS_FPS;
export const B44_ZOCALOS_WIDTH = 1080;
export const B44_ZOCALOS_HEIGHT = 1920;

const MARCAS_URL = staticFile("/b44/marcas.png");

// Both bands share the same height so they read as a matching pair. At 150px
// the top band only grazes the rim of the gold B44 sign and leaves its
// "VENTA MAYORISTA" lettering visible.
const BAND_HEIGHT = 150;

const GOLD = "linear-gradient(90deg, #8a6417 0%, #f5d27a 50%, #8a6417 100%)";

type StripProps = {
  src: string;
  // Natural size of the cropped strip image, used to keep its aspect ratio.
  naturalWidth: number;
  naturalHeight: number;
  contentHeight: number;
  // Pixels per frame; negative scrolls to the right.
  speed: number;
};

const Marquee: React.FC<StripProps> = ({ src, naturalWidth, naturalHeight, contentHeight, speed }) => {
  const frame = useCurrentFrame();
  const stripWidth = (naturalWidth / naturalHeight) * contentHeight;
  // Each tile ends with a divider so the seam between repeats matches the
  // dividers already drawn inside the artwork.
  const gap = 70;
  const tileWidth = stripWidth + gap;
  const copies = Math.ceil(B44_ZOCALOS_WIDTH / tileWidth) + 2;
  const offset = (((frame * speed) % tileWidth) + tileWidth) % tileWidth;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        height: "100%",
        transform: `translateX(${-offset}px)`,
      }}
    >
      {Array.from({ length: copies }).map((_, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
          <Img src={src} style={{ height: contentHeight, width: stripWidth, filter: "invert(1)" }} />
          <div style={{ width: gap, display: "flex", justifyContent: "center" }}>
            <div style={{ width: 4, height: contentHeight * 0.9, background: "#fff" }} />
          </div>
        </div>
      ))}
    </div>
  );
};

const Band: React.FC<{ position: "top" | "bottom"; children: React.ReactNode }> = ({ position, children }) => {
  const frame = useCurrentFrame();
  const slide = interpolate(frame, [0, 10], [BAND_HEIGHT, 0], { extrapolateRight: "clamp" });
  const isTop = position === "top";

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        height: BAND_HEIGHT,
        [isTop ? "top" : "bottom"]: 0,
        transform: `translateY(${isTop ? -slide : slide}px)`,
        background: "#0b0b0b",
        overflow: "hidden",
        boxShadow: "0 0 30px rgba(0,0,0,0.6)",
      }}
    >
      {children}
      <div style={{ position: "absolute", left: 0, right: 0, [isTop ? "bottom" : "top"]: 0, height: 5, background: GOLD }} />
    </div>
  );
};

export const B44Zocalos: React.FC<{ video: string }> = ({ video }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <OffthreadVideo src={staticFile(video)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      <Band position="top">
        <Marquee src={MARCAS_URL} naturalWidth={1972} naturalHeight={174} contentHeight={88} speed={4} />
      </Band>
      <Band position="bottom">
        <Marquee src={MARCAS_URL} naturalWidth={1972} naturalHeight={174} contentHeight={88} speed={-4} />
      </Band>
    </AbsoluteFill>
  );
};
