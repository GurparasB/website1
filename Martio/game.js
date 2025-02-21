var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");

// Game objects
var mario = {
  x: 50,
  y: 250,
  width: 20,
  height: 50,
  speed: 0, // speed
  maxSpeed: 3, // max speed
  acceleration: 0.1, // Acc rate
  deceleration: 0.1, // Deacc rate
  vy: 0, // vertical velocity
  gravity: 0.5, // grav
  jumpForce: -10, // jump force
  airGravity: 0.25, // air gravity
  canJump: true, // indicates if Mario can jump
  jumpCooldown: 150, // cooldown between jumps
  lastJumpTime: 0 // time of last jump
};

var parkour = [
  { x: 100, y: 220, width: 80, height: 10, scored: false }, // parkour platforms
  { x: 250, y: 180, width: 80, height: 10, scored: false } // parkour platforms
];

var floor = { x: 0, y: 300, width: canvas.width / 4, height: 20 }; // floor platform covering the first quarter

var score = 0; //  score variable

function drawMario() {
  // Body
  ctx.fillStyle = "#FF0000"; // Bright red for the shirt
  ctx.fillRect(mario.x, mario.y + 20, mario.width, 30);

  
}

function drawParkour() {
  // Set the fill style to green for parkour platforms
  ctx.fillStyle = "green";
  // Loop through each parkour platform and draw it
  parkour.forEach(function(platform) {
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);

    // Add barrier under the platform
    ctx.fillStyle = "blue";
    ctx.fillRect(platform.x, platform.y + platform.height, platform.width, 5);
  });
}

function drawFloor() {
  // Set the fill style to brown for the floor platform
  ctx.fillStyle = "brown";
  // Draw the floor platform
  ctx.fillRect(floor.x, floor.y, floor.width, floor.height);
}

function drawScore() {
  // Draw score on canvas
  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, canvas.width - 120, 30);

  // Draw top score on canvas
  ctx.fillText("Top Score: " + getTopScore(), canvas.width - 180, 60);
}

