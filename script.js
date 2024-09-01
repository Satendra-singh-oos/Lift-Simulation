let lifts = [];
let waitingLiftsQueue = [];
let activeLiftsQueue = [];
let inputForm = document.querySelector(".input-form");
const generateButton = document.querySelector("#genrateFloorAndLift");

function genrateAlertError(str) {
  alert(str);
  return;
}

function validateInput(noOfFloors, numLifts) {
  if (noOfFloors == NaN || numLifts == NaN) {
    genrateAlertError("Input fields can not be empty");

    return false;
  } else if (noOfFloors <= 0 || numLifts <= 0) {
    genrateAlertError("Number of floors And Number of Lift can't be zero");
    return false;
  } else if (noOfFloors < numLifts) {
    genrateAlertError(
      "Number of floors can't be less than the number of lifts."
    );
    return false;
  } else {
    return true;
  }
}

const genrateFloorAndTable = () => {
  const building = document.querySelector(".building");
  const noOfFloor = Number(document.querySelector("#floor").value);
  const noOfLift = Number(document.querySelector("#lift").value);
  // Validation check
  if (!validateInput(noOfFloor, noOfLift)) {
    generateButton.disabled = false;
    generateButton.innerText = "Generate";
    return;
  }
  // create a div

  for (let i = noOfFloor; i >= 0; i--) {
    const floorDiv = document.createElement("div");
    floorDiv.classList.add("floor");

    const spanText = document.createElement("span");
    spanText.innerText = `floor-${i}`;

    floorDiv.appendChild(spanText);

    if (i < noOfFloor) {
      const upBtn = document.createElement("button");
      upBtn.classList.add("upBtn");
      upBtn.id = `upBtn-${i}`;
      upBtn.innerText = "Up";
      floorDiv.appendChild(upBtn);
    }
    if (i != 0) {
      const downBtn = document.createElement("button");
      downBtn.classList.add("downBtn");
      downBtn.id = `downBtn-${i}`;
      downBtn.innerText = "Down";
      floorDiv.appendChild(downBtn);
    }

    if (i === 0) {
      const liftContainer = document.createElement("div");
      liftContainer.classList.add("lift-container");

      for (let i = 0; i < noOfLift; i++) {
        const liftDiv = document.createElement("div");
        liftDiv.classList.add("lift");
        liftDiv.id = `lift-${i}`;
        liftContainer.appendChild(liftDiv);
      }

      floorDiv.appendChild(liftContainer);
    }

    // append child
    building.appendChild(floorDiv);
  }

  // update the lifts array

  lifts = Array.from(document.querySelectorAll(".lift"), (el) => ({
    leftId: el.id,
    isBusy: false,
    currFloor: 0,
  }));

  return;
};

inputForm.addEventListener("submit", function (event) {
  event.preventDefault();

  generateButton.disabled = true;
  generateButton.innerText = "Generating...";
  genrateFloorAndTable();
});
