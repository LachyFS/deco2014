let box = document.querySelector("#box");
let title = document.querySelector(".task");
let details = document.querySelector("#details");
details.style.display = "none";
let defaultSize = box.style.height;
let state = false;
title.addEventListener("click", ()=>{
    state = !state;
    if (state) details.style.display = "inline";
    else details.style.display = "none";
});
if (window.location.href.includes("completed")) {
    box.style.background = "rgb(186, 255, 171)";
    title.textContent += " ✓";
    let button = document.querySelector(".button");
    button.style.display = "none";
}

//# sourceMappingURL=index.003f71dd.js.map
