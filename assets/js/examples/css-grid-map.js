(function () {
  document.addEventListener("DOMContentLoaded", () => {
    // states list in left-to-right, top-to-bottom order
    const states = "AK,ME,VT,NH,WA,ID,MT,ND,MN,WI,MI,NY,MA,CT,RI,OR,NV,WY,SD,IA,IL,IN,OH,PA,NJ,CA,UT,CO,NE,MO,KY,WV,VA,MD,DE,AZ,NM,KS,AR,TN,NC,SC,DC,OK,LA,MS,AL,GA,HI,TX,FL,PR".split(",");

    // append states to the map container
    function initMap(gridContainer) {
      let state;
      states.forEach(st => {
        state = document.createElement("div");
        state.id = st;
        state.classList.add("state");
        state.innerText = st;
        gridContainer.appendChild(state);
      });
    }

    // initialize all grid-containers on the page
    document.querySelectorAll(".grid-container").forEach(el => {
      initMap(el);
    });

  });
}())
