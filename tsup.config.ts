import {defineConfig} from "tsup";

export default defineConfig({
    clean: true,
    bundle: true,
    dts: process.env.NODE_ENV === "production",
    entry: [
        "src/index.ts",
        "src/helpers/index.ts",
        "src/types.ts"
    ],
    external: ["undici"],
    outDir: "dist",
    sourcemap: process.env.NODE_ENV !== "production",
    format: ["esm", "cjs"],
    platform: "neutral",
    replaceNodeEnv: true,
    watch: process.env.NODE_ENV !== "production"
});