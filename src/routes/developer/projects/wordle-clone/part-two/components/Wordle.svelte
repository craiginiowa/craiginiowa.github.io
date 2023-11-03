<script>
  import { onMount } from "svelte";
  import Header from "./Header.svelte";

  /* -- NOT USING THESE IN THIS DEMONSTRATION --
  import HowToPlay from "./HowToPlay.svelte";
  import Statistics from "./Statistics.svelte";
  import Settings from "./Settings.svelte";
  import {
    showHowToPlay,
    showStatistics,
    showSettings,
    showWelcome,
  } from "../store";
  -- NOT USING THESE IN THIS DEMONSTRATION -- */

  export let slug;

  let gameplayEl;
  let guessesEl;
  let keyboardEl;
  let hidden = true;

  let guesses = ["FUNGI", "QUEEN", "QU---", "-----", "-----", "-----"];
  let curGuess = 2;
  const answer = "QUOTE";

  const qwerty = "QWERTYUIOPASDFGHJKLeZXCVBNMd";

  $: keyRows = [qwerty.slice(0, 10), qwerty.slice(10, 19), qwerty.slice(19)];

  /**
   * Examine a letter in a guessed word and return a feedback class.
   * @param {String} letter - The letter targeted for feedback
   * @param {Number} row - Index into guesses
   * @param {Number} col - Index into guesses[curGuess]
   * @return {String} - Base class + feedback class
   */
  function guessFeedbackClass(letter, row, col) {
    const baseClass = "letter";

    if (row == curGuess && letter != "-") {
      return `${baseClass} pending`;
    } else if (row >= curGuess || letter == "-") {
      return baseClass;
    }

    let timesInAnswer = 0;
    let timesCorrect = 0;
    let timesSeenNotCorrect = 0;

    for (let i = 0; i < 5; i++) {
      if (answer[i] == letter) timesInAnswer += 1;
      if (guesses[row][i] == letter) {
        if (answer[i] == guesses[row][i]) {
          timesCorrect += 1;
        } else if (i < col) {
          timesSeenNotCorrect += 1;
        }
      }
    }

    if (answer.includes(letter)) {
      if (answer[col] == letter) {
        return `${baseClass} correctposition`;
      } else if (timesSeenNotCorrect + timesCorrect < timesInAnswer) {
        return `${baseClass} wrongposition`;
      }
    }

    return `${baseClass} notfound`;
  }

  /**
   * Examine a character on the keyboard and return a feedback class.
   * @param {String} key - The character targeted for feedback
   * @returns {String} - Base class + feedback class
   */
  function keyFeedbackClass(key) {
    const baseClass = "key";

    let correctPosition = false;
    let wrongPosition = false;
    let notFound = false;

    // loop through ALL guesses, until first "-"
    for (let row = 0; row < guesses.length; row++) {
    // for (let row in guesses) {
      const guess = guesses[row];

      if (row >= curGuess || guess[0] == "-") break;

      for (let col = 0; col < guess.length; col++) {
        const letter = guess[col];

        // if this isn't the key we're checking or it's "-", continue
        if (letter != key || letter == "-") continue;

        if (answer.includes(letter)) {
          correctPosition = correctPosition || answer[col] == guess[col];
          wrongPosition = !correctPosition;
        } else if (guess.includes(letter)) {
          notFound = true;
        }
      }
    }

    if (correctPosition) {
      return `${baseClass} correctposition`;
    } else if (wrongPosition) {
      return `${baseClass} wrongposition`;
    } else if (notFound) {
      return `${baseClass} notfound`;
    }

    return baseClass;
  }

  /**
   * Keyboard or button click input.
   * @param {String} key - A-Z, Enter or Delete.
   */
  function handleKeyInput(key) {
    let guess = guesses[curGuess].replace(/-/g, "");

    key = key.toUpperCase();

    switch (key) {
      case "ENTER":
        if (guess.length == 5) {
          if (guess == answer) {
            alert("Hurray! You got it!");
          }
          curGuess += 1;
        }
        break;
      case "DELETE":
      case "BACKSPACE":
        if (guess.length > 0) {
          guess = guess.slice(0, guess.length - 1);
          guesses[curGuess] = guess + "-----".slice(guess.length);
        }
        break;
      default:
        if (/[A-Z]/.test(key) && key.length == 1 && guess.length < 5) {
          guess += key;
          guesses[curGuess] = guess + "-----".slice(guess.length);
        }
        break;
    }
  }

   /**
   * Resize guesses grid to fit the vertical space left
   * after subtracting the keyboard height, maintaining
   * an aspect ratio of 5:6 for the grid.
   */

   const GLOBAL_HEADER_HEIGHT = 56;

  function resize() {
    const appContent = gameplayEl.closest(".app-content");
    appContent.style.setProperty("height", `${window.innerHeight - GLOBAL_HEADER_HEIGHT}px`);
    const w = (gameplayEl.clientHeight - keyboardEl.clientHeight) * (5 / 6);
    const guessesWidth = Math.min(gameplayEl.clientWidth, 350, w);
    guessesEl.style.width = `${guessesWidth}px`;
    hidden = false;
  }

  onMount(resize);
