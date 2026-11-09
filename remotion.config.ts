/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";
import { enableTailwind } from '@remotion/tailwind-v4';

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// bt709 makes the MP4 come out as standard yuv420p/tv-range instead of
// the full-range yuvj420p the jpeg frames otherwise produce, which some
// phones/apps reject as an "unsupported file" on download.
Config.setColorSpace("bt709");
Config.overrideBundlerConfig(enableTailwind);
