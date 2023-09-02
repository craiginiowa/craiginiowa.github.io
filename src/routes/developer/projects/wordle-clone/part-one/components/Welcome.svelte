<script>
  import { showWelcome, showHowToPlay } from "./store";
  let today = new Date();
  let puzzleNumber = 1;
</script>

<div class="welcome-view">
  <h1>Wordle-ish</h1>
  <p>A simple Wordle clone built as a learning exercise. For the real thing, go to <a href="https://www.nytimes.com/games/wordle/index.html">nytimes.com/wordle</a></p>
  <div class="buttons">
    <button class="play" on:click={() => $showWelcome = false}>Play</button>
    <button on:click={() => {
      $showWelcome = false;
      $showHowToPlay = true;
    }}>How to play</button>
  </div>
  <div class="date-and-number">
    {today.toDateString()}
    <span>No. {puzzleNumber}</span>
  </div>
</div>

<style>
  .welcome-view {
    align-items: center;
    background-color: #e3e3e3;
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
    width: 100%;
  }

  h1 {
    font-family: AlfaSlabOne,serif;
    font-size: 3rem;
    line-height: 1;
    margin: 0 0 1rem;
  }

  p {
    font-size: 1.5rem;
    margin: 0 0 2rem;
    max-width: 20rem;
    text-align: center;
  }

  .buttons {
    display: flex;
    flex-direction: column;
    grid-gap: 1rem;
    margin-bottom: 2rem;
  }

  @media (min-width: 480px) {
    .buttons {
      flex-direction: row-reverse;
    }
  }

  .buttons button {
    background: none;
    border: 1px solid black;
    border-radius: 2rem;
    cursor: pointer;
    font-size: 1rem;
    padding: .75rem 1.5rem;
  }

  .buttons .play {
    background-color: black;
    color: white;
  }

  .date-and-number {
    font-weight: bold;
    text-align: center;
  }

  .date-and-number span {
    display: block;
    font-weight: normal;
    text-align: center;
  }
</style>