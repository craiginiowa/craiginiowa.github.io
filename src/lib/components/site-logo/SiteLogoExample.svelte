<script>
  import { base } from "$app/paths";
  import { onMount, tick } from "svelte";
  import { draw, fade } from "svelte/transition";
  import { quartOut } from "svelte/easing";

  export let animate = "all";

  const paths = [
    "M20.761,31.92C18.552,34.372,15.13,36,11.24,36C4.047,36,0,30.587,0,23.268 c0-8.014,5.047-12.732,12.128-12.732c3.245,0,6.191,1.337,8.367,3.515l-1.664,2.273c-0.492,0.679-1.475,0.625-2.007,0.295 s-2.312-1.518-4.78-1.518s-5.972,1.649-5.972,8.13s3.682,8.196,5.724,8.196c2.625,0,3.875-0.883,5.185-1.872 c0.825-0.623,1.576-0.431,2.076,0.204L20.761,31.92z",
    "M24.552,35.592V10.968h3.48c0.607,0,1.031,0.112,1.271,0.336c0.239,0.224,0.398,0.608,0.479,1.152 l0.359,2.976c0.88-1.52,1.912-2.72,3.097-3.6c1.184-0.88,2.512-1.32,3.983-1.32c1.216,0,2.224,0.28,3.023,0.84l-0.769,4.44 c-0.048,0.288-0.152,0.492-0.312,0.612c-0.16,0.12-0.376,0.18-0.647,0.18c-0.239,0-0.567-0.056-0.983-0.168 c-0.417-0.112-0.969-0.168-1.656-0.168c-1.231,0-2.288,0.34-3.168,1.02c-0.88,0.681-1.624,1.676-2.231,2.988v15.336H24.552z",
    "M62.759,35.592h-2.663c-1.507,0-1.881-0.76-2.04-1.272l-0.527-1.752c-1.94,1.852-4.523,3.408-8.136,3.408 c-4.971,0-7.152-2.973-7.152-6.694c0-5.654,7.431-7.779,14.735-7.754v-1.451c0-3.657-2.012-4.885-4.08-4.885 c-2.391,0-4.976,1.624-5.376,1.848c-1.181,0.756-2.431,0.38-3.047-0.744l-1.08-1.896c2.832-2.592,6.248-3.888,10.248-3.888 c6.864,0,9.119,5.241,9.119,9.528L62.759,35.592L62.759,35.592z M51.239,31.896c1.599,0,3.891-0.601,5.735-2.623v-4.122 c-5.678-0.148-9.071,1.436-9.071,3.819C47.903,31.17,49.755,31.896,51.239,31.896z",
    "M75.75,3.858c0,2.071-1.679,3.75-3.75,3.75c-2.071,0-3.75-1.679-3.75-3.75s1.679-3.75,3.75-3.75 C74.071,0.108,75.75,1.787,75.75,3.858z M68.975,10.968v24.624h5.929V10.968H68.975z",
    "M90.12,10.536c1.672,0,4.172,0.432,5.521,1.272h7.08v2.208c0,0.672-0.403,0.961-1.272,1.296L99.24,15.72 c0.969,2.076,0.623,6.447-2.243,8.592c-2.872,2.149-7.08,2.566-9.589,1.896c-0.768,0.467-1.151,0.991-1.151,1.571 c0,1.058,1.741,1.499,2.484,1.596c0.744,0.097,4.443,0.204,5.436,0.266c2.447,0.154,7.921,0.987,7.921,6.019 c0,4.371-4.514,8.596-11.904,8.596c-7.276,0-10.992-3.045-10.992-6.503c0-2.5,2.008-4.167,3.985-4.776 c-1.353-0.724-2.017-1.849-2.017-3.528c0-1.575,1.414-3.654,3.191-4.32c-2.402-1.417-4.007-3.625-4.007-6.624 C80.354,14.503,83.542,10.536,90.12,10.536z M96.624,36.625c0-1.705-2.138-2.426-5.46-2.426c-0.744,0-1.513,0-2.305,0 s-1.556-0.088-2.292-0.264c-0.672,0.368-2.231,1.36-2.231,3.048c0,1.729,1.831,3.048,5.952,3.048 C94.875,40.031,96.624,38.336,96.624,36.625z M90.12,22.68c2.797,0,4.366-1.76,4.366-4.032c0-1.853-0.902-3.96-4.367-3.96 c-3.369,0-4.368,2.19-4.368,3.96C85.751,20.378,86.917,22.68,90.12,22.68z",
    "M113.599,3.858c0,2.071-1.679,3.75-3.75,3.75c-2.07,0-3.75-1.679-3.75-3.75s1.68-3.75,3.75-3.75 C111.921,0.108,113.599,1.787,113.599,3.858z M106.823,10.968v24.624h5.929V10.968H106.823z",
    "M119.447,35.592V10.968h3.624c0.768,0,1.271,0.36,1.512,1.08l0.408,1.944 c1.885-1.905,4.343-3.408,7.608-3.408c3.651,0,8.304,2.086,8.304,9.336v15.672h-5.928V19.92c0-1.504-0.35-2.668-1.044-3.492 c-0.696-0.824-1.74-1.236-3.134-1.236c-1.022,0-1.982,0.232-2.88,0.696c-0.896,0.464-1.744,1.096-2.544,1.896v17.808H119.447z",
    "M1.821,49.195h8.521V84.59H1.821V49.195z M1.357,36.353c-1.143,2.026-0.893,5.942,2.652,7.442 c2.913,1.167,6.58-0.333,7.496-3.859C7.798,40.082,4.089,39.087,1.357,36.353z",
    "M35.079,48.642c10.843,0,17.457,7.611,17.457,18.183c0,7.304-3.572,18.284-17.457,18.284 c-12.74,0-17.561-9.855-17.561-18.284C17.518,55.628,24.422,48.642,35.079,48.642z M35.079,78.554c7.177,0,8.659-6.426,8.659-11.661 c0-4.869-1.232-11.73-8.659-11.73c-7.823,0-8.763,7.175-8.763,11.73C26.316,72.67,28.006,78.554,35.079,78.554z",
    "M54.882,49.195h6.764c0.644,0,1.184,0.149,1.621,0.448c0.437,0.3,0.713,0.68,0.828,1.139 c0,0,5.786,21.264,6.243,24.479c0.938-3.097,7.591-24.55,7.591-24.55c0.139-0.459,0.413-0.838,0.827-1.139 c0.414-0.298,0.897-0.447,1.449-0.447h3.761c0.621,0,1.14,0.149,1.554,0.447c0.413,0.301,0.688,0.68,0.827,1.139 c0,0,6.504,21.794,7.314,24.584c0.438-2.938,6.521-24.514,6.521-24.514c0.114-0.459,0.391-0.839,0.827-1.139 c0.438-0.299,0.942-0.448,1.519-0.448h6.452L97.766,84.59H90.9c-0.736,0-1.267-0.506-1.587-1.518c0,0-7.245-22.934-7.384-24.195 c-0.174,1.324-7.451,24.195-7.451,24.195c-0.322,1.012-0.943,1.518-1.863,1.518h-6.521L54.882,49.195z",
    "M140.902,84.5h-3.804c-2.154,0-2.688-1.086-2.915-1.816l-0.754-2.502c-2.771,2.645-6.461,4.868-11.622,4.868 c-7.101,0-10.217-4.248-10.217-9.562c0-8.077,10.616-11.113,21.051-11.078v-2.072c0-5.224-2.876-6.979-5.83-6.979 c-3.415,0-7.107,2.321-7.679,2.642c-1.688,1.079-3.474,0.542-4.354-1.064l-1.542-2.708c4.046-3.701,8.925-5.554,14.64-5.554 c9.806,0,13.026,7.487,13.026,13.61L140.902,84.5L140.902,84.5z M124.447,79.222c2.283,0,5.557-0.858,8.192-3.746v-5.891 c-8.111-0.211-12.958,2.051-12.958,5.456C119.681,78.184,122.326,79.222,124.447,79.222z",
  ];

  let el = null;
  let visible = false;
  let done = false;

  const wordCloud =
    ("developer • graphic/artist • illustrator •/copy editor • other/assorted activities").split("");

  const buttonName = {
    logo: "replay site name animation",
    cloud: "replay word cloud animation",
    all: "replay all",
  };

  $: if (!visible) {
    done = false;
  }

  async function replay() {
    done = false;
    visible = false;
    await tick();
    visible = true;
  }

  onMount(() => {
    setTimeout(() => (visible = true), 500);
  });
