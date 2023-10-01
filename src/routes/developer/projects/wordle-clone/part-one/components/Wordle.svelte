<script>
  import Header from "./Header.svelte";
  import HowToPlay from "./HowToPlay.svelte";
  import Statistics from "./Statistics.svelte";
  import Settings from "./Settings.svelte";
  import {
    showHowToPlay,
    showStatistics,
    showSettings
  } from "./store";

  export let slug = "wordle-clone";

</script>

<Header />

{#if $showHowToPlay}
<HowToPlay />
{:else if $showStatistics}
<Statistics />
{:else if $showSettings}
<Settings />
{/if}

<div class="back-to-blog">
  <a href="/blog/{slug}">&larr; Back to blog</a>
</div>

<style>
  .back-to-blog {
    left: 50%;
    position: fixed;
    top: 50%;
    transform: translate(-50%, -50%);
  }
</style>