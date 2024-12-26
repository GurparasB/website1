document.addEventListener('DOMContentLoaded', () => {
    const cells = document.querySelectorAll('[data-cell]');
    const gameInfo = document.getElementById('game-info');
    const singlePlayerButton = document.getElementById('singlePlayer');
    const twoPlayerButton = document.getElementById('twoPlayer');
    const playerOneScoreEl = document.getElementById('playerOneScore');
    const playerTwoScoreEl = document.getElementById('playerTwoScore');
    const machineScoreEl = document.getElementById('machineScore');
    const gameOverModal = document.getElementById('gameOverModal');
    const winnerMessage = document.getElementById('winnerMessage');
    const playAgainButton = document.getElementById('playAgain');
    const board = document.getElementById('board');

    let circleTurn;
    let isSinglePlayer = false;
    let playerOneScore = 0;
    let playerTwoScore = 0;

    let currentMode = ''; // 'singlePlayer' or 'twoPlayer'

    document.getElementById('homeButton').addEventListener('click', () => {
        window.location.href = 'game_selector.html'; // Replace 'index.html' with your desired home page URL
    });

    singlePlayerButton.addEventListener('click', () => {
        resetScores(); // Reset scores when switching to single-player mode
        startGame(true);
        currentMode = 'singlePlayer';
        document.getElementById('singlePlayerScoreboard').style.display = 'block';
        document.getElementById('twoPlayerScoreboard').style.display = 'none';
    });

    twoPlayerButton.addEventListener('click', () => {
        resetScores(); // Reset scores when switching to two-player mode
        startGame(false);
        currentMode = 'twoPlayer';
        document.getElementById('twoPlayerScoreboard').style.display = 'block';
        document.getElementById('singlePlayerScoreboard').style.display = 'none';
        circleTurn = false;
    });

    playAgainButton.addEventListener('click', () => {
        gameOverModal.style.display = 'none';
        startGame(isSinglePlayer);
    });

    function resetScores() {
        playerOneScore = 0;
        playerTwoScore = 0;

        if (currentMode === 'singlePlayer') {
            document.getElementById('singlePlayerOneScore').textContent = 'Player 1: 0';
            document.getElementById('machineScore').textContent = 'Machine: 0';
        } else if (currentMode === 'twoPlayer') {
            playerOneScoreEl.textContent = 'Player 1: 0';
            playerTwoScoreEl.textContent = 'Player 2: 0';
        }
    }

    function startGame(singlePlayer) {
        isSinglePlayer = singlePlayer;
        circleTurn = false;
        cells.forEach(cell => {
            cell.classList.remove('circle', 'x');
            cell.removeEventListener('click', handleClick);
            cell.addEventListener('click', handleClick, { once: true });
        });
        setBoardHoverClass();
        gameInfo.textContent = "Player X's turn";
    }

    function handleClick(e) {
        const cell = e.target;
        const currentClass = circleTurn ? 'circle' : 'x';
        placeMark(cell, currentClass);
        if (checkWin(currentClass)) {
            endGame(false, currentClass);
        } else if (isDraw()) {
            endGame(true);
        } else {
            swapTurns();
            setBoardHoverClass();
            if (isSinglePlayer && circleTurn) {
                aiMove();
            }
        }
    }

    function endGame(draw, winnerClass = null) {
        if (draw) {
            winnerMessage.textContent = 'Draw!';
        } else {
            const winner = winnerClass === 'x' ? "Player X" : "Player O";
            winnerMessage.textContent = `${winner} Wins!`;

            if (currentMode === 'singlePlayer') {
                if (winnerClass === 'x') {
                    updateScore('playerOne');
                } else {
                    updateScore('machine');
                }
            } else if (currentMode === 'twoPlayer') {
                if (winnerClass === 'x') {
                    updateScore('playerOne');
                } else {
                    updateScore('playerTwo');
                }
            }
        }

        gameOverModal.style.display = 'block';
        cells.forEach(cell => {
            cell.removeEventListener('click', handleClick);
        });
    }

    function updateScore(player) {
        if (currentMode === 'singlePlayer') {
            if (player === 'playerOne') {
                playerOneScore++;
                document.getElementById('singlePlayerOneScore').textContent = `Player 1: ${playerOneScore}`;
            } else if (player === 'machine') {
                playerTwoScore++;
                document.getElementById('machineScore').textContent = `Machine: ${playerTwoScore}`;
            }
        } else if (currentMode === 'twoPlayer') {
            if (player === 'playerOne') {
                playerOneScore++;
                playerOneScoreEl.textContent = `Player 1: ${playerOneScore}`;
            } else if (player === 'playerTwo') {
                playerTwoScore++;
                playerTwoScoreEl.textContent = `Player 2: ${playerTwoScore}`;
            }
        }
    }

    function isDraw() {
        return [...cells].every(cell => {
            return cell.classList.contains('x') || cell.classList.contains('circle');
        });
    }

    function placeMark(cell, currentClass) {
        cell.classList.add(currentClass);
    }

    function swapTurns() {
        circleTurn = !circleTurn;
        gameInfo.textContent = `${circleTurn ? "Player O's" : "Player X's"} turn`;
    }

    function setBoardHoverClass() {
        board.classList.remove('circle', 'x');
        if (circleTurn) {
            board.classList.add('circle');
        } else {
            board.classList.add('x');
        }
    }

    function checkWin(currentClass) {
        const winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        return winningCombinations.some(combination => {
            return combination.every(index => {
                return cells[index].classList.contains(currentClass);
            });
        });
    }

    function aiMove() {
        let bestMove;
        const currentClass = 'circle';

        bestMove = findBestMove(currentClass);
        if (bestMove !== -1) {
            cells[bestMove].click();
            return;
        }

        bestMove = findBestMove('x');
        if (bestMove !== -1) {
            cells[bestMove].click();
            return;
        }

        const availableCells = Array.from(cells).filter(cell => !cell.classList.contains('x') && !cell.classList.contains('circle'));
        const randomCell = availableCells[Math.floor(Math.random() * availableCells.length)];
        if (randomCell) {
            randomCell.click();
        }
    }

    function findBestMove(playerClass) {
        const winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        for (let combination of winningCombinations) {
            const cellValues = combination.map(index => cells[index].classList.contains(playerClass));
            if (cellValues.filter(v => v).length === 2) {
                const emptyIndex = cellValues.indexOf(false);
                if (!cells[combination[emptyIndex]].classList.contains('x') && !cells[combination[emptyIndex]].classList.contains('circle')) {
                    return combination[emptyIndex];
                }
            }
        }
        return -1;
    }
});