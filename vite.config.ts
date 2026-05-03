import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import vsixPlugin from "@codingame/monaco-vscode-rollup-vsix-plugin";
import importMetaUrlPlugin from "@codingame/esbuild-import-meta-url-plugin";

// Mirrors the upstream demo: inline VSCode CSS, set COEP/COOP for SharedArrayBuffer,
// pre-bundle the giant fan-out of monaco-vscode service-override packages so dev mode
// doesn't stall in Chrome, and let the rollup plugin transform `.vsix` imports into
// real built-in extensions.
export default defineConfig(({ command }) => ({
  base: command === "build" ? "./" : "/",
  build: {
    target: "esnext",
    sourcemap: true,
    chunkSizeWarningLimit: 4096,
  },
  worker: {
    format: "es",
  },
  plugins: [
    react(),
    {
      name: "load-vscode-css-as-string",
      enforce: "pre",
      async resolveId(source, importer, options) {
        const resolved = await this.resolve(source, importer, options);
        if (
          resolved &&
          /node_modules\/(@codingame\/monaco-vscode|vscode|monaco-editor).*\.css$/.test(resolved.id)
        ) {
          return { ...resolved, id: resolved.id + "?inline" };
        }
        return undefined;
      },
    },
    {
      name: "configure-response-headers",
      apply: "serve",
      configureServer(server) {
        server.middlewares.use((_req, res, next) => {
          res.setHeader("Cross-Origin-Embedder-Policy", "credentialless");
          res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
          res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
          next();
        });
      },
    },
    vsixPlugin(),
  ],
  esbuild: {
    minifySyntax: false,
  },
  optimizeDeps: {
    include: [
      "@codingame/monaco-vscode-api",
      "@codingame/monaco-vscode-api/extensions",
      "@codingame/monaco-vscode-api/monaco",
      "vscode/localExtensionHost",
      "@vscode/vscode-languagedetection",
      "marked",
    ],
    esbuildOptions: {
      target: "esnext",
      // The default-extension packages use `new URL('./resources/foo.json',
      // import.meta.url)` to point at their bundled assets. Vite's default
      // dep optimizer doesn't preserve those — without this plugin, every
      // resource load 404s.
      plugins: [importMetaUrlPlugin as any],
    },
  },
  server: {
    port: 5173,
    host: "0.0.0.0",
  },
  resolve: {
    dedupe: ["vscode", "monaco-editor"],
  },
}));
