import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsPathConfig from "vite-tsconfig-paths";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { devtools } from "@tanstack/devtools-vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    devtools(),
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
      routesDirectory: "src/pages/",
      generatedRouteTree: "src/shared/config/routeTree.gen.ts",
      routeFileIgnorePattern: ".*\\.(test|spec)\\.(ts|tsx|js|jsx)$",
    }),
    viteReact(),
    tailwindcss(),
    tsPathConfig(),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
});
