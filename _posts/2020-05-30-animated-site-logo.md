---
layout: post
title: Animating a logo with Svelte
slug: animated-site-logo
author: Craig Johnson
_date: 2020-05-08 12:25:00 -0600
categories: dev
pinned: false
image:
  url: assets/img/examples/rebuilding-america-front.jpg
links: [examples/animated-site-logo/bundle.css]
scripts: [examples/animated-site-logo/bundle.js]
---
In May of 2020, I built an animated SVG logo for USA Today's [Rebuilding America](https://www.usatoday.com/rebuilding-america/){:target="_blank"} front. It was my idea to do something more than just a boring old static image because I'd been impressed with the motion graphics applied to the very same logo in a video announcing the project.

Breathing a little life into the logo, or giving it a little "zazzle" as my development team likes to say, turned out to be surprisingly easy thanks to Svelte, the javascript framework created by Rich Harris, a graphics developer at the New York Times. Svelte has an out-of-the-box transition library that makes fades and slides and progressions a snap. Custom transitions are a breeze to write, as well.

It was such an enjoyable experience that I thought I'd "zazzle" up my own logo. Here's the boring version.

{% include snippets.html name="site-logo" %}

It's a nice enough logo. Gets the job done. But you're not necessarily drawn to it first thing when the page loads. So lets do something about that.

When I say "logo" in this case, I'm actually referring to the whole design — the list of some of my skills, the actual site name SVG element, and the box outlining the whole thing. I want to animate all of it.

The first step is setting up my Svelte component. If you're not familiar with Svelte, it has a lot in common with frameworks like React and Vue, with the main difference being that it doesn't require a runtime layer interpreting the code in the browser — it's more of a compiler, running at build time and leaving you with lightweight, efficient javscript.

I won't bore you here with the details of developing with Svelte. You can find everything you need for that at [svelte.dev](https://svelte.dev){:target="_blank"}. In particular, look at [svelte.dev/examples#svg-transitions](https://svelte.dev/examples#svg-transitions){:target="_blank"}. I'm using the same basic principles.

With my Svelte app set up, it's time to figure out how I want my animation to go. For the Rebuilding America logo, I started with a progressive drawing of the path defining the U.S. border, then started filling in a crosshatch pattern inside of it; then the words "Rebuilding America" zoomed into place and a bunch of drafting marks faded into view sequentially.

The progressive path render doesn't quite work for my logo.


shaping the svg into something useable.

As part of the static logo, the svg is simply a file, placed on the page using an `<img />` tag.

<div class="ex">
  <div class="site-logo-example home animate-all"></div>
</div>