</script>

<div class="site-logo" bind:this={el}>
  <div class="billboard" class:done>
    {#if animate == "all"}
      <div class="animated-border" class:visible />
    {/if}
    {#if visible}
      {#if animate == "all" || animate == "cloud"}
        <div
          class="skills-cloud"
          out:fade={{ duration: 10 }}
          on:outroend={() => (visible = true)}
        >
          {#each wordCloud as letter, i}
            {#if letter == "•"}
              <span
                in:fade|global={{
                  delay: Math.random() * 2500 + 1000,
                  duration: 100,
                }}>&bull;</span
              >
            {:else if letter == "/"}
              <br />
            {:else}
              <span
                in:fade|global={{
                  delay: Math.random() * 2500 + 1000,
                  duration: 100,
                }}
                on:introend={() => {
                  if (animate == "cloud" && i == wordCloud.length - 1) {
                    done = true;
                  }
                }}>{letter}</span
              >
            {/if}
          {/each}
        </div>        
      {:else}
        <div
          class="skills-cloud"
          out:fade={{ duration: 10 }}
          on:outroend={() => (visible = true)}
        >
          developer &bull; graphic<br />artist &bull; illustrator &bull;<br
          />copy editor &bull; other<br />assorted activities
        </div>
      {/if}
      <div class="craiginiowa-logo">
        {#if animate == "cloud"}
          <img src="{base}/img/craiginiowa.svg" alt="craiginiowa logo"/>
        {:else}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="-2 -1 143.512 87.109"
          >
            {#each paths as path, i}
              {#if i == 5 || i == 6}
                <path
                  in:draw|global={{ delay: i * 200, duration: 1000 }}
                  opacity="0.5"
                  d={path}
                />
              {:else if i == 10}
                <path
                  in:draw|global={{ delay: 2500, duration: 1000 }}
                  on:introend={() => (done = true)}
                  d={path}
                />
              {:else}
                <path
                  in:draw|global={{ delay: i * 200, duration: 1000 }}
                  d={path}
                />
              {/if}
            {/each}
          </svg>
        {/if}
      </div>
    {/if}
  </div>
  <div class="toggle-container">
    {#if done}
      <button on:click={replay} in:fade|global={{ delay: 2000 }}>
        {buttonName[animate]}
      </button>
    {/if}
  </div>
</div>

<style lang="scss">
  .site-logo {
    background-color: #900;
    background-image: none;
    color: #fff;
    padding: 30px;
    position: relative;
  }
  .billboard {
    align-items: center;
    border: 1px solid #fff;
    box-sizing: border-box;
    display: flex;
    height: 130px;
    justify-content: center;
    margin: 0;
    padding: 18px;
    position: relative;
  }
  .skills-cloud {
    font-size: 13px;
    line-height: 1.35;
    text-align: right;

    :global(span) {
      display: inline;
    }

    @media (min-width: 768px) {
      font-size: 16px;
    }
  }
  :global(.animate-all) .billboard {
    border-color: transparent;
  }
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
  .craiginiowa-logo {
    margin-left: 24px;
  }
  svg {
    height: 100%;
    width: 100%;
  }
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
  .toggle-container {
    left: 15px;
    top: -15px;
    position: absolute;
    text-align: center;
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
  @media (min-width: 768px) {
    .craiginiowa-logo {
      width: 142px;
    }
    svg path {
      stroke-width: 0.05em;
    }
  }
  .toggle-container {
    left: 15px;
    top: -15px;
    position: absolute;
    text-align: center;
  }
</style>
