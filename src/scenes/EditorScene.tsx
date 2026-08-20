import { AbsoluteFill, staticFile } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { PhoneMockup } from "../components/PhoneMockup";
import { ACTIVE_BUSINESS } from "../business";
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

/**
 * Mockup only — no caption. The real editor UI carries the story on its
 * own. `cues` defaults to the full-video pacing but can be overridden
 * (e.g. by the short-cut ad composition) — same real director/DOM logic
 * either way, just different frame thresholds.
 */
export const EditorScene: React.FC<{ cues?: typeof EDITOR_CUES }> = ({ cues = EDITOR_CUES }) => {
  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <PhoneMockup
          width={760}
          src={EDITOR_URL}
          sheenPosition={0.7}
          driveFrame={async (win, frame) => {
            await win.__wapiDirector?.replay(frame, cues, win.__WAPI_BUSINESS_DATA__);
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
