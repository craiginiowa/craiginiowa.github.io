import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/kit/vite";
import sveltePreprocess from "svelte-preprocess";
import { mdsvex } from "mdsvex";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter(),
    paths: {
      base:
        process.env.NODE_ENV === "production" ? "/craiginiowa.github.io" : "",
    },
  },
  extensions: [".svelte", ".md"],
  preprocess: [
    vitePreprocess(),
    sveltePreprocess({
      scss: {
        includePaths: ["./src/lib/styles"],
      },
    }),
    mdsvex({
      extensions: [".md"],
    }),
  ],
};

export default config;
