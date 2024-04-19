document.addEventListener("DOMContentLoaded", function () {
    const canvas = document.getElementById('puzzleCanvas');
    const ctx = canvas.getContext('2d');
    let gridSize = 3; 
    let tileSize;
    const shuffleCount = 1000;

    let puzzle = [];
    let emptyPos = { x: gridSize - 1, y: gridSize - 1 };
    let moves = 0;
    let timerInterval; 

    let moveCounter; 

    function initializePuzzle(size) {
        gridSize = size;
        tileSize = canvas.width / gridSize;
        loadNumbers();
        resetTimer(); 


        moveCounter = document.getElementById('moveCounter');
        moveCounter.textContent = `Siirrot: ${moves}`;
    }

    function loadNumbers() {
        puzzle = [];
        for (let i = 0; i < gridSize; i++) {
            puzzle[i] = [];
            for (let j = 0; j < gridSize; j++) {
                puzzle[i][j] = i * gridSize + j + 1;
            }
        }
        puzzle[gridSize - 1][gridSize - 1] = null;
        emptyPos.x = gridSize - 1;
        emptyPos.y = gridSize - 1;
        shufflePuzzle();
    }
    
    function shufflePuzzle() {
        const getRandomInt = (max) => {
            const randomValues = new Uint32Array(1);
            window.crypto.getRandomValues(randomValues);
            return randomValues[0] % max;
        };
    
        for (let i = gridSize * gridSize - 1; i > 0; i--) {
            const j = Math.floor(getRandomInt(i + 1));
            const x1 = Math.floor(i / gridSize);
            const y1 = i % gridSize;
            const x2 = Math.floor(j / gridSize);
            const y2 = j % gridSize;
            const temp = puzzle[x1][y1];
            puzzle[x1][y1] = puzzle[x2][y2];
            puzzle[x2][y2] = temp;
        }
    
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                if (puzzle[i][j] === null) {
                    emptyPos.x = j;
                    emptyPos.y = i;
                    return;
                }
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

    function handleCanvasClick(event) {
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
                showLevelCompleteMenu();
            }


            moves++;
            moveCounter.textContent = `Moves: ${moves}`;
        }
    }

    function isPuzzleSolved() {
        let count = 1;
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                if (puzzle[i][j] !== null) {
                    if (puzzle[i][j] !== count) {
                        return false;
                    }
                    count++;
                } else {
                    if (i !== gridSize - 1 || j !== gridSize - 1) {
                        return false; 
                    }
                }
            }
        }
        return true; 
    }

    function solvePuzzle() {
        drawPuzzle();
        showLevelCompleteMenu();
    }

    function startTimer() {
        timerInterval = setInterval(updateTimer, 1000);
    }

    function updateTimer() {
        secondsElapsed++;
        document.getElementById('timerDisplay').textContent = `Time: ${secondsElapsed} seconds`;
    }

    function stopTimer() {
        clearInterval(timerInterval);
    }

    function resetTimer() {
        stopTimer();
        secondsElapsed = 0;
        document.getElementById('timerDisplay').textContent = `Time: 0 seconds`;
    }

    function showLevelCompleteMenu() {
        const levelCompleteMenu = document.getElementById('levelCompleteMenu');
        levelCompleteMenu.style.display = 'block';
        const closeButton = levelCompleteMenu.querySelector('.closeButton');
        closeButton.addEventListener('click', closeModal);
    }

    function closeModal() {
        const levelCompleteMenu = document.getElementById('levelCompleteMenu');
        levelCompleteMenu.style.display = 'none';
    }

    document.getElementById('startButton').addEventListener('click', function () {
        const puzzleSizeInput = document.getElementById('puzzleSizeInput');
        const size = parseInt(puzzleSizeInput.value);
        if (!isNaN(size) && size >= 2 && size <= 10) {
            initializePuzzle(size);
            drawPuzzle();
            startTimer();
        } else {
            alert("Invalid puzzle size. Please enter a number between 2 and 10.");
        }
    });

    canvas.addEventListener('click', handleCanvasClick);
});
