let box = document.querySelector("#box");
let title = document.querySelector(".task");
let details = document.querySelector("#details");
details.style.display = "none";
let defaultSize = box.style.height;
let state = false;
title.addEventListener("click", ()=>{
    state = !state;
    if (state) // box.style.height = "250px";
    details.style.display = "inline";
    else details.style.display = "none";
});

//# sourceMappingURL=index.d22a6819.js.map
