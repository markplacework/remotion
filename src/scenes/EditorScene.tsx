import { AbsoluteFill, staticFile } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { PhoneMockup, mockupHeightFor } from "../components/PhoneMockup";
import { TextBeat } from "../components/TextBeat";
import { ACTIVE_BUSINESS } from "../business";
import { VIDEO_HEIGHT } from "../theme";
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

const PHONE_WIDTH = 560;
const PHONE_HEIGHT = mockupHeightFor(PHONE_WIDTH);
const PHONE_TOP = (VIDEO_HEIGHT - PHONE_HEIGHT) / 2;
const PHONE_BOTTOM = PHONE_TOP + PHONE_HEIGHT;

export const EditorScene: React.FC = () => {
  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <PhoneMockup
          width={PHONE_WIDTH}
          src={EDITOR_URL}
          driveFrame={async (win, frame) => {
            await win.__wapiDirector?.replay(frame, EDITOR_CUES, win.__WAPI_BUSINESS_DATA__);
          }}
        />
      </AbsoluteFill>
      <TextBeat
        top={PHONE_BOTTOM + 90}
        fontSize={40}
        window={[10, 28, 68, 85]}
        lines={[[{ text: "Cargá tu " }, { text: "catálogo", accent: true }, { text: " en minutos." }]]}
      />
    </AbsoluteFill>
  );
};
