import { AbsoluteFill, staticFile } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { Camera } from "../components/Camera";
import { PhoneMockup } from "../components/PhoneMockup";
import { ACTIVE_BUSINESS } from "../business";
import { SCENE_2_EDITOR } from "../theme";
import { EDITOR_CUES } from "./editorCues";

declare global {
  interface Window {
    __wapiDirector?: {
      replay: (frame: number, cues: typeof EDITOR_CUES, business: unknown) => Promise<void>;
    };
    // Injected directly into the patched HTML with paths already relative
    // to that document — this, not the Remotion-side business data (whose
    // paths are for staticFile()), is what the director must use.
    __WAPI_BUSINESS_DATA__?: unknown;
  }
}

const EDITOR_URL = staticFile(`/wapi-real/${ACTIVE_BUSINESS.slug}/editor.html`);

export const EditorScene: React.FC = () => {
  return (
    <AbsoluteFill>
      <Backdrop />
      <Camera
        from={{ scale: 0.78, y: 20, rotateY: 10, rotateX: -3 }}
        to={{ scale: 0.94, y: -6, rotateY: 3, rotateX: -1 }}
        durationInFrames={SCENE_2_EDITOR}
      >
        <PhoneMockup
          width={620}
          src={EDITOR_URL}
          sheenPosition={0.7}
          driveFrame={async (win, frame) => {
            await win.__wapiDirector?.replay(frame, EDITOR_CUES, win.__WAPI_BUSINESS_DATA__);
          }}
        />
      </Camera>
    </AbsoluteFill>
  );
};
