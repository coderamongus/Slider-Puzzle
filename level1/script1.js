const canvas = document.getElementById('puzzleCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 3;
const tileSize = canvas.width / gridSize;
const numbers = [...Array(gridSize * gridSize - 1).keys()].map(i => i + 1);
const shuffleCount = 1000;

let puzzle = [];
let emptyPos = { x: gridSize - 1, y: gridSize - 1 };

function initPuzzle() {
    for (let i = 0; i < gridSize; i++) {
        puzzle[i] = [];
        for (let j = 0; j < gridSize; j++) {
            if (i !== gridSize - 1 || j !== gridSize - 1) {
                puzzle[i][j] = numbers.pop();
            } else {
                puzzle[i][j] = 0;
            }
        }
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
            puzzle[newY][newX] = 0;
            emptyPos.x = newX;
            emptyPos.y = newY;
        }
    }
}

function drawPuzzle() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const number = puzzle[i][j];
            if (number !== 0) {
                ctx.fillStyle = 'lightgray';
                ctx.fillRect(j * tileSize, i * tileSize, tileSize, tileSize);
                ctx.strokeStyle = 'black';
                ctx.strokeRect(j * tileSize, i * tileSize, tileSize, tileSize);
                ctx.fillStyle = 'black';
                ctx.font = '20px Arial';
                ctx.fillText(number, j * tileSize + tileSize / 2 - 8, i * tileSize + tileSize / 2 + 8);
            }
        }
    }
}

canvas.addEventListener('click', handleClick);

function handleClick(event) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const clickedTileX = Math.floor(mouseX / tileSize);
    const clickedTileY = Math.floor(mouseY / tileSize);

    if ((Math.abs(clickedTileX - emptyPos.x) === 1 && clickedTileY === emptyPos.y) ||
        (Math.abs(clickedTileY - emptyPos.y) === 1 && clickedTileX === emptyPos.x)) {

        puzzle[emptyPos.y][emptyPos.x] = puzzle[clickedTileY][clickedTileX];
        puzzle[clickedTileY][clickedTileX] = 0;
        emptyPos.x = clickedTileX;
        emptyPos.y = clickedTileY;

        drawPuzzle();

        if (isPuzzleSolved()) {
            alert("Onnittelut voitit pelin!");
        }
    }
}

function isPuzzleSolved() {
    let count = 1;
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (puzzle[i][j] !== count % (gridSize * gridSize)) {
                return false;
            }
            count++;
        }
    }
    return true;
}

function solvePuzzle() {
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            puzzle[i][j] = i * gridSize + j + 1;
        }
    }
    puzzle[gridSize - 1][gridSize - 1] = 0;
    drawPuzzle();
    if (isPuzzleSolved()) {
        alert("Onnittelut voitit pelin!");
    }
}

const solveButton = document.getElementById('solveButton');
solveButton.addEventListener('click', solvePuzzle);

initPuzzle();
shufflePuzzle();
drawPuzzle();