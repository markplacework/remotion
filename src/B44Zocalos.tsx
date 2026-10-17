import { AbsoluteFill, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame } from "remotion";

export const B44_ZOCALOS_FPS = 24;
export const B44_ZOCALOS_DURATION = 8 * B44_ZOCALOS_FPS;
export const B44_ZOCALOS_WIDTH = 1080;
export const B44_ZOCALOS_HEIGHT = 1920;

const VIDEO_URL = staticFile("/b44/video.mp4");
const MARCAS_URL = staticFile("/b44/marcas.png");

const BAND_HEIGHT = 170;
// The clip is nudged down so the top band only covers the ceiling and
// never clips the gold B44 sign; what is lost at the bottom is jeans.
const VIDEO_OFFSET = 70;

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

const Band: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const slide = interpolate(frame, [0, 10], [BAND_HEIGHT, 0], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        height: BAND_HEIGHT,
        top: 0,
        transform: `translateY(${-slide}px)`,
        background: "#0b0b0b",
        overflow: "hidden",
        boxShadow: "0 0 30px rgba(0,0,0,0.6)",
      }}
    >
      {children}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 5, background: GOLD }} />
    </div>
  );
};

export const B44Zocalos: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <OffthreadVideo
        src={VIDEO_URL}
        style={{ position: "absolute", top: VIDEO_OFFSET, width: "100%", height: "100%", objectFit: "cover" }}
      />
      <Band>
        <Marquee src={MARCAS_URL} naturalWidth={1972} naturalHeight={174} contentHeight={100} speed={4} />
      </Band>
    </AbsoluteFill>
  );
};
