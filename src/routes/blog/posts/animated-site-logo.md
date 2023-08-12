---
title: Animating a logo with Svelte
slug: animated-site-logo
author: Craig Johnson
date: 2020-10-18 01:50:00 -0600
pinned: true
image:
url: /img/examples/rebuilding-america-front.jpg
links: [examples/animated-site-logo/bundle.css]
scripts: [examples/animated-site-logo/bundle.js]
---

<script>
  import RebuildingAmericaLogo from "../../../lib/components/site-logo/RebuildingAmericaLogo.svelte";
  import StaticSiteLogo from "../../../lib/components/site-logo/StaticSiteLogo.svelte";
  import SiteLogoExample from "../../../lib/components/site-logo/SiteLogoExample.svelte";
</script>

In May of 2020, I built an animated SVG logo for USA Today's Rebuilding America front, a landing place for stories about how America would rebuild as states began opening back up. The Svelte framework made it embarassingly easy.

Sadly, in the age of COVID-19, plans don't always pan out. The pandemic did <i>not</i> wind down, the country did <i>not</i> reopen, and the front was more or less abandoned. You can, however, still view the afore-mentioned animated logo [here](https://www.usatoday.com/rebuilding-america/).

It was my idea to do something more than just a boring old static image because I'd been impressed with the motion graphics applied to the very same logo in a video announcing the project. I ended up producing this:

<div class="ex">
  <div class="rebuilding-america">
    <RebuildingAmericaLogo />
  </div>
</div>

Breathing a little life into the logo, or giving it a little "zazzle" as my dev team likes to say, turned out to be surprisingly easy thanks to Svelte, the javascript framework created by Rich Harris, a graphics editor at the New York Times. Svelte has an out-of-the-box transition library that makes fades and slides and progressions a snap.

It was such an enjoyable experience that I thought I'd "zazzle" up my own logo. Here's the boring version:

<div class="ex">
  <StaticSiteLogo />
</div>

It's a nice enough logo. Gets the job done. But you're not necessarily drawn to it first thing when the page loads. So lets do something about that.

When I say "logo" in this case, I'm actually referring to the whole design — the list of some of my skills, the actual site name SVG element, and the box outlining the whole thing. I want to animate all of it.

The first step is setting up my Svelte component. If you're not familiar with Svelte, it has a lot in common with frameworks like React and Vue, with the main difference being that it doesn't require a runtime layer interpreting the code in the browser — it's more of a compiler, running at build time and leaving you with lightweight, efficient javscript.

I won't bore you here with the details of developing with Svelte. You can find everything you need for that at [svelte.dev](https://svelte.dev). In particular, look at [svelte.dev/examples#svg-transitions](https://svelte.dev/examples#svg-transitions). I'm using the same basic principles.

With my Svelte app set up, it's time to figure out how I want my animation to go. For the Rebuilding America logo, I started with a progressive drawing of the path defining the U.S. border, then started filling in a crosshatch pattern inside of it; then the words "Rebuilding America" zoomed into place and a bunch of drafting marks faded into view sequentially.

I decided to use the progressive path render on the SVG element of my logo, the "craig in iowa" bit. Since SVG is nothing more than a text file containing data describing the shapes and lines that make up the graphic, the first step was copying that data to my Svelte component so I could manipulate it. Each character is a `<path>` element with a `d` attribute that defines its shape — I saved those to an array to get something like this:

```javascript
const paths = [
"M20.761,31.92C18.552,34.372,15.13,36,11.24,36C4.047,36,0,30.587,0,23.268 c0-8.014,5.047-12.732,12.128-12.732c3.245,0,6.191,1.337,8.367,3.515l-1.664,2.273c-0.492,0.679-1.475,0.625-2.007,0.295 s-2.312-1.518-4.78-1.518s-5.972,1.649-5.972,8.13s3.682,8.196,5.724,8.196c2.625,0,3.875-0.883,5.185-1.872 c0.825-0.623,1.576-0.431,2.076,0.204L20.761,31.92z",
"M24.552,35.592V10.968h3.48c0.607,0,1.031,0.112,1.271,0.336c0.239,0.224,0.398,0.608,0.479,1.152 l0.359,2.976c0.88-1.52,1.912-2.72,3.097-3.6c1.184-0.88,2.512-1.32,3.983-1.32c1.216,0,2.224,0.28,3.023,0.84l-0.769,4.44 c-0.048,0.288-0.152,0.492-0.312,0.612c-0.16,0.12-0.376,0.18-0.647,0.18c-0.239,0-0.567-0.056-0.983-0.168 c-0.417-0.112-0.969-0.168-1.656-0.168c-1.231,0-2.288,0.34-3.168,1.02c-0.88,0.681-1.624,1.676-2.231,2.988v15.336H24.552z",
...
];
```

This lets me build the SVG element in the html part of my Svelte component, looping through `paths` and applying a transition to each character in the logo. I imported Svelte's built-in `draw` transition, which animates the stroke of an SVG element with options for controlling the duration and speed of the animation and delaying when it starts.

I used Svelte's `{#each ...}` block to loop through the array, giving each character a 1 second animation and delaying the start of the animation by 200 milliseconds in succession by using the block's index variable as a multiplier.

