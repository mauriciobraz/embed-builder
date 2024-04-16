import adapter from "@sveltejs/adapter-vercel";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      runtime: "nodejs20.x",
      images: {
        sizes: [640, 1200, 1920],
        domains: ["cdn.discordapp.com"],
      },
    }),
    files: {
      assets: "src/lib/static",
    },
  },
};