</script>

<svelte:window on:keyup={({ key }) => handleKeyInput(key)} on:resize={resize} />

<Header {slug} />

<div class="gameplay" bind:this={gameplayEl}>
  <div class="guesses-wrapper" bind:this={guessesEl}>
    <div class="guesses" class:hidden>
      {#key curGuess}
        {#each guesses as guess, row}
          <div class="guess">
            {#each guess.split("") as letter, col}
              <div class={guessFeedbackClass(letter, row, col)}>
                {letter.replace("-", "")}
              </div>
            {/each}
          </div>
        {/each}
      {/key}
    </div>
  </div>

  <div class="keyboard" bind:this={keyboardEl}>
    {#key curGuess}
      {#each keyRows as row, r}
        <div class="key-row">
          {#if r == 1}
            <div class="spacer" />
          {/if}
          {#each row as key, k}
            {#if key == "d"}
              <button class="key delete" on:pointerup={() => handleKeyInput("DELETE")}
                >Del</button
              >
            {:else if key == "e"}
              <button class="key enter" on:pointerup={() => handleKeyInput("ENTER")}
                >Ent</button
              >
            {:else}
              <button
                class={keyFeedbackClass(key)}
                on:pointerup={() => handleKeyInput(key)}>{key}</button
              >
            {/if}
          {/each}
          {#if r == 1}
            <div class="spacer" />
          {/if}
        </div>
      {/each}
    {/key}
  </div>
</div>

<!-- {#if $showHowToPlay}
  <HowToPlay />
{:else if $showStatistics}
  <Statistics />
{:else if $showSettings}
  <Settings />
{/if} -->

<style lang="scss">
  .gameplay {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    height: calc(100% - 51px);
    margin: 0 auto;
    max-width: 500px;
    width: 100%;
  }

  /* GUESSES */
  .guesses-wrapper {
    display: flex;
    flex-direction: column;
    flex: 1;
    justify-content: center;
    margin: 0 auto;
    // min-width: 300px;
  }
  .guesses {
    display: grid;
    grid-template-rows: repeat(6, 1fr);
    grid-gap: 0.4rem;
    padding: 8px;

    &.hidden {
      visibility: hidden;
    }
  }
  .guess {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-gap: 0.4rem;
  }
  .letter {
    align-items: center;
    aspect-ratio: 1 / 1;
    border: 2px solid lightgray;
    display: flex;
    font-size: 1.85rem;
    font-weight: 700;
    justify-content: center;

    @media (max-width: 350px) {
      font-size: 1.45rem;
    }
  }

  /* KEYBOARD */

  .key-row {
    display: flex;
    margin: 6px;

    @media (min-width: 480px) {
      margin: 8px;
    }
  }

  .key-row button {
    background-color: lightgray;
    border: none;
    border-radius: 4px;
    color: #2c2c2c;
    flex: 1;
    font-size: 1.15rem;
    font-weight: 700;
    height: 58px;
    margin-right: 6px;
    padding: 0;

    &.enter,
    &.delete {
      flex: 1.5;
    }

    &:last-of-type {
      margin-right: 0;
    }

    @media (min-width: 480px) {
      font-size: 1.25rem;
      margin-right: 8px;
    }

    @media (max-width: 350px) {
      height: 52px;
    }
  }
  .spacer {
    flex: 0.5;
  }

  /* FEEDBACK */
  .pending {
    border-color: #838383;
  }
  .correctposition,
  .key-row button.correctposition {
    border-color: indigo;
    background-color: indigo;
    color: white;
  }
  .wrongposition,
  .key-row button.wrongposition {
    border-color: goldenrod;
    background-color: goldenrod;
    color: white;
  }
  .notfound,
  .key-row button.notfound {
    border-color: gray;
    background-color: gray;
    color: white;
  }
</style>
