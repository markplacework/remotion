import { AbsoluteFill } from "remotion";
import { SiTuNoEstasScene, SI_TU_NO_ESTAS_DURATION_FRAMES } from "./scenes/SiTuNoEstasScene";
import { VIDEO_WIDTH, VIDEO_HEIGHT, FPS } from "./theme";

// The user's landscape clip + logo + burned-in lyrics. Audio comes from
// the clip itself (OffthreadVideo), so this render is NOT silent.
export const SI_TU_NO_ESTAS_FPS = FPS;
export const SI_TU_NO_ESTAS_WIDTH = VIDEO_WIDTH;
export const SI_TU_NO_ESTAS_HEIGHT = VIDEO_HEIGHT;
export const SI_TU_NO_ESTAS_DURATION = SI_TU_NO_ESTAS_DURATION_FRAMES;

export const SiTuNoEstas: React.FC = () => {
  return (
    <AbsoluteFill>
      <SiTuNoEstasScene />
    </AbsoluteFill>
  );
};