```html
<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -1 143.512 87.109">
  {#each paths as path, i}
  <path in:draw="{{ delay: i * 200, duration: 1000 }}" d="{path}" />
  {/each}
</svg>
```

This is fine, but in my logo, the "in" is displayed at 50% opacity to give it some separation. No problem:

```html
<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -1 143.512 87.109">
  {#each paths as path, i} {#if i == 5 || i == 6}
  <path
    in:draw="{{ delay: i * 200, duration: 1000 }}"
    opacity="0.5"
    d="{path}"
  />
  {:else}
  <path in:draw="{{ delay: i * 200, duration: 1000 }}" d="{path}" />
  {/if} {/each}
</svg>
```

Great! But this leaves me with outlines of the letters. I want them to be solid, which means applying a CSS style of `fill: white` once the animation is done. Luckily, Svelte transitions emit events when starting and finishing the transition. I can use the `introend` event to toggle a variable, then use that variable to set a class on my logo, and finally use that class to apply my rule.

```html
<div class="billboard" class:done>
  ...

  <svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -1 143.512 87.109">
    {#each paths as path, i} {#if i == 5 || i == 6}
    <path
      in:draw="{{ delay: i * 200, duration: 1000 }}"
      opacity="0.5"
      d="{path}"
    />
    {:else if i == 10}
    <path
      in:draw="{{ delay: 2500, duration: 1000 }}"
      on:introend="{() => done = true}"
      d="{path}"
    />
    {:else}
    <path in:draw="{{ delay: i * 200, duration: 1000 }}" d="{path}" />
    {/if} {/each}
  </svg>

  ....
</div>
```

And the CSS with transitions to fade in the solid fill:

```css
svg path {
  fill: transparent;
  stroke: #fff;
  stroke-width: 0.065em;
  transition: fill 2s, stroke 0.7s 2s;
}
.done svg path {
  fill: #fff;
  stroke: transparent;
}
```

And the result:

  <div class="ex">
    <SiteLogoExample animate="logo" />
  </div>

Now let's turn our attention to animating the word cloud. I want to fade in each letter but in a random order. I'll save the entire cloud as a string, then run `.split("")` on it in the template to get an array of individual letters.

```javascript
const wordCloud =
  "developer • graphic artist • illustrator • copy editor • other assorted activities";
```

I'll again use the `{#each ...}` block, but this time, I'll use the `fade` transition, and instead of setting `delay` using the `index` varaiable, I'll use `Math.random()` to set a delay of between 1 and 3.5 seconds.

```html
<div class="skills-cloud">
  {#each wordCloud.split("") as character}
  <span in:fade="{{ delay: Math.random() * 2500 + 1000, duration: 100 }}"
    >{ character }</span
  >
  {/each}
</div>
```

One problem with this. The static word cloud had a couple of `<br>` tags to keep the string compact, so I'll add a couple of `/` characters where the `<br>` tags should go, then sub them out in the `{#each ...}` loop.

```javascript
const wordCloud =
  "developer • graphic/artist • illustrator •/copy editor • other/assorted activities";
```

```html
<div class="skills-cloud">
  {#each wordCloud.split("") as character, i}
  {#if character == "/"}
  <br />
  {:else}
  <span in:fade="{{ delay: Math.random() * 2500 + 1000, duration: 100 }}"
    >{ character }</span
  >
  {/if}
  {/each}
</div>
```

And done:

  <div class="ex">
    <SiteLogoExample animate="cloud" />
  </div>

Finally, I want to add a "ta-da" burst to the outline of the logo package at the end. The only Svelte-specific part of this is setting a class when it's time to trigger my animation on the outline. For that, I'll use the `outroend` event, which is emitted when the word cloud transition finishes. Beyond that, it uses standard CSS transitions and a keyframe animation: I hide the 1-pixel border until the SVG animation is done, then animate a white `box-shadow` on the `.animated-border` element.

```html
<div class="animated-border" class:visible></div>
<div class="skills-cloud" on:outroend="{() => visible = true}">
  {#each wordCloud.split("") as character, i} {#if character == "/"}
  <br />
  {:else}
  <span in:fade="{{ delay: Math.random() * 2500 + 1000, duration: 100 }}"
    >{ character }</span
  >
  {/if} {/each}
</div>
```

```css
.animated-border {
  border: 1px solid transparent;
  position: absolute;
  height: 100%;
  transition: border-color 0s 0s;
  width: 100%;
}
.done .animated-border {
  border-color: #fff;
  transition: border-color 0s 1s;
}
.animated-border.visible {
  animation-duration: 2s;
  animation-delay: 4s;
  animation-timing-function: ease;
  animation-name: pulse;
}
@keyframes pulse {
  from {
    box-shadow: 0px 0px 0px 0px #fff;
  }
  20% {
    box-shadow: 0px 0px 20px 10px #fff;
  }
  to {
    box-shadow: 0px 0px 0px 0px #fff;
  }
}
```

And the final product:

  <div class="ex animate-all">
    <SiteLogoExample animate="all" />
  </div>

And there you have it. This just scratches the surface of what Svelte transitions and animations can do, but hopefully it demonstrates how easily you can add a bit of "zazzle" to your site.
