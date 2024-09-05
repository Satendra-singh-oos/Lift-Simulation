const floorInput = document.querySelector("#floor");
const liftInput = document.querySelector("#lift");

function clearInput(inputElement) {
  inputElement.value = "";
}

function validateNumericInput(inputElement) {
  const value = inputElement.value;
  // Check if the value contains anything other than numbers
  const numericREGEX = /^[0-9]*$/; // Allow only numeric characters (0-9)

  if (!numericREGEX.test(value) && value !== "") {
    alert("Please enter only numeric values");
    clearInput(inputElement); // Reset the input field after showing the alert
    return false;
  }
  return true;
}

document.querySelector("#floor").addEventListener("input", function (event) {
  validateNumericInput(event.target);
});

document.querySelector("#lift").addEventListener("input", function (event) {
  validateNumericInput(event.target);
});

/* Logic */
let lifts = [];
let waitingLiftsQueue = [];
let activeRequestsForLift = new Set(); // Track active lift requests by floor ID
let activeUpRequests = new Set(); // Tracks active up requests by floor ID
let activeDownRequests = new Set();
let inputForm = document.querySelector(".input-form");
const generateButton = document.querySelector("#genrateFloorAndLift");

function genrateAlertError(str) {
  alert(str);
  return;
}

function validateInput(noOfFloors, numLifts) {
  if (isNaN(noOfFloors) || isNaN(numLifts)) {
    genrateAlertError(
      "Input fields cannot be empty Or Other Then Number not allowed"
    );

    return false;
  } else if (noOfFloors <= 0 || numLifts <= 0) {
    genrateAlertError(
      "Number of floors and number of lifts can't be zero or negative"
    );
    return false;
  } else if (noOfFloors < numLifts) {
    genrateAlertError(
      "Number of floors can't be less than the number of lifts."
    );
    return false;
  } else if (noOfFloors > 130) {
    genrateAlertError(
      `Not Serving 
       FUN FACT :The tallest lift (elevator) in a building is 578.5 m (1,898 ft 1 in) high, achieved by high-speed elevator NexWay, designed by Mitsubishi Electric Corporation (Japan) and installed at the Shanghai Tower Unit FR/FLH1 and 2 (China), on 27 October 2015. It is installed in the 632 m (2,073 ft 5 in) tall Shanghai Tower, travelling 124 of its 127 stories. src = ${"https://www.guinnessworldrecords.com/world-records/106868-tallest-elevator-in-a-building"}`
    );
  } else {
    return true;
  }
}

function getIdForLiftOrFloor(id) {
  return parseInt(id.split("-")[1]);
}

function handleWaitingQueue() {
  if (waitingLiftsQueue.length > 0) {
    const nextRequest = waitingLiftsQueue.shift();
    const nearestAvailableLift = findNearestAvailableLift(nextRequest.floorId);

    if (nearestAvailableLift) {
      moveLift(nearestAvailableLift, nextRequest.floorId);
    } else {
      // If no lift is available, re-add the request to the queue
      waitingLiftsQueue.unshift(nextRequest);
    }
  }
}

function moveLift(lift, requestedFloorId, direction) {
  lift.isBusy = true;
  if (direction === "up") {
    activeUpRequests.add(requestedFloorId);
  } else {
    activeDownRequests.add(requestedFloorId);
  }

  const floorsToMove = Math.abs(requestedFloorId - lift.currFloor);
  const timeToMoveLift = floorsToMove * 2;

  const liftElement = document.getElementById(lift.liftId);
  const leftDoor = liftElement.querySelector(".left-door");
  const rightDoor = liftElement.querySelector(".right-door");

  let floorHeight = 300;
  const liftHeight = 80;
  const offset = (floorHeight - liftHeight) / 2;

  liftElement.style.transition = `transform ${timeToMoveLift}s ease-in-out`;

  // Adjust the lift position to center it on the floor
  liftElement.style.transform = `translateY(-${
    requestedFloorId * floorHeight + offset
  }px)`;

  setTimeout(() => {
    lift.currFloor = requestedFloorId;

    // Open doors
    leftDoor.style.transform = `translateX(-100%)`;
    rightDoor.style.transform = `translateX(100%)`;

    setTimeout(() => {
      // Close doors
      leftDoor.style.transform = `translateX(0)`;
      rightDoor.style.transform = `translateX(0)`;

      setTimeout(() => {
        // After doors close, lift becomes available again
        lift.isBusy = false;
        if (direction === "up") {
          activeUpRequests.delete(requestedFloorId);
        } else {
          activeDownRequests.delete(requestedFloorId);
        }
        handleWaitingQueue(); // Check if there are any pending requests
      }, 2500); // Wait for doors to close
    }, 2500); // Doors stay open for 2.5s
  }, timeToMoveLift * 1000); // Wait for the lift to reach the requested floor
}

