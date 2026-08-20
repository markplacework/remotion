import { AbsoluteFill, OffthreadVideo, staticFile } from "remotion";

const CHICA_URL = staticFile("/short-ad/chica.mp4");

/**
 * The presenter clip supplied for the short-cut ad — played back with its
 * own audio muted, since the ad's single audio track (voice + music) is
 * layered separately over the whole composition.
 */
export const ChicaScene: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <OffthreadVideo src={CHICA_URL} volume={0} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </AbsoluteFill>
  );
};
