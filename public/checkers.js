console.log("Width: " + window.innerWidth + ", Height: " + window.innerHeight); // Width: 1920, Height: 938
/* Define the entire tiles array which includes all of the black tiles on the board */
let tiles = [
        undefined,
        document.querySelectorAll(".first"),
        document.querySelectorAll(".second"),
        document.querySelectorAll(".third"),
        document.querySelectorAll(".fourth"),
        document.querySelectorAll(".fifth"),
        document.querySelectorAll(".sixth"),
        document.querySelectorAll(".seventh"),
        document.querySelectorAll(".eighth")
    ],
    printTurn = document.querySelector("#turn"),
    startButton = document.querySelector("#start"),
    turn = "black-pawn", 
    blackPawns = 12, 
    whitePawns = 12, 
    lastSelected,
    lastCaptureSuggestion = {},
    setTiles = {
        black: tile => tile.classList.add("black-pawn"),
        white: tile => tile.classList.add("white-pawn")
    }

startButton.addEventListener("click", () => {
    gameStart();
    startButton.style.opacity = "0";
});
startButton.addEventListener("transitionend", function () {this.style.display = "none"});

/* Places all the pawns in their initial position */
function gameStart () { 
    tiles[1].forEach(setTiles.black);
    tiles[2].forEach(setTiles.black);
    tiles[3].forEach(setTiles.black);
    tiles[6].forEach(setTiles.white);
    tiles[7].forEach(setTiles.white);
    tiles[8].forEach(setTiles.white);
    printTurn.textContent = turn;
    for (let i = 1; i < tiles.length; i++) {
        for (let j = 0; j < 4; j++) {
            tiles[i][j].addEventListener("click", function() { 
                checkMovement(this, i, j);
            });
        }
    }
}

function checkMovement (selectedTile, row, tile) {
    if (selectedTile.classList.contains("suggested-move")) { // if a suggested path is clicked
        if (selectedTile.capture) { // if the clicked tile is a suggested capture
            executeCapture(selectedTile, selectedTile.capture);
            delete selectedTile.capture;
        }
        lastSelected.classList.remove(turn);
        selectedTile.classList.add(turn); 
        turn = (turn == "black-pawn") ?  "white-pawn" : "black-pawn"; // switch turns
        printTurn.textContent = turn;
    }
    clearSuggestions();
    delete lastCaptureSuggestion.capture; // removes this property in case the capture path was ignored
    if (selectedTile.classList.contains(turn)) { // if a tile which has a pawn on it is selected
        if (turn == "black-pawn") { //black turn
            (row%2 != 0) ? showSuggestions(row, tile, 1, -1) : showSuggestions(row, tile, 1, 1);
        }
        else { // white turn
            (row%2 != 0) ? showSuggestions(row, tile, -1, -1) : showSuggestions(row, tile, -1, 1);
        }
    }
    lastSelected = selectedTile; // "remembers" the last tile that was selected, this allows to move a capturer to its new position
}

function clearSuggestions () {
    for (let i = 1; i < tiles.length; i++) {
        for (let j = 0; j < 4; j++) {
            tiles[i][j].classList.remove("suggested-move", "capture");
        }
    }
}

