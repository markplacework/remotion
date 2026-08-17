import { useEffect, useRef, useState } from "react";
import { continueRender, delayRender, IFrame, useCurrentFrame } from "remotion";
import { WAPI_VIEWPORT_HEIGHT, WAPI_VIEWPORT_WIDTH } from "../theme";

type Props = {
  src: string;
  /** How much to scale the fixed WAPI_VIEWPORT_WIDTH/HEIGHT iframe up/down
   * to fit wherever it's mounted (inside a device mockup screen, etc). */
  scale: number;
  /** Called once, right after the iframe finishes loading. */
  onReady?: (win: Window) => void;
  /**
   * Called on every frame once ready, so the real Wapi page can be driven
   * into the exact state that frame needs. Must be safe to call repeatedly
   * and out of order (Remotion may render frames non-sequentially).
   */
  driveFrame?: (win: Window, frame: number) => void | Promise<void>;
};

/**
 * Hosts one of the real (patched, offline) Wapi pages at its native mobile
 * viewport size, scaled via CSS transform so parent components can size it
 * freely (inside a device mockup, etc) without the page itself ever
 * knowing it isn't at its normal size.
 */
export const WapiIframe: React.FC<Props> = ({ src, scale, onReady, driveFrame }) => {
  const frame = useCurrentFrame();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);

  const handleLoad = () => {
    const win = iframeRef.current?.contentWindow;
    if (win) onReady?.(win);
    setReady(true);
  };

  useEffect(() => {
    if (!ready || !driveFrame) return;
    const win = iframeRef.current?.contentWindow;
    if (!win) return;

    const handle = delayRender(`Driving ${src} to frame ${frame}`);
    Promise.resolve(driveFrame(win, frame))
      .then(async () => {
        // Setting an <img src> (incl. data: URLs from FileReader) doesn't
        // paint synchronously — wait for decode so screenshots never catch
        // a half-loaded image.
        const images = Array.from(win.document.images);
        await Promise.all(images.map((img) => img.decode().catch(() => undefined)));
      })
      .finally(() => continueRender(handle));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, frame]);

  return (
    <div style={{ width: "100%", height: "100%", overflow: "hidden", position: "relative" }}>
      <IFrame
        ref={iframeRef}
        src={src}
        title="wapi"
        onLoad={handleLoad}
        style={{
          border: "none",
          width: WAPI_VIEWPORT_WIDTH,
          height: WAPI_VIEWPORT_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      />
    </div>
  );
};
