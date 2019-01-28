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
    ];
let turn = "black-pawn", blackPawns = 12, whitePawns = 12, selectedPawn;

let captureOccured = {
    type: undefined,
    row: undefined,
    rowStep: undefined,
    tile: undefined,
    tileStep: undefined,
    executeCapture: function(row = this.row, rowStep = this.rowStep, tile = this.tile, tileStep = this.tileStep, captureType = this.type) {
        switch (captureType) {
            case 1: {
                tiles[row+rowStep][tile+tileStep].classList.remove("white-pawn", "capture");
                whitePawns--;
                break;
            }
            case 2: {
                tiles[row+rowStep][tile].classList.remove("white-pawn", "capture");
                whitePawns--;
                break;
            }
            case 3: {
                tiles[row+rowStep][tile+tileStep].classList.remove("black-pawn", "capture");
                blackPawns--;
                break;
            }
            case 4: {
                tiles[row+rowStep][tile].classList.remove("black-pawn", "capture");
                blackPawns--;
                break;
            }
        }
    }
}

let printTurn = document.querySelector("#turn"),
    startButton = document.querySelector("#start");

let setTiles = {
    black: tile => tile.classList.add("black-pawn"),
    white: tile => tile.classList.add("white-pawn")
};

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
            tiles[i][j].addEventListener("click", () => checkMovement(i, j));
        }
    }
}

function checkMovement (row, tile) {
    if (tiles[row][tile].classList.contains("suggested-move")) { // if a suggested path is clicked
        if (tiles[row][tile].classList.contains("suggested-capture")) {
            captureOccured.executeCapture();
        }
        selectedPawn.classList.remove(turn);
        tiles[row][tile].classList.add(turn); 
        turn = (turn == "black-pawn") ?  "white-pawn" : "black-pawn"; // switch turns
        printTurn.textContent = turn;
    }
    clearSuggestions();
    if (tiles[row][tile].classList.contains(turn)) { 
        if (turn == "black-pawn") {
            (row%2 != 0) ? showSuggestions(row, tile, 1, -1) : showSuggestions(row, tile, 1, 1);
        }
        else { // white turn
            (row%2 != 0) ? showSuggestions(row, tile, -1, -1) : showSuggestions(row, tile, -1, 1);
        }
    selectedPawn = tiles[row][tile];
    }
}

function clearSuggestions () {
    for (let i = 1; i < tiles.length; i++) {
        for (let j = 0; j < 4; j++) {
            tiles[i][j].classList.remove("suggested-move", "capture", "suggested-capture");
        }
    }
}

function showSuggestions (row, tile, rowStep, tileStep) {
    if (turn == "black-pawn") { // black turn
        if (tiles[row+rowStep][tile+tileStep] && !tiles[row+rowStep][tile+tileStep].classList.contains("black-pawn")) {
            if (tiles[row+rowStep][tile+tileStep].classList.contains("white-pawn")) {
                if (tiles[row+rowStep*2][tile+tileStep] && !tiles[row+rowStep*2][tile+tileStep].classList.contains("black-pawn") && !tiles[row+rowStep*2][tile+tileStep].classList.contains("white-pawn")) {
                    tiles[row+rowStep*2][tile+tileStep].classList.add("suggested-move","suggested-capture");
                    tiles[row+rowStep][tile+tileStep].classList.add("capture");
                    captureOccured.value = true;
                    captureOccured.type = 1;
                    captureOccured.row = row;
                    captureOccured.rowStep = rowStep;
                    captureOccured.tile = tile;
                    captureOccured.tileStep = tileStep;
                }
            }
            else {
                tiles[row+rowStep][tile+tileStep].classList.add("suggested-move");
            }
        }
        if (tiles[row+rowStep][tile] && !tiles[row+rowStep][tile].classList.contains("black-pawn")) {
            if (tiles[row+rowStep][tile].classList.contains("white-pawn")) {
                if (tiles[row+rowStep*2][tile+tileStep*(-1)] && !tiles[row+rowStep*2][tile+tileStep*(-1)].classList.contains("black-pawn") && !tiles[row+rowStep*2][tile+tileStep*(-1)].classList.contains("white-pawn")) {
                    tiles[row+rowStep*2][tile+tileStep*(-1)].classList.add("suggested-move","suggested-capture");
                    tiles[row+rowStep][tile].classList.add("capture");
                    captureOccured.value = true;
                    captureOccured.type = 2;
                    captureOccured.row = row;
                    captureOccured.rowStep = rowStep;
                    captureOccured.tile = tile;
                    captureOccured.tileStep = tileStep;
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
                    tiles[row+rowStep*2][tile+tileStep].classList.add("suggested-move","suggested-capture");
                    tiles[row+rowStep][tile+tileStep].classList.add("capture");
                    captureOccured.value = true;
                    captureOccured.type = 3;
                    captureOccured.row = row;
                    captureOccured.rowStep = rowStep;
                    captureOccured.tile = tile;
                    captureOccured.tileStep = tileStep;
                }  
            }
            else {
                tiles[row+rowStep][tile+tileStep].classList.add("suggested-move");
            }
        }
        if (tiles[row+rowStep][tile] && !tiles[row+rowStep][tile].classList.contains("white-pawn")) {
            if (tiles[row+rowStep][tile].classList.contains("black-pawn")) {
                if (tiles[row+rowStep*2][tile+tileStep*(-1)] && !tiles[row+rowStep*2][tile+tileStep*(-1)].classList.contains("black-pawn") && !tiles[row+rowStep*2][tile+tileStep*(-1)].classList.contains("white-pawn")) {
                    tiles[row+rowStep*2][tile+tileStep*(-1)].classList.add("suggested-move","suggested-capture");
                    tiles[row+rowStep][tile].classList.add("capture");
                    captureOccured.value = true;
                    captureOccured.type = 4;
                    captureOccured.row = row;
                    captureOccured.rowStep = rowStep;
                    captureOccured.tile = tile;
                    captureOccured.tileStep = tileStep;
                } 
            }
            else {
                tiles[row+rowStep][tile].classList.add("suggested-move");
            }
        }
    }
}