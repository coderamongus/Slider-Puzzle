const canvas = document.getElementById('puzzleCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 3;
const tileSize = canvas.width / gridSize;
const shuffleCount = 1000;

let puzzle = [];
let emptyPos = { x: gridSize - 1, y: gridSize - 1 };
let moves = 0;
let timerInterval;
let secondsElapsed = 0;
let levelCompleteMenuShown = false;

let moveCounter = document.getElementById('moveCounter');
moveCounter.textContent = `Siirrot: ${moves}`;

function initAndShufflePuzzle() {
    const numbers = [...Array(gridSize * gridSize).keys()].slice(1); // Generate numbers 1 to gridSize^2
    shuffle(numbers);

    for (let i = 0; i < gridSize; i++) {
        puzzle[i] = [];
        for (let j = 0; j < gridSize; j++) {
            if (i !== gridSize - 1 || j !== gridSize - 1) {
                puzzle[i][j] = numbers.pop();
            } else {
                puzzle[i][j] = null;
                emptyPos.x = j;
                emptyPos.y = i;
            }
        }
    }

    shufflePuzzle();
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function shufflePuzzle() {
    for (let i = 0; i < shuffleCount; i++) {
        const randomDir = Math.floor(Math.random() * 4);
        const dx = [0, 0, -1, 1][randomDir];
        const dy = [-1, 1, 0, 0][randomDir];
        const newX = emptyPos.x + dx;
        const newY = emptyPos.y + dy;
        if (newX >= 0 && newX < gridSize && newY >= 0 && newY < gridSize) {
            puzzle[emptyPos.y][emptyPos.x] = puzzle[newY][newX];
            puzzle[newY][newX] = null;
            emptyPos.x = newX;
            emptyPos.y = newY;
        }
    }
}

function drawPuzzle() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "bold " + (tileSize / 2) + "px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const num = puzzle[i][j];
            if (num !== null) {
                ctx.fillText(num, j * tileSize + tileSize / 2, i * tileSize + tileSize / 2);
            }
        }
    }
}

function solvePuzzle() {
    drawPuzzle();

    if (isPuzzleSolved()) {
        stopTimer();
        if (!levelCompleteMenuShown) {
            showLevelCompleteMenu();
            levelCompleteMenuShown = true;
        }
    }
}

function showLevelCompleteMenu() {
    const levelCompleteMenu = document.getElementById('levelCompleteMenu');
    levelCompleteMenu.style.display = 'block';
}

function restartLevel() {
    document.location.reload();
}

function nextLevel() {
    window.location.href = '../level1/level1.html'; 
}

function handleClick(event) {
    if (moves === 0) {
        startTimer();
    }
    moves++;

    moveCounter.textContent = `Siirrot: ${moves}`;

    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const clickedTileX = Math.floor(mouseX / tileSize);
    const clickedTileY = Math.floor(mouseY / tileSize);

    if ((Math.abs(clickedTileX - emptyPos.x) === 1 && clickedTileY === emptyPos.y) ||
        (Math.abs(clickedTileY - emptyPos.y) === 1 && clickedTileX === emptyPos.x)) {
        puzzle[emptyPos.y][emptyPos.x] = puzzle[clickedTileY][clickedTileX];
        puzzle[clickedTileY][clickedTileX] = null;
        emptyPos.x = clickedTileX;
        emptyPos.y = clickedTileY;

        drawPuzzle();

        if (isPuzzleSolved()) {
            stopTimer();
            solvePuzzle();
        }
    }
}

function isPuzzleSolved() {
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (puzzle[i][j] !== null && puzzle[i][j] !== i * gridSize + j + 1) {
                return false;
            }
        }
    }
    return true;
}

function startTimer() {
    timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    secondsElapsed++;
    document.getElementById('timerDisplay').textContent = `Aika: ${secondsElapsed} sekuntia`;
}

function stopTimer() {
    clearInterval(timerInterval);
}

function resetTimer() {
    stopTimer();
    secondsElapsed = 0;
    document.getElementById('timerDisplay').textContent = `Aika: 0 sekuntia`;
}

canvas.addEventListener('click', handleClick);

const solveButton = document.getElementById('solveButton');
solveButton.addEventListener('click', solvePuzzle);

initAndShufflePuzzle();
drawPuzzle();
