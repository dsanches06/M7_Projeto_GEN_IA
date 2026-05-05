import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Usar jsdom para simular o DOM nos testes
    environment: "jsdom",
    include: ["testes/**/*.test.ts"],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/cypress/**",
      "**/.{idea,git,cache,output,temp}/**",
      "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*",
    ],
  },
});