function clearCanvas() {
  // Draw sky
  ctx.fillStyle = "skyblue";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function updateGame() {
  clearCanvas();
  drawMario();
  updatePlatforms(); // Update positions of moving platforms
  drawParkour();
  drawFloor();
  drawScore(); // Draw score on canvas
  mario.y += mario.vy;
  if (mario.y + mario.height > floor.y) { // if Mario hits the floor
    mario.y = floor.y - mario.height;
    mario.vy = 0;
  } else {
    mario.vy += mario.gravity;
  }
  checkCollision();

  // Generate new platforms as Mario progresses
  const lastPlatform = parkour[parkour.length - 1];
  if (mario.x > lastPlatform.x - 500) { // Example condition, adjust as needed
    addNewPlatforms();
  }

  // Draw reset message if flag is true
  if (showResetMessage) {
    ctx.fillStyle = "black";
    ctx.font = "16px Arial";
    ctx.fillText("Game Reset!", 10, 30); // Adjust position as needed
  }

  removeOffScreenPlatforms(); // Clean up off-screen platforms

  window.requestAnimationFrame(updateGame);
}

var scrolledDistance = 0; // This tracks the total horizontal distance scrolled

function resetMario() {
  // Reset Mario's position to the beginning
  mario.x = 50;
  mario.y = 250;
  mario.vy = 0;
  // Reset game world elements
  initializeGameElements();

  // Optionally, show a reset message as previously described
  showResetMessage = true;
  setTimeout(() => {
    showResetMessage = false;
  }, 2000); // Hide the message after 2 seconds
}

var gracePeriod = 0;

function checkCollision() {
  // Check collision with parkour
  var onPlatform = false;

  parkour.forEach(function(platform) {
    if (
      mario.x < platform.x + platform.width &&
      mario.x + mario.width > platform.x &&
      mario.y < platform.y + platform.height &&
      mario.y + mario.height > platform.y
    ) {
      // Collision detected with the platform
      onPlatform = true;

      // Check if player's bottom side is colliding with the top side of the platform
      if (mario.vy > 0 && mario.y + mario.height > platform.y && mario.y < platform.y) {
        // Move player's bottom to the top of the platform
        mario.y = platform.y - mario.height;
        // Stop player from moving downwards
        mario.vy = 0;
      }
      // Prevent Mario from jumping through the bottom of the platform
      else if (mario.vy < 0 && mario.y < platform.y + platform.height && mario.y + mario.height > platform.y + platform.height) {
        // Adjust Mario's position to be just below the platform
        mario.y = platform.y + platform.height;
        // Stop Mario from moving upwards
        mario.vy = 0;
      }

      // If the platform hasn't been scored yet, increase score
      if (!platform.scored) {
        score++;
        platform.scored = true; // Mark platform as scored
      }
    }
  });

  if (!onPlatform) {
    // If not on a platform, reset grace period
    gracePeriod = 0;
  } else {
    gracePeriod = 10; // Set the grace period (adjust as needed)
  }

  // Check if Mario falls off the platforms (touches the bottom of the screen)
  if (mario.y + mario.height > canvas.height) {
    resetMario(); // Teleport Mario back to the starting position
  }

  // Update top score if the current score exceeds it
  if (score > getTopScore()) {
    saveTopScore();
  }
}

updateGame();

// Event listener for keyboard events
var keys = {};
window.addEventListener("keydown", function(e) {
  keys[e.key] = true;
  if (e.key === "r" || e.key === "R") {
    resetMario();
    showResetMessage = true;
    setTimeout(() => {
      showResetMessage = false;
    }, 2000); // Hide the message after 2 seconds
  }
});
window.addEventListener("keyup", function(e) {
  keys[e.key] = false;
});

var scrollThreshold = canvas.width / 3; // Start scrolling when Mario is halfway across the canvas

function checkKeys() {
  if (keys["ArrowLeft"] || keys["a"]) {
    if (mario.x > scrollThreshold / 2) {
      mario.speed -= mario.acceleration;
    } else {
      // Move everything else to the right
      parkour.forEach(platform => platform.x += mario.maxSpeed);
      floor.x += mario.maxSpeed;
      scrolledDistance -= mario.maxSpeed; // Update scrolled distance
    }
  }
  if (keys["ArrowRight"] || keys["d"]) {
    if (mario.x < scrollThreshold) {
      mario.speed += mario.acceleration;
    } else {
      // Move everything else to the left
      parkour.forEach(platform => platform.x -= mario.maxSpeed);
      floor.x -= mario.maxSpeed;
      scrolledDistance += mario.maxSpeed; // Update scrolled distance
    }
  }

  // Decelerate Mario when no movement keys are pressed
  if (!keys["ArrowLeft"] && !keys["a"] && !keys["ArrowRight"] && !keys["d"]) {
    if (mario.speed > 0) {
      mario.speed -= mario.deceleration;
    } else if (mario.speed < 0) {
      mario.speed += mario.deceleration;
    }
  }

  // Clamp Mario's speed to his maximum speed
  mario.speed = Math.max(Math.min(mario.speed, mario.maxSpeed), -mario.maxSpeed);

  // Move Mario based on his speed
  mario.x += mario.speed;

  // Check if Mario is on a platform
  var onPlatform = mario.y + mario.height >= floor.y;
  parkour.forEach(function(platform) {
    if (
      mario.x < platform.x + platform.width &&
      mario.x + mario.width > platform.x &&
      mario.y + mario.height >= platform.y
    ) {
      onPlatform = true;
    }
  });

  // Allow Mario to jump if he is on a platform and not in cooldown
  if ((keys["ArrowUp"] || keys["w"]) && onPlatform && mario.canJump) {
    mario.vy = mario.jumpForce; // apply jump force
    mario.gravity = mario.airGravity; // lower gravity while in the air
    mario.canJump = false; // set jump cooldown
    mario.lastJumpTime = Date.now(); // record the time of the jump
  } else {
    mario.gravity = 0.5; // reset gravity to default if not jumping
  }

  // Check for jump cooldown
  if (!mario.canJump) {
    var currentTime = Date.now();
    if (currentTime - mario.lastJumpTime >= mario.jumpCooldown) {
      mario.canJump = true; // reset jump cooldown
    }
  }

  // Check if Mario has moved off the edge of the screen
  if (mario.x < 0) {
    mario.x = canvas.width;
  } else if (mario.x > canvas.width) {
    mario.x = 0;
  }

  // Check if Mario is in the non-red zone
  if (mario.x > floor.width && mario.y + mario.height > floor.y - mario.height) {
    resetMario(); // Teleport Mario back to the starting position
  }

  window.requestAnimationFrame(checkKeys);
}

var showResetMessage = false;

function initializeGameElements() {
  // Reset parkour platforms to their initial positions
  parkour = [
    { x: 100, y: 220, width: 80, height: 10, scored: false },
    { x: 250, y: 180, width: 80, height: 10, scored: false }
  ];

  // Reset the floor to its initial position
  floor = { x: 0, y: 300, width: canvas.width / 4, height: 20 };

  // Reset scrolled distance
  scrolledDistance = 0;

  // Reset score
  score = 0;
}

// At the start of your game, initialize elements
initializeGameElements();

function addNewPlatforms() {
  // Get the last platform's position to know where to start adding new ones
  const lastPlatform = parkour[parkour.length - 1];

  // Adjust the gap to be at most 100 pixels
  const newPlatformX = lastPlatform.x + lastPlatform.width + Math.random() * 50 + 50; // Gap between 50 and 100 pixels
  const newPlatformY = Math.random() * (canvas.height - 200) + 100; // Random Y position, keeping platforms within reachable bounds
  const newPlatformWidth = Math.random() * 60 + 20; // Random width between 20 and 80 pixels

  const newPlatform = {
    x: newPlatformX,
    y: newPlatformY,
    width: newPlatformWidth,
    height: 10, // Keeping height constant for simplicity
    scored: false // Initialize scored flag
  };

  parkour.push(newPlatform);
}

checkKeys();

function removeOffScreenPlatforms() {
  parkour = parkour.filter(platform => platform.x + platform.width > 0);
}

function addMovingPlatform() {
  const lastPlatform = parkour[parkour.length - 1];
  const newPlatform = {
    x: lastPlatform.x + lastPlatform.width + 200,
    y: Math.random() * (canvas.height - 200) + 100,
    width: 80,
    height: 10,
    moving: true,
    speed: 2 // Speed can be positive (right) or negative (left)
  };

  parkour.push(newPlatform);
}

function updatePlatforms() {
  parkour.forEach(platform => {
    if (platform.moving) {
      platform.x += platform.speed;
      // Optional: Change direction at edges
      if (platform.x < 0 || platform.x + platform.width > canvas.width) {
        platform.speed *= -1; // Reverse direction
      }
    }
  });
}

function saveTopScore() {
  localStorage.setItem("topScore", score);
}

function getTopScore() {
  return localStorage.getItem("topScore") || 0;
}