const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Game constants
const GRID_SIZE = 20;
const PACMAN_SIZE = GRID_SIZE;
const GHOST_SIZE = GRID_SIZE;
const DOT_SIZE = GRID_SIZE / 4;
const FPS = 10;

// Game variables
let pacman = { x: 10, y: 10, dir: { x: 0, y: 0 } };
let ghosts = [
    { x: 5, y: 5 },
    { x: 15, y: 5 },
    { x: 5, y: 15 },
    { x: 15, y: 15 },
];
let dots = [];
let score = 0;

// Initialize dots
for (let x = 0; x < canvas.width; x += GRID_SIZE) {
    for (let y = 0; y < canvas.height; y += GRID_SIZE) {
        dots.push({ x: x + GRID_SIZE / 2, y: y + GRID_SIZE / 2 });
    }
}

// Handle keyboard input
document.addEventListener("keydown", (e) => {
    switch (e.key) {
        case "ArrowUp":
            pacman.dir = { x: 0, y: -1 };
            break;
        case "ArrowDown":
            pacman.dir = { x: 0, y: 1 };
            break;
        case "ArrowLeft":
            pacman.dir = { x: -1, y: 0 };
            break;
        case "ArrowRight":
            pacman.dir = { x: 1, y: 0 };
            break;
    }
});

// Update game state
function update() {
    // Move Pac-Man
    pacman.x += pacman.dir.x;
    pacman.y += pacman.dir.y;

    // Wrap Pac-Man around the screen
    if (pacman.x < 0) pacman.x = canvas.width / GRID_SIZE - 1;
    if (pacman.x >= canvas.width / GRID_SIZE) pacman.x = 0;
    if (pacman.y < 0) pacman.y = canvas.height / GRID_SIZE - 1;
    if (pacman.y >= canvas.height / GRID_SIZE) pacman.y = 0;

    // Check for dot collisions
    dots = dots.filter((dot) => {
        const dist = Math.sqrt((dot.x - pacman.x * GRID_SIZE) ** 2 + (dot.y - pacman.y * GRID_SIZE) ** 2);
        if (dist < PACMAN_SIZE / 2) {
            score++;
            return false; // Remove the dot
        }
        return true;
    });

    // Move ghosts (simple AI)
    ghosts.forEach((ghost) => {
        if (ghost.x < pacman.x) ghost.x += 1;
        if (ghost.x > pacman.x) ghost.x -= 1;
        if (ghost.y < pacman.y) ghost.y += 1;
        if (ghost.y > pacman.y) ghost.y -= 1;
    });

    // Check for ghost collisions
    ghosts.forEach((ghost) => {
        if (ghost.x === pacman.x && ghost.y === pacman.y) {
            alert("Game Over! Your score: " + score);
            resetGame();
        }
    });

    // Check for win condition
    if (dots.length === 0) {
        alert("You Win! Your score: " + score);
        resetGame();
    }
}

// Draw game objects
function draw() {
    // Clear the canvas
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw dots
    ctx.fillStyle = "#fff";
    dots.forEach((dot) => {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, DOT_SIZE, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw Pac-Man
    ctx.fillStyle = "#ff0";
    ctx.beginPath();
    ctx.arc(pacman.x * GRID_SIZE + GRID_SIZE / 2, pacman.y * GRID_SIZE + GRID_SIZE / 2, PACMAN_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw ghosts
    ctx.fillStyle = "#f00";
    ghosts.forEach((ghost) => {
        ctx.beginPath();
        ctx.arc(ghost.x * GRID_SIZE + GRID_SIZE / 2, ghost.y * GRID_SIZE + GRID_SIZE / 2, GHOST_SIZE / 2, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw score
    ctx.fillStyle = "#fff";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 10, 30);
}

// Reset game
function resetGame() {
    pacman = { x: 10, y: 10, dir: { x: 0, y: 0 } };
    ghosts = [
        { x: 5, y: 5 },
        { x: 15, y: 5 },
        { x: 5, y: 15 },
        { x: 15, y: 15 },
    ];
    dots = [];
    for (let x = 0; x < canvas.width; x += GRID_SIZE) {
        for (let y = 0; y < canvas.height; y += GRID_SIZE) {
            dots.push({ x: x + GRID_SIZE / 2, y: y + GRID_SIZE / 2 });
        }
    }
    score = 0;
}

// Game loop
function gameLoop() {
    update();
    draw();
    setTimeout(() => requestAnimationFrame(gameLoop), 1000 / FPS);
}

// Start the game
resetGame();
gameLoop();