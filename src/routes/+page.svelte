<script>
  import AnimatedSiteLogo from "$lib/components/AnimatedSiteLogo.svelte";
  import TestComponent from "$lib/components/TestComponent.svelte";
  export let data;

  $: console.log(data);
</script>

<div class="animated-site-logo">
  <AnimatedSiteLogo />
</div>

<!-- <div class="test">
    <TestComponent />
  </div> -->

<style>
  body {
    background-color: green;
  }
  .animated-site-logo {
    background-image: none;
    color: #fff;
    padding: 30px 0;
    position: relative;
  }
</style>
