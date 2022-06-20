import ts from "rollup-plugin-ts";

/** @type { import("rollup").RollupOptions } */
const config = {
  input: "src/index.ts",
  output: {
    file: "dist/index.js",
    format: "umd",
    sourcemap: true,
    name: "QieyunDeriverTools",
    exports: "named",
    globals: {
      qieyun: "Qieyun",
    },
  },
  external: ["qieyun"],
  plugins: [ts()],
};
export default config;
