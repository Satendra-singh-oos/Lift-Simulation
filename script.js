const inputForm = document.querySelector(".input-form");

const genrateFloorAndTable = () => {
  const noOfFloor = Number(document.querySelector("#floor").value);

  const noOfLift = Number(document.querySelector("#lift").value);

  const p = document.createElement("p");
  p.innerText = `Floors= ${noOfFloor} and noOf lifts = ${noOfLift}`;

  const ui = document.querySelector(".building");
  ui.appendChild(p);
};

inputForm.addEventListener("submit", function (event) {
  event.preventDefault();
  genrateFloorAndTable();
});
