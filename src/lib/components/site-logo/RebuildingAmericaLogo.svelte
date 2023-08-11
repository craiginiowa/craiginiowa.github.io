<div class="logo-wrapper">
<div class="logo-container"
    on:click="{ replay }">
    {#if visible}
    <svg xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 287 158"
      out:fade="{{delay: 250, duration: 500}}"
      on:outroend="{() => visible = true}"
      role="img">
      <defs>
        <clipPath id="clip-path">
          <path id="us-outline" d={usoutline} />
        </clipPath>
      </defs>
      <g id="crosshatch">
        {#each crosshatch as hatch, i}
        <path in:fade="{{delay: 700 + i * 35, duration: 100}}" d={hatch} />
        {/each}
      </g>
      <path id="us-map-outline" in:draw="{{duration: 2700, easing: linear}}" d={usoutline} />
      <g id="draft-marks" transform="translate(4.1 -0.48)">
        {#each draftmarks as mark, i}
        <line x1="{mark.x1}"
          y1="{mark.y1}"
          x2="{mark.x2}"
          y2="{mark.y2}"
          in:draw="{{delay: 1000 + i * 60, duration: 500}}"/>
        {/each}
      </g>
    </svg>
    <h1 class="logo-text"
      in:scale="{{delay: 1200, duration: 500, start: 1.8, opacity: 0, easing: quartOut}}"
      out:scale="{{duration: 350, start: .5, easing: quartOut}}">REBUILDING<br>AMERICA</h1>
    {/if}
  </div>
  <button class="replay-btn" on:click={ replay }>replay</button>
</div>

<script>
/**
 *  The logo should animate as follows:
 *  - Outline of U.S. border
 *  - Crosshatch from bottom to top
 *  - Draft lines, staggered start to end
 *  - Text fade in and scale from 1.5 to 1
 */
import { onMount } from "svelte";
import { fade, draw, scale } from "svelte/transition";
import { linear, quartOut } from "svelte/easing";
import { usoutline, crosshatch, draftmarks } from "./geometry";

let visible = false;

function replay() {
  visible = false;
}

onMount(() => {
  visible = true;
})

</script>

<style>
  @font-face {
      font-family: 'Unify Sans';
      src: url('https://cpt-static.gannettdigital.com/universal-web-client/master/latest/gallium/themes/assets/universal/fonts/UnifySans_W_Bd.woff2') format('woff2'),
           url('https://cpt-static.gannettdigital.com/universal-web-client/master/latest/gallium/themes/assets/universal/UnifySans_W_Bd.woff') format('woff');
      font-weight: normal;
      font-style: normal;
      font-weight: 900;
      font-display:swap;
  }

  .logo-wrapper {
    position: relative;
    width: 100%;
  }

  .logo-container {
    --rebuild-blue: var(--color-blue-dark, #0b32a1);
    --rebuild-light-blue: var(--color-blue-light, #039bff);
    margin: 0 auto;
    position: relative;
    width: 280px;
  }

  .logo-text {
    color: var(--rebuild-blue);
    cursor: default;
    font-family: "Unify Sans", sans-serif;
    font-size: 48px;
    font-weight: bold;
    left: 50%;
    letter-spacing: -.03em;      
    line-height: .8;
    margin: 0;
    position: absolute;
    text-align: center;
    text-shadow: 0px 4px 2px rgba(255, 255, 255, .8);
    top: 46%;
    transform: translate(-50%, -50%);
  }
  
  @media (min-width: 375px) {
    .logo-container {
      width: 335px;
    }
    .logo-text {
      font-size: 57px;
    }    
  }

  @media (min-width: 768px) {
    .logo-container {
      width: 420px;
    }
    .logo-text {
      font-size: 71px;
    }
  }

  svg {
    height: 100%;
    width: 100%;
  }

  #crosshatch path {
    clip-path: url(#clip-path);
    stroke: var(--rebuild-light-blue);
    stroke-width: 0.75;
  }

  #us-map-outline {
    fill: none;
    stroke: var(--rebuild-blue);
  }

  #draft-marks {
    stroke: var(--rebuild-blue);
    stroke-width: 0.75;
  }
  .replay-btn {
    left: 15px;
    top: 0;
    position: absolute;
    text-align: center;    
  }
</style>

