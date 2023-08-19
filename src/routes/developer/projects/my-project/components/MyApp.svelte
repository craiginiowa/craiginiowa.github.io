<script>
  let counter = 0;
</script>

<div class="my-app">
  <div>
    <h1>This is my app.</h1>
    <p>The button has been clicked {counter} times.</p>
    <button on:click={() => counter++}>Click Me</button>
    <button on:click={() => counter = 0}>Reset</button>
  </div>
</div>

<style>
  .my-app {
    align-items: center;
    background-color: lavender;
    display: flex;
    height: 100%;
    justify-content: center;
    width: 100%;
  }
  h1 {
    color: purple;
  }
  button {
    background: none;
    border: 2px solid purple;
    border-radius: 9px;
    color: purple;
    padding: 10px;
  }
</style>