function findNearestAvailableLift(requestedFloorId) {
  let nearestLift = null;
  let shortestDistance = Infinity;

  for (let i = 0; i < lifts.length; i++) {
    const lift = lifts[i];
    if (!lift.isBusy) {
      const distance = Math.abs(lift.currFloor - requestedFloorId);
      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearestLift = lift;
      }
    }
  }
  return nearestLift;
}

function handleLiftRequest(event) {
  const requestedFloorId = getIdForLiftOrFloor(event.target.id);
  const direction = event.target.classList.contains("upBtn") ? "up" : "down";

  // Check if the request is already active for the specific direction
  if (
    (direction === "up" && activeUpRequests.has(requestedFloorId)) ||
    (direction === "down" && activeDownRequests.has(requestedFloorId))
  ) {
    return;
  }

  const nearestAvailableLift = findNearestAvailableLift(requestedFloorId);
  if (nearestAvailableLift) {
    moveLift(nearestAvailableLift, requestedFloorId, direction);
  } else {
    waitingLiftsQueue.push({
      floorId: requestedFloorId,
      direction: direction,
    });
  }
}

const genrateFloorAndLift = () => {
  const building = document.querySelector(".building");
  const noOfFloor = Number(document.querySelector("#floor").value);
  const noOfLift = Number(document.querySelector("#lift").value);
  // Validation check
  if (!validateInput(noOfFloor, noOfLift)) {
    generateButton.disabled = false;
    generateButton.innerText = "Generate";
    return;
  }

  const liftWidth = 80; // Width of each lift
  const liftMargin = 40; // Total horizontal margin for each lift
  const calculatedWidth = (liftWidth + liftMargin) * noOfLift;
  const minWidth = 500; // Minimum width to ensure floors are visible on smaller screens
  const floorWidth = Math.max(calculatedWidth, minWidth);

  for (let i = noOfFloor; i >= 0; i--) {
    const floorDiv = document.createElement("div");
    floorDiv.classList.add("floor");
    floorDiv.style.width = `${floorWidth}px`;

    const floorInfo = document.createElement("div");
    floorInfo.classList.add("floor-info");

    const spanText = document.createElement("span");
    spanText.innerText = `floor-${i}`;
    floorInfo.appendChild(spanText);

    if (i < noOfFloor) {
      const upBtn = document.createElement("button");
      upBtn.classList.add("upBtn");
      upBtn.id = `upBtn-${i}`;
      upBtn.innerText = "Up";
      floorInfo.appendChild(upBtn);
    }
    if (i != 0) {
      const downBtn = document.createElement("button");
      downBtn.classList.add("downBtn");
      downBtn.id = `downBtn-${i}`;
      downBtn.innerText = "Down";
      floorInfo.appendChild(downBtn);
    }

    floorDiv.appendChild(floorInfo);

    if (i === 0) {
      const liftContainer = document.createElement("div");
      liftContainer.classList.add("lift-container");

      for (let j = 0; j < noOfLift; j++) {
        const liftDiv = document.createElement("div");
        liftDiv.classList.add("lift");
        liftDiv.id = `lift-${j}`;

        const leftDoor = document.createElement("div");
        leftDoor.classList.add("door", "left-door");
        liftDiv.appendChild(leftDoor);

        const rightDoor = document.createElement("div");
        rightDoor.classList.add("door", "right-door");
        liftDiv.appendChild(rightDoor);

        liftContainer.appendChild(liftDiv);
      }

      floorDiv.appendChild(liftContainer);
    }

    // append child
    building.style.width = `${floorWidth}px`;

    building.appendChild(floorDiv);
  }

  // update the lifts array
  lifts = Array.from(document.querySelectorAll(".lift"), (el) => ({
    liftId: el.id,
    isBusy: false,
    currFloor: 0,
  }));

  // adding eventListern on the up btn and down btn
  document.querySelectorAll(".upBtn, .downBtn").forEach((button) => {
    button.addEventListener("click", handleLiftRequest);
  });

  generateButton.style.display = "none";

  const resetButton = document.createElement("button");
  resetButton.id = "resetButton";
  resetButton.innerText = "Reset";
  resetButton.addEventListener("click", () => {
    window.location.reload(); // Reload the page on button click
  });

  // Append the "Reset" button where the "Generate" button was
  inputForm.appendChild(resetButton);
  return;
};

inputForm.addEventListener("submit", function (event) {
  event.preventDefault();

  // generateButton.disabled = true;
  // generateButton.innerText = "Generating...";
  genrateFloorAndLift();
});
