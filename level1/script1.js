const canvas = document.getElementById('puzzleCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 3; 
const tileSize = canvas.width / gridSize;
const shuffleCount = 1000;
const folderNames = ['auto', 'opel'];
let puzzle = [];
let emptyPos = { x: gridSize - 1, y: gridSize - 1 };

// Preload images function
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
    for (let i = 1; i <= 9; i++) {
        imagePaths.push(`${folder}/${String(i).padStart(2, '0')}.png`);
    }
    return preloadImages(imagePaths); // Use preloadImages to preload images
}

function initAndShufflePuzzle(images) {
    shuffle(images); // Shuffle the preloaded images

    for (let i = 0; i < gridSize; i++) {
        puzzle[i] = [];
        for (let j = 0; j < gridSize; j++) {
            if (i !== gridSize - 1 || j !== gridSize - 1) {
                puzzle[i][j] = images.pop(); // Use preloaded images for puzzle
            } else {
                puzzle[i][j] = null;
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
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const img = puzzle[i][j];
            if (img !== null) {
                ctx.drawImage(img, j * tileSize, i * tileSize, tileSize, tileSize);
            }
        }
    }
}

function solvePuzzle() {
    drawPuzzle();
    alert("Puzzle solved!");
}

function handleClick(event) {
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
            alert("Congratulations! You've solved the puzzle!");
        }
    }
}

function isPuzzleSolved() {
    let count = 1;
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (puzzle[i][j] !== null && puzzle[i][j] !== `${folderNames[0]}/09.png`) {
                return false;
            }
            count++;
        }
    }
    return true;
}

canvas.addEventListener('click', handleClick);

const solveButton = document.getElementById('solveButton');
solveButton.addEventListener('click', solvePuzzle);

const randomFolder = folderNames[Math.floor(Math.random() * folderNames.length)];

loadImagesFromFolder(randomFolder)
    .then(images => {
        initAndShufflePuzzle(images); // Pass preloaded images to initialize puzzle
        drawPuzzle();
    });
