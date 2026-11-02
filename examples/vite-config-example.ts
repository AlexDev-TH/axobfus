import { axobfusVitePlugin } from "../src/bundler/index.js";

export default {
  plugins: [
    axobfusVitePlugin({
      intensity: "bankrupt",
      seed: "enterprise-release-2026",
      enableHoneySourceMaps: true,
    }),
  ],
};
