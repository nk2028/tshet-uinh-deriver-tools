// @ts-check

import typescript from "@rollup/plugin-typescript";

/** @type { import("rollup").RollupOptions } */
export default {
  input: "src/index.ts",
  output: {
    file: "dist/index.js",
    format: "umd",
    sourcemap: true,
    name: "TshetUinhDeriverTools",
    exports: "named",
    globals: {
      qieyun: "Qieyun",
    },
  },
  external: ["qieyun"],
  plugins: [
    typescript({
      // NOTE needed with `incremental: true` in tsconfig.json
      outputToFilesystem: false,
    }),
  ],
};
