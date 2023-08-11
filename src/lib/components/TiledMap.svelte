<script>
  export let mapId = "map-5";
  export let square = true;
  export let adjusted = true;

  const states = "AK,ME,VT,NH,WA,ID,MT,ND,MN,WI,MI,NY,MA,CT,RI,OR,NV,WY,SD,IA,IL,IN,OH,PA,NJ,CA,UT,CO,NE,MO,KY,WV,VA,MD,DE,AZ,NM,KS,AR,TN,NC,SC,DC,OK,LA,MS,AL,GA,HI,TX,FL,PR".split(",");
</script>

<div
  id={mapId}
  class="css-grid-map grid-container"
  class:square
  class:adjusted>
  {#each states as state}
  <div id={state} class="state">{state}</div>
  {/each}
</div>

<style>
  .grid-container {
    display: grid;
    grid-gap: 1px;
    grid-template-columns: repeat(12, 1fr);
    grid-template-rows: repeat(9, 1fr);
  }

  .one-to-one-aspect-ratio:after {
    content: "";
    display: inline-block;
    height: 0;
    padding-top: 100%;
    position: relative;
    width: 1px;
  }

  .state {
    background-color: #f2f2f2;
  }

  #map-1 .state {
    background-color: #ccc;
  }

  .square .state {
    background-color: #cccccc;
    font-size: 13px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .square .state:after {
    content: "";
    height: 0;
    padding-top: 100%;
    width: 1px;
  }

  #map-3 #ME {
    grid-column-start: 12;
  }

  .adjusted #ME {
    grid-column-start: 12;
  }
  .adjusted #VT {
    grid-column-start: 11;
  }
  .adjusted #WA,
  .adjusted #OR, .adjusted #CA {
    grid-column-start: 2;
  }
  .adjusted #AZ {
    grid-column-start: 3;
  }
  .adjusted #OK, .adjusted #TX {
    grid-column-start: 5;
  }
  .adjusted #HI {
    grid-column-start: 1;
  }
  .adjusted #FL {
    grid-column-start: 10;
  }
  .adjusted #PR {
    grid-column-start: 12;
  }

  .adjusted#map-5 #PR {
    grid-row-start: 9;
  }
</style>