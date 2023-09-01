---
title: I'm bored. Let's build a Wordle clone.
slug: wordle-clone
author: Craig Johnosn
date: 2023-08-25 10:09:00 -0600
categories: dev
pinned: false
---

<script>
  import { base } from "$app/paths";
</script>

The new job is going fine, but I miss working in javascript daily. So let's do something for fun.

I got swept up in the Wordle craze just like all of you did when it first showed up on the scene. I never did reach a streak of 100. I came close twice, failing the first time because I forgot to play the game one day, and failing to get the answer another time on one of those annoying words that has a million one-letter variations.

I had no problem when the guy who built it sold it to the New York Times. Heck, if I'd been lucky enough to build something that captured the attention of the nation the way that thing did, I'd have sold out, too. And despite all the predictions to the contrary, the Times hasn't ruined it. Sure you have to click past a single ad to get to the gameplay, but otherwise it's the same experience it was before.

## How will we build it

But enough about that. How am I going to build the silly thing. I could just open the Dev Tools in Chrome and look through the source code. I might have even downloaded the original code back before the Times acquired it. But that wouldn't be as fun as figuring everything out on my own, so let's do it from scratch.

I'll still follow the basic design and experience of the game as it exists now. Let's break it down into an outline:

### Wordle app structure
* Opening screen with logo, title and buttons for "How to play", "Log in" and "Play," along with the date an puzzle number.
* A header with the "Wordle" title and three buttons that trigger modals for:
  - A "How to play" card with illustrated examples.
  - A statistics card with number of games played, win percentage, current stream and max streak, and a guess distribution bar chart. A share button copies the results of the last game played ot the clipboard in the format of "Wordle 798 4/6" and triggers the Web Share API.
  - A settings view with toggles for "Hard Mode", "Dark Theme" and "High Contrast Mode" and links to send feedback, report a bug, leave a review or read an FAQ.
* Game play view with six five-letter grids and a QWERTY keyboard below.

<div class="image-grid">
  <div class="image-grid-cell">
    <img src="/img/blog/wordle-clone/wordle-intro.jpg" alt="Intro view" />
    <p>Intro view</p>
  </div>
  <div class="image-grid-cell">
    <img src="/img/blog/wordle-clone/wordle-gameplay.jpg" alt="Gameplay view" />
    <p>Gameplay view</p>
  </div>
  <div class="image-grid-cell">
    <img src="/img/blog/wordle-clone/wordle-help.jpg" alt="Help view" />
    <p>Help view</p>
  </div>
  <div class="image-grid-cell">
    <img src="/img/blog/wordle-clone/wordle-stats.jpg" alt="Statistics view" />
    <p>Statistics view</p>
  </div>
  <div class="image-grid-cell">
    <img src="/img/blog/wordle-clone/wordle-settings.jpg" alt="Settings view" />
    <p>Settings view</p>
  </div>
</div>

I won't reproduce everything you see in these screenshots. I'll have every view, to be sure, but we don't need a Log In button or share tools or the links the Settings view. In fact, I'm not sure I'll have settings at all — we're going for a bare bones Wordle clone here.

Given that there's a lot to even a minimal app, I'm probably going to break this down into parts:

* **Part One** App structure. Of course I'm going to use Svelte for this. Love Svelte. So the fist step will be the scaffolding for our app, getting skeleton components in place, including the intro screen and header that put the components on the screen.
* **Part Two** Since the meat of the app is playing the game, we'll tackle the gameplay component next. I'm guessing there will be plenty there to take up an entire post.
* **Part Three** The statistics component will probably take up most of this installment, but since the help component is just static text and images, I'll tack that onto end.

Anyway, enough prologue. Let's get to building.

## **Part One** App structure

Svelte recommends using SvelteKit for a new Svelte project, but I want to focus on the app, so we'll use Svelte and Vite, but without the routing and other features of SvelteKit. Vite ([vitejs.dev](https://vitejs.dev/)) is a build tool with a built-in dev server.

