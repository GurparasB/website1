const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

let snake = [
    {x: 200, y: 200},
    {x: 190, y: 200},
    {x: 180, y: 200}
];

let dx = 10;
let dy = 0;
let foodX;
let foodY;
let score = 0;

function generateFood() {
    foodX = Math.floor(Math.random() * (canvas.width / 10)) * 10;
    foodY = Math.floor(Math.random() * (canvas.height / 10)) * 10;
}

function drawFood() {
    ctx.fillStyle = 'red';
    ctx.fillRect(foodX, foodY, 10, 10);
}

function moveSnake() {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    snake.unshift(head);

    if (head.x === foodX && head.y === foodY) {
        score += 10;
        scoreElement.innerHTML = `Score: ${score}`;
        generateFood();
    } else {
        snake.pop();
    }
}

function drawSnake() {
    snake.forEach(segment => {
        ctx.fillStyle = 'green';
        ctx.fillRect(segment.x, segment.y, 10, 10);
    });
}

function clearCanvas() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function checkCollision() {
    const head = snake[0];

    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
        return true;
    }

    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    return false;
}

document.addEventListener('keydown', (event) => {
    switch(event.key) {
        case 'ArrowUp':
            if (dy === 0) {
                dx = 0;
                dy = -10;
            }
            break;
        case 'ArrowDown':
            if (dy === 0) {
                dx = 0;
                dy = 10;
            }
            break;
        case 'ArrowLeft':
            if (dx === 0) {
                dx = -10;
                dy = 0;
            }
            break;
        case 'ArrowRight':
            if (dx === 0) {
                dx = 10;
                dy = 0;
            }
            break;
    }
});

function gameOver() {
    const overlay = document.createElement('div');
    overlay.id = 'overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '1000';

    let highScore = localStorage.getItem('snakeHighScore') || 0;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
    }

    const message = document.createElement('div');
    message.style.backgroundColor = 'white';
    message.style.padding = '20px';
    message.style.borderRadius = '10px';
    message.style.textAlign = 'center';
    message.innerHTML = `
        <h2>Game Over!</h2>
        <p>Your Score: ${score}</p>
        <p>High Score: ${highScore}</p>
        <button onclick="restartGame()">Play Again</button>
        <button onclick="window.location.href='game_selector.html'">Home</button>
    `;

    overlay.appendChild(message);
    document.body.appendChild(overlay);
}

function restartGame() {
    const overlay = document.getElementById('overlay');
    if (overlay) {
        document.body.removeChild(overlay);
    }

    snake = [
        {x: 200, y: 200},
        {x: 190, y: 200},
        {x: 180, y: 200}
    ];
    dx = 10;
    dy = 0;
    score = 0;
    scoreElement.innerHTML = `Score: ${score}`;
    generateFood();
    gameLoop();
}

function gameLoop() {
    if (checkCollision()) {
        gameOver();
        return;
    }

    setTimeout(() => {
        clearCanvas();
        drawFood();
        moveSnake();
        drawSnake();
        gameLoop();
    }, 100);
}

generateFood();
gameLoop();
