# craiginiowa.github.io

The Jekyll version of craiginiowa.com migrated to Sveltekit.

## Developing

Once dependencies have been installed with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

## Use the SvelteKit static adapter

Since GitHub Pages is a static website hosting, we need to use the SvelteKit static adapter. To do this, we need to install the adapter:

```bash
pnpm add -D @sveltejs/adapter-static
```

And then, in the `svelte.config.js` file, we need to replace `@sveltejs/adapter-auto` with `@sveltejs/adapter-static`. By default, the SvelteKit static adapter will generate the website in the root of the `build` folder. However, GitHub Pages will serve the website from a subfolder. To fix this, we need to set the `paths.base` property in the config file.
The base path should be the name of the repository, `craiginiowa.github.io`. Our configuration now look like this:

```bash
import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/kit/vite";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
    paths: {
      base:
        process.env.NODE_ENV === "production" ? "/craiginiowa.github.io" : "",
    },
  },
};

export default config;
```

On top of that, the relative links in the project should be prefixed with the base path. For example, if we have a link to the about page, we should use /sveltekit-github-pages/about instead of /about .
Here is what this looks like in a Svelte component:

```js
<script lang="ts">
    import { base } from '$app/paths';
</script>

<nav>
    <a href="{base}/">Home</a>
    <a href="{base}/about">About</a>
</nav>
```

## Bypassing Jekyll

By default, GitHub Pages will try to build the website using Jekyll. However, we don't want this to happen since we are building the website using SvelteKit. To bypass Jekyll, we need to create a `.nojekyll` file in the static folder. This will tell GitHub Pages to not use Jekyll.

## Deploy to GitHub Pages

https://www.okupter.com/blog/deploy-sveltekit-website-to-github-pages
https://vitejs.dev/guide/static-deploy.html#github-pages

Now that everything is set up, we can deploy the website to GitHub Pages. After pushing the repository to GitHub, we need to set the publishing source for the website on Pages. Ideally, the source should be a separate branch on the repository. For example, we can create a `gh-pages` branch and set it as the publishing source.
Go to the repository settings, then to the Pages tab. Select the `gh-pages` branch as the publishing source and click on `Save`.

The most straightforward way to deploy the website is to just build the website locally by running `npm build`, and copying the content of the `build` folder to the `gh-pages` branch. Every time a commit is made to the `gh-pages` branch, GitHub Pages will automatically deploy the new version of the website.

## Other deployment options

### Using the gh-pages package

Instead of manually copying the content of the build folder to the `gh-pages` branch, we can use the `gh-pages` npm package to automate this process. To do this, we need to install the package:

```bash
npm add -D gh-pages
```

Then, we need a new script in the package.json file to deploy the website:

```json
{
  "scripts": {
    "deploy": "npm run build && touch ./build/.nojekyll && npx run gh-pages -d build -t true"
  }
}
```

Finally, we can run the script to deploy the website:

```bash
npm run deploy

```

This will automatically build the website and trigger the deployment to GitHub Pages.

### Using GitHub Actions

Instead of deploying the website manually, we can use GitHub Actions to automate the deployment. With a simple workflow, we can trigger a deployment every time a commit is made to the `main` branch.
