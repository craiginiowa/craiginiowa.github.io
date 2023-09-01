<script>
  import { onDestroy } from "svelte";
  import Welcome from "./components/Welcome.svelte";
  import Wordle from "./components/Wordle.svelte";
  import {
    showWelcome,
    showHowToPlay,
    showStatistics,
    showSettings,
  } from "./components/store";

  onDestroy(() => {
    $showWelcome = true;
    $showHowToPlay = false;
    $showStatistics = false;
    $showSettings = false;
  });
</script>

<div class="wordle-clone">
  {#if $showWelcome}
    <Welcome />
  {:else}
    <Wordle />
  {/if}
</div>

<style>
  .wordle-clone {
    height: calc(100vh - 56px);
    position: relative;
    width: 100vw;
  }
</style>
