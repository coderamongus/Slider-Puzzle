const canvas = document.getElementById('puzzleCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 3;
const tileSize = canvas.width / gridSize;
const shuffleCount = 1000;
const folderNames = ['auto', 'opel'];

let puzzle = [];
let emptyPos = { x: gridSize - 1, y: gridSize - 1 };
let moves = 0;
let timerInterval;
let secondsElapsed = 0;
let levelCompleteMenuShown = false;

let moveCounter = document.getElementById('moveCounter');
moveCounter.textContent = `Siirrot: ${moves}`;

function preloadImages(imagePaths) {
    return Promise.all(imagePaths.map((path) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = path;
        });
    }));
}

function loadImagesFromFolder(folder) {
    const imagePaths = [];

    for (let i = 1; i <= gridSize * gridSize; i++) {
        imagePaths.push(`${folder}/${String(i).padStart(2, '0')}.png`);
    }
    return preloadImages(imagePaths);
}

function countInversions(arr) {
    let inversions = 0;
    for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
            if (arr[i] && arr[j] && parseInt(arr[i].src.slice(-6, -4)) > parseInt(arr[j].src.slice(-6, -4))) {
                inversions++;
            }
        }
    }
    return inversions;
}

function isPuzzleSolvable() {
    let flattenedPuzzle = puzzle.flat().map(img => img ? parseInt(img.src.slice(-6, -4)) : null);
    let inversions = countInversions(flattenedPuzzle);
    if ((emptyPos.y % 2 === 0 && inversions % 2 === 0) || (emptyPos.y % 2 !== 0 && inversions % 2 !== 0)) {
        return true;
    }
    return false;
}

function initAndShufflePuzzle(images) {
    if (!isPuzzleSolvable()) {
        console.log("Sekoitus uudelleen..");
        initAndShufflePuzzle(images);
        return;
    }

    const nonEmptyImages = images.slice(0, -1);
    shuffle(nonEmptyImages);

    for (let i = 0; i < gridSize; i++) {
        puzzle[i] = [];
        for (let j = 0; j < gridSize; j++) {
            if (i !== gridSize - 1 || j !== gridSize - 1) {
                puzzle[i][j] = nonEmptyImages.pop();
            } else {
                puzzle[i][j] = null;
                emptyPos.x = j;
                emptyPos.y = i;
            }
        }
    }

    shufflePuzzle();
    resetMoveCounter();
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
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const img = puzzle[i][j];
            if (img !== null) {
                ctx.drawImage(img, j * tileSize, i * tileSize, tileSize, tileSize);
                const numberX = j * tileSize + tileSize / 2;
                const numberY = i * tileSize + tileSize / 2;
                const number = parseInt(img.src.slice(-6, -4));
                const highlightSize = 22; 
                ctx.fillStyle = 'rgba(255, 255, 255, 1)'; 
                ctx.fillRect(numberX - highlightSize / 2, numberY - highlightSize / 2, highlightSize, highlightSize);
                ctx.fillStyle = 'black';
                ctx.font = 'bold 20px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(number.toString(), numberX, numberY);
            }
        }
    }
}

function solvePuzzle() {
    drawPuzzle();
    if (!levelCompleteMenuShown && isPuzzleSolved()) {
        stopTimer();
        showLevelCompleteMenu();
        levelCompleteMenuShown = true;
    }
}

function showLevelCompleteMenu() {
    const levelCompleteMenu = document.getElementById('levelCompleteMenu');
    levelCompleteMenu.style.display = 'block';
}

function closeModal() {
    const levelCompleteMenu = document.getElementById('levelCompleteMenu');
    levelCompleteMenu.style.display = 'none';
}

function restartLevel() {
    document.location.reload();
}

function nextLevel() {
    window.location.href = '../level2/level2.html'; 
}

function handleClick(event) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const clickedTileX = Math.floor(mouseX / tileSize);
    const clickedTileY = Math.floor(mouseY / tileSize);

    if ((Math.abs(clickedTileX - emptyPos.x) === 1 && clickedTileY === emptyPos.y) ||
        (Math.abs(clickedTileY - emptyPos.y) === 1 && clickedTileX === emptyPos.x)) {

        if (moves === 0) {
            startTimer();
        }
        moves++;

        moveCounter.textContent = `Siirrot: ${moves}`;

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
    let count = 1;
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (count === gridSize * gridSize) {
                return true;
            }
            if (puzzle[i][j] !== null && puzzle[i][j].src.endsWith(`${String(count).padStart(2, '0')}.png`)) {
                count++;
            } else {
                return false;
            }
        }
    }
    return false;
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

function updateMoveCounter() {
    moveCounter.textContent = `Siirrot: ${moves}`;
}

function resetMoveCounter() {
    moves = 0;
    updateMoveCounter();
}

canvas.addEventListener('click', handleClick);

const solveButton = document.getElementById('solveButton');
solveButton.addEventListener('click', solvePuzzle);

const randomFolder = folderNames[Math.floor(Math.random() * folderNames.length)];

loadImagesFromFolder(randomFolder)
    .then(imagePaths => {
        initAndShufflePuzzle(imagePaths);
        drawPuzzle();
    });
