<script>
  import { showHowToPlay, showStatistics, showSettings } from "./store";

  $: disabled = $showHowToPlay || $showStatistics || $showSettings;
</script>

<div class="header">
  <div class="nothing-to-see-here" />
  <h1>Wordle-ish</h1>
  <div class="header-buttons">
    <button
      class="header-btn"
      on:click={() => ($showHowToPlay = true)}
      {disabled}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="header-btn-icon"
        height="28"
        width="28"
        viewBox="0 0 92 92"
      >
        <path
          d="M45.385,0.004C19.982,0.344-0.334,21.215,0.004,46.619c0.34,25.393,21.209,45.715,46.611,45.377  c25.398-0.342,45.718-21.213,45.38-46.615C91.655,19.986,70.785-0.335,45.385,0.004z M45.249,74l-0.254-0.004  c-3.912-0.116-6.67-2.998-6.559-6.852c0.109-3.788,2.934-6.538,6.717-6.538l0.227,0.004c4.021,0.119,6.748,2.972,6.635,6.937  C51.903,71.346,49.122,74,45.249,74z M61.704,41.341c-0.92,1.307-2.943,2.93-5.492,4.916l-2.807,1.938  c-1.541,1.198-2.471,2.325-2.82,3.434c-0.275,0.873-0.41,1.104-0.434,2.88l-0.004,0.451H39.429l0.031-0.907  c0.131-3.728,0.223-5.921,1.768-7.733c2.424-2.846,7.771-6.289,7.998-6.435c0.766-0.577,1.412-1.234,1.893-1.936  c1.125-1.551,1.623-2.772,1.623-3.972c0-1.665-0.494-3.205-1.471-4.576c-0.939-1.323-2.723-1.993-5.303-1.993  c-2.559,0-4.311,0.812-5.359,2.478c-1.078,1.713-1.623,3.512-1.623,5.35v0.457H27.935l0.02-0.477  c0.285-6.769,2.701-11.643,7.178-14.487C37.946,18.918,41.446,18,45.53,18c5.346,0,9.859,1.299,13.412,3.861  c3.6,2.596,5.426,6.484,5.426,11.556C64.368,36.254,63.472,38.919,61.704,41.341z"
        />
      </svg>
    </button>
    <button
      class="header-btn"
      on:click={() => ($showStatistics = true)}
      {disabled}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="header-btn-icon"
        height="28"
        width="28"
        viewBox="0 0 24 24"
      >
        <g>
          <rect x="8" y="14" width="6" height="10" />
          <rect x="0" y="10" width="6" height="14" />
          <rect x="16" y="4" width="6" height="20" />
        </g>
      </svg>
    </button>
    <button
      class="header-btn"
      on:click={() => ($showSettings = true)}
      {disabled}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="header-btn-icon"
        height="28"
        width="28"
        viewBox="0 0 22 22"
      >
        <path
          d="M 10.490234 2 C 10.011234 2 9.6017656 2.3385938 9.5097656 2.8085938 L 9.1757812 4.5234375 C 8.3550224 4.8338012 7.5961042 5.2674041 6.9296875 5.8144531 L 5.2851562 5.2480469 C 4.8321563 5.0920469 4.33375 5.2793594 4.09375 5.6933594 L 2.5859375 8.3066406 C 2.3469375 8.7216406 2.4339219 9.2485 2.7949219 9.5625 L 4.1132812 10.708984 C 4.0447181 11.130337 4 11.559284 4 12 C 4 12.440716 4.0447181 12.869663 4.1132812 13.291016 L 2.7949219 14.4375 C 2.4339219 14.7515 2.3469375 15.278359 2.5859375 15.693359 L 4.09375 18.306641 C 4.33275 18.721641 4.8321562 18.908906 5.2851562 18.753906 L 6.9296875 18.1875 C 7.5958842 18.734206 8.3553934 19.166339 9.1757812 19.476562 L 9.5097656 21.191406 C 9.6017656 21.661406 10.011234 22 10.490234 22 L 13.509766 22 C 13.988766 22 14.398234 21.661406 14.490234 21.191406 L 14.824219 19.476562 C 15.644978 19.166199 16.403896 18.732596 17.070312 18.185547 L 18.714844 18.751953 C 19.167844 18.907953 19.66625 18.721641 19.90625 18.306641 L 21.414062 15.691406 C 21.653063 15.276406 21.566078 14.7515 21.205078 14.4375 L 19.886719 13.291016 C 19.955282 12.869663 20 12.440716 20 12 C 20 11.559284 19.955282 11.130337 19.886719 10.708984 L 21.205078 9.5625 C 21.566078 9.2485 21.653063 8.7216406 21.414062 8.3066406 L 19.90625 5.6933594 C 19.66725 5.2783594 19.167844 5.0910937 18.714844 5.2460938 L 17.070312 5.8125 C 16.404116 5.2657937 15.644607 4.8336609 14.824219 4.5234375 L 14.490234 2.8085938 C 14.398234 2.3385937 13.988766 2 13.509766 2 L 10.490234 2 z M 12 8 C 14.209 8 16 9.791 16 12 C 16 14.209 14.209 16 12 16 C 9.791 16 8 14.209 8 12 C 8 9.791 9.791 8 12 8 z"
        />
      </svg>
    </button>
  </div>
</div>

<style lang="scss">
  .header {
    align-items: center;
    border-top: 1px solid lightgray;
    border-bottom: 1px solid lightgray;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 1rem;
    width: 100vw;

    @media (min-width: 480px) {
      padding: 0.5rem 2rem;
    }
  }

  .header > * {
    width: 44vw;
  }

  .nothing-to-see-here {
    display: none;

    @media (min-width: 480px) {
      display: block;
    }
  }

  h1 {
    font-family: AlfaSlabOne, serif;
    font-size: 1.5rem;
    line-height: 1;
    margin: 0;
    position: relative;
    text-align: center;
    top: 2px;
  }

  .header-buttons {
    align-items: center;
    display: flex;
    justify-content: flex-end;
  }

  .header-btn {
    background: none;
    border: none;
    cursor: pointer;

    &[disabled] {
      opacity: 0.35;
    }
  }
</style>