function showSuggestions (row, tile, rowStep, tileStep) {
    if (turn == "black-pawn") { // black turn
        if (tiles[row+rowStep][tile+tileStep] && !tiles[row+rowStep][tile+tileStep].classList.contains("black-pawn")) {
            if (tiles[row+rowStep][tile+tileStep].classList.contains("white-pawn")) {
                if (tiles[row+rowStep*2][tile+tileStep] && !tiles[row+rowStep*2][tile+tileStep].classList.contains("black-pawn") && !tiles[row+rowStep*2][tile+tileStep].classList.contains("white-pawn")) {
                    tiles[row+rowStep*2][tile+tileStep].classList.add("suggested-move");
                    tiles[row+rowStep*2][tile+tileStep].capture = tiles[row+rowStep][tile+tileStep];
                    lastCaptureSuggestion = tiles[row+rowStep*2][tile+tileStep];
                    tiles[row+rowStep][tile+tileStep].classList.add("capture");
                }
            }
            else {
                tiles[row+rowStep][tile+tileStep].classList.add("suggested-move");
            }
        }
        if (tiles[row+rowStep][tile] && !tiles[row+rowStep][tile].classList.contains("black-pawn")) {
            if (tiles[row+rowStep][tile].classList.contains("white-pawn")) {
                if (tiles[row+rowStep*2][tile-tileStep] && !tiles[row+rowStep*2][tile-tileStep].classList.contains("black-pawn") && !tiles[row+rowStep*2][tile-tileStep].classList.contains("white-pawn")) {
                    tiles[row+rowStep*2][tile-tileStep].classList.add("suggested-move");
                    tiles[row+rowStep*2][tile-tileStep].capture = tiles[row+rowStep][tile];
                    lastCaptureSuggestion = tiles[row+rowStep*2][tile-tileStep];
                    tiles[row+rowStep][tile].classList.add("capture");
                }
            }
            else {
                tiles[row+rowStep][tile].classList.add("suggested-move");
            }
        }
    }
    else { // white turn
        if (tiles[row+rowStep][tile+tileStep] && !tiles[row+rowStep][tile+tileStep].classList.contains("white-pawn")) {
            if (tiles[row+rowStep][tile+tileStep].classList.contains("black-pawn")) {
                if (tiles[row+rowStep*2][tile+tileStep] && !tiles[row+rowStep*2][tile+tileStep].classList.contains("black-pawn") && !tiles[row+rowStep*2][tile+tileStep].classList.contains("white-pawn")) {
                    tiles[row+rowStep*2][tile+tileStep].classList.add("suggested-move");
                    tiles[row+rowStep*2][tile+tileStep].capture = tiles[row+rowStep][tile+tileStep];
                    lastCaptureSuggestion = tiles[row+rowStep*2][tile+tileStep];
                    tiles[row+rowStep][tile+tileStep].classList.add("capture");
                }  
            }
            else {
                tiles[row+rowStep][tile+tileStep].classList.add("suggested-move");
            }
        }
        if (tiles[row+rowStep][tile] && !tiles[row+rowStep][tile].classList.contains("white-pawn")) {
            if (tiles[row+rowStep][tile].classList.contains("black-pawn")) {
                if (tiles[row+rowStep*2][tile-tileStep] && !tiles[row+rowStep*2][tile-tileStep].classList.contains("black-pawn") && !tiles[row+rowStep*2][tile-tileStep].classList.contains("white-pawn")) {
                    tiles[row+rowStep*2][tile-tileStep].classList.add("suggested-move");
                    tiles[row+rowStep*2][tile-tileStep].capture = tiles[row+rowStep][tile];
                    lastCaptureSuggestion = tiles[row+rowStep*2][tile-tileStep];
                    tiles[row+rowStep][tile].classList.add("capture");
                } 
            }
            else {
                tiles[row+rowStep][tile].classList.add("suggested-move");
            }
        }
    }
}

function executeCapture (capturer, captured) {
    if (turn == "black-pawn") {
        captured.classList.remove("white-pawn");
        whitePawns--;
    }
    else {
        captured.classList.remove("black-pawn");
        blackPawns--;
    }
}

function recShowSuggestions1 (row, tile, rowStep, tileStep) {
    if (tiles[row+rowStep][tile+tileStep].classList.contains("white-pawn")) {
        return recShowSuggestions1(row+rowStep*2, tile+tileStep, rowStep, tileStep);
    }
    return tiles[row][tile];
}

function recShowSuggestions2 (row, tile, rowStep, tileStep) {
    if (tiles[row+rowStep][tile-tileStep].classList.contains("white-pawn")) {
        return recShowSuggestions2(row+rowStep*2, tile-tileStep, rowStep, tileStep);
    }
    return tiles[row][tile];
}