On the command line, run `npm init vite`, choose `y` when prompted to install `create-vite`, enter a project name (I chose "wordle-clone", obviously), then select the `Svelte` and `Javascript` options. Now `cd` into your project folder, run `npm install` and then `npm run dev` to start the app. Open [http://localhost:5173](http://localhost:5173) and you'll be greeted by this:

![Vite-Svelte app](/img/blog/wordle-clone/vite-svelte-app.png)

In your project directory, look at `src/App.svelte`. You'll find the html for that opening view, along with a `script` tag with `imports` for the two svg logos and the `Counter` component. We want to replace all of that with our own html and components.

### What components will we need?

The Times app always open with the intro view. If it's your first time loading it, you get the view in the screenshot above. If you've been before but haven't played today's puzzle, you get a "Play" button. If you have played, you get message about how you did and a "See Stats" button.

Clicking any of those buttons loads the gameplay view and potentially a modal view on top of it. So for example, click "How to play" and you'll get the gameplay view with the help view over the top of it. The gameplay view's state depends on whether you've alreay played today. If you have, you'll see your guesses, if not, it'll be an empty board.

We'll consider each of the five views pictured above a component, so we'll need to create in the `src/lib` directory:
* `Welcome.svelte`: Our intro view.
* `Wordle.svelte`: The gameplay view.
* `Header.svelte`: A navigation bar at the top of the page with buttons to trigger the following components.
* `HowToPlay.svelte`: Instructions for how to play Wordle.
* `Statistics.svelte`: For keeping track of our player's results.
* `Settings.svelte`: I know I said I might not bother with this, but let's create it just in case.

We'll also want a navigation bar at the top of the `Wordle` components, create `Header.svelte`, as well.

Since these are just skeleton components, let's just stick an `h1` tag in there with the component name.

The `App.svelte` file represents the root view of the app. We'll always have one of two views active: the intro screen  or the gameplay screen. So let's import those two components. Replace the contents of `App.svelte` with:

```html
<script>
  import Welcome from "./components/Welcome.svelte";
  import Wordle from "./components/Wordle.svelte";
</script>

<div class="wordle-clone">
  <Welcome />
  <Wordle />
</div>
```
The remaining components will appear as modal views over the gameplay view, so we'll import them in the `Wordle` component.

```html
<script>
  import Header from "./Header.svelte";
  import HowToPlay from "./HowToPlay.svelte";
  import Statistics from "./Statistics.svelte";
  import Settings from "./Settings.svelte";
</script>

<h1>Wordle component</h1>

<Header />
<HowToPlay />
<Statistics />
<Settings />
```

So far, this is what we have.

<figure class="image skeleton-components">
    <img src="{base}/img/blog/wordle-clone/skeleton-components.png" alt="Skeleton components">
</figure>

## Fleshing out the Welcome component a bit

We now have all the components we'll need defined and imported, but we want to start with the welcome screen only, so let's hide the `Wordle` component until we click one of the buttons. Oh, let's also add the buttons and a couple of placeholder variables for date and puzzle number.

```html
<script>
  let today = new Date();
  let puzzleNumber = 1;
</script>

<div class="welcome-view">
  <h1>Wordle</h1>
  <p>Get 6 chances to guess a 5-letter word.</p>
  <div class="buttons">
    <button class="play">Play</button>
    <button>How to play</button>
  </div>
  <div class="date-and-number">
    {today.toDateString()}
    <span>No. {puzzleNumber}</span>
  </div>
</div>
```

Add a `showWelcome` variable to `App.svelte` and use Svelte's `{#if ...}` logic block to hide all but the `Welcome` component:

```html
<script>
  ...
  let showWelcome = true;
</script>

<div class="wordle-clone">
  {#if showWelcome}
  <Welcome />
  {:else}
  <Wordle />
  {/if}
</div>
```

That gets us this:

<figure class="image welcome1">
    <img src="{base}/img/blog/wordle-clone/welcome1.png" alt="Fleshed-out Welcome component">
</figure>

This would be a good time to mention that I'm not going to go into detail on styling the app. If I feel like it's something interesting or complex, I'll share it, otherwise it's pretty straight forward stuff. I will mention that the app we generated with `vite init` includes a global style sheet called `app.css` that's imported in `main.js`. I deleted most of the styles from that when I replaced the html in `App.svelte`, keeping only the `:root` and `body` style rules. I'm doing most of my CSS work in `style` tags in the components. If you haven't worked with svelte before, the main difference is that styles defined in the component are scoped to that component (unless you add the `:global()` modifier) and styles defined in the global stylesheet apply to the whole app.

## Hook up the buttons

Clicking the "Play" button should hide the `Welcome` component and show the `Wordle` component. Clicking the "How to Play" button should do the same thing but also show the `HowToPlay` components. To accomplish this, let's use Svelte's `writeable` store to hold some boolean state variables indicating whether to show something or hide it.

```javascript
// store.js
import { writable } from "svelte/store";

export const showWelcome = writable(true);
export const showHowToPlay = writable(false);
export const showStatistics = writable(false);
export const showSettings = writable(false);
```

Now edit `App.svelte` to import the store variable and change `showWelcome` to `$showWelcome`.

```html
<script>
  ...
  import { showWelecome } from "./store";
</script>

<div class="wordle-clone">
  {#if $showWelcome}
  ...
</div>
```

In `Wordle.svelte`, import the other three varialbe and use them to hide their respective components.

```html
<script>
  ...
  import {
    showHowToPlay,
    showStatistics,
    showSettings
  } from "./store";
</script>

<Header />

{#if $showHowToPlay}
<HowToPlay />
{:else if $showStatistics}
<Statistics />
{:else if $showSettings}
<Settings />
{/if}
```

Finally, add click event handlers to the buttons in `Welcome.svelte` to change the store variables to `true`.

```html
<script>
  import { showWelcome, showHowToPlay } from "./store";
  ...
</script>

<div class="welcome-view">
  ...
  <button class="play" on:click={() => $showWelcome = false}>Play</button>
  <button on:click={() => {
    $showWelcome = false;
    $showHowToPlay = true;
  }}>How to play</button>
  ...
```

Clicking the "Play" button should now show "Wordle component" and "Header component". Clicking the "How to play" button should show those two __and__ "HowToPlay component."

## Header component

I won't go into detail on this, but basically it should be anchored at the top of the `Wordle` components, should contain buttons that set the store variable to `true`, and should disable the buttons when any of the three modals is visible. For purposes of finishing out the scaffolded project, I'll also add close buttons to the skeleton modal views that set the store variables to `false`.

Go [here](/developer/projects/wordle-clone/part-one) to see our progress to this point.

For part two, I'll tackle the game play. Check back in a week or two.


<style lang="scss">
  @use "../../../lib/styles/colors" as *;

  .image-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 1rem;
    margin-bottom: 2rem;

    @media (min-width: 480px) {
      grid-template-columns: 1fr 1fr 1fr;
    }
  }
  
  p > img,
  .image-grid-cell img {
    border: 1px solid $gray-color-light;
    width: 100%;
  }

  figure.image {
    display: flex;
    justify-content: center;
  }
  
  .image-grid-cell p {
    font-size: 1rem;
    text-align: center;
  }

  .skeleton-components {
    border: 1px solid $gray-color-light;
    padding: 0;

    @media (min-width: 480px) {
      padding: 0 10rem;
    }
  }

  .welcome1 {
    background-color: #e3e3e3;
    margin: 2rem 0;
    width: 100%;
  }
</style>