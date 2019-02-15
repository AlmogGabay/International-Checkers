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
    board = document.querySelector("#board"),
    startScreen = document.querySelector("#start-screen"),
    playButton = document.querySelector("#play-button"),
    gameOverScreen = document.querySelector("#gameover-screen"),
    winnerMessage = document.querySelector("#winner-message"),
    newGameButton = document.querySelector("#newgame-button"),
    turn, 
    whitePawns,
    blackPawns,
    lastSelected,
    setPawns = {
        white: tile => tile.classList.add("white-pawn"),
        black: tile => tile.classList.add("black-pawn")
    };

playButton.addEventListener("click", () => { startScreen.style.display = "none"; board.style.filter = "none"; });
newGameButton.addEventListener("click", () => { gameStart(); board.style.filter = "none"; gameOverScreen.style.display = "none"; });

gameStart();

function gameStart () {
    turn = "white-pawn";
    whitePawns = 1;
    blackPawns = 1;
    lastSelected = undefined;
    
/* Clears all previous pawns */
    for (let row = 1; row < tiles.length; row++) {
        tiles[row].forEach((tile) => tile.classList.remove("white-pawn", "black-pawn", "king"));
    }

/* Places all the pawns in their initial position */    
    tiles[1].forEach(setPawns.white);
    tiles[2].forEach(setPawns.white);
    tiles[3].forEach(setPawns.white);
    tiles[6].forEach(setPawns.black);
    tiles[7].forEach(setPawns.black);
    tiles[8].forEach(setPawns.black);
    printTurn.textContent = turn;
    
    for (let row = 1; row < tiles.length; row++) {
        tiles[row].forEach((tile, index) => tile.addEventListener("click", function() { checkMovement(tile, row, index) }));
    }
}

function checkMovement (selectedTile, row, tile) {
    if (selectedTile.classList.contains("suggested-move")) { // if a suggested path is clicked
        if (selectedTile.captured) { // if the clicked tile is a suggested capture
            executeCapture(selectedTile.captured);
        }
        if (turn == "white-pawn" && row == 8 || turn == "black-pawn" && row == 1) {
            selectedTile.classList.add("king");
        }
        lastSelected.classList.remove(turn);
        selectedTile.classList.add(turn);
        if (lastSelected.classList.contains("king")) {
            selectedTile.classList.add("king");
            lastSelected.classList.remove("king");
        }
        turn = (turn == "white-pawn") ?  "black-pawn" : "white-pawn"; // switch turns
        printTurn.textContent = turn;
    }
    clearSuggestionsAndCaptures();
    if (selectedTile.classList.contains(turn)) { // if a tile which has a current-turn-pawn on it is selected
        preShowSuggestions(selectedTile, row, tile);
    }
    checkGameOver();
    lastSelected = selectedTile; // "remembers" the last tile that was selected, this allows to move a capturer to its new position
}

function preShowSuggestions (selectedTile, row, tile) {
    if (turn == "white-pawn") { // white turn
        (row%2 == 0) ? showSuggestions(row, tile, 1, 1, 1, "white-pawn", "black-pawn", selectedTile) : showSuggestions(row, tile, 1, -1, -1, "white-pawn", "black-pawn", selectedTile);
    }
    else { // black turn
        (row%2 == 0) ? showSuggestions(row, tile, -1, 1, 1, "black-pawn", "white-pawn", selectedTile) : showSuggestions(row, tile, -1, -1, -1, "black-pawn", "white-pawn", selectedTile);   
    }
    let stepTiles = Array.prototype.slice.call(document.querySelectorAll(".suggested-move")),
        captureTiles = Array.prototype.slice.call(document.querySelectorAll(".intermediate-capture"));
    if (captureTiles.length > 0) { // if theres a capture
        stepTiles.forEach((tile) => {tile.classList.remove("suggested-move")}); // remove all step tiles   
        captureTiles // leave only the max length captures
        .sort((a, b) => b.captured.length - a.captured.length)
        .filter(tile => tile.captured.length == captureTiles[0].captured.length)
        .forEach(tile => {
            tile.classList.remove("intermediate-capture");
            tile.classList.add("suggested-move");
        });
    }
}

function clearSuggestionsAndCaptures () {
    for (let i = 1; i < tiles.length; i++) {
        for (let j = 0; j < 4; j++) {
            tiles[i][j].classList.remove("suggested-move", "intermediate-capture", "capture");
            delete tiles[i][j].captured;
        }
    }
}

function showSuggestions (r, t, rStep, tStep, doubleTileStep, friend, foe, originalPawn, captureOccured = false, capturedArr = []) {
    /* FORWARD MOVEMENT */
    if (tiles[r+rStep] && tiles[r+rStep][t+tStep] && !tiles[r+rStep][t+tStep].classList.contains(friend)) { // if not friend
        if (!tiles[r+rStep][t+tStep].classList.contains(foe)) { // if empty and the pressed pawn is not a king
            if (!captureOccured || originalPawn.classList.contains("king")) {
                tiles[r+rStep][t+tStep].classList.add("suggested-move"); // a step without a capture
            }
        }
        else if (tiles[r+rStep*2] && tiles[r+rStep*2][t+doubleTileStep] && !tiles[r+rStep*2][t+doubleTileStep].captured) { // if jump tile exists AND has no captured
            if (!tiles[r+rStep*2][t+doubleTileStep].classList.contains(friend) && !tiles[r+rStep*2][t+doubleTileStep].classList.contains(foe) || tiles[r+rStep*2][t+doubleTileStep] == originalPawn && capturedArr.length >= 3) { // if jump tile is empty OR if jump tile equals the pressed tile AND at least 3 captures have been marked
                capturedArr.push(tiles[r+rStep][t+tStep]);
                markTiles(r, t, r+rStep*2, t+doubleTileStep, r+rStep, t+tStep, capturedArr.slice());
                showSuggestions(r+rStep*2, t+doubleTileStep, rStep, tStep, doubleTileStep, friend, foe, originalPawn, true, capturedArr.slice());
                capturedArr.pop();
            }
        }
    }
    
    if (tiles[r+rStep] && tiles[r+rStep][t] && !tiles[r+rStep][t].classList.contains(friend)) {
        if (!tiles[r+rStep][t].classList.contains(foe)) {
            if (!captureOccured || originalPawn.classList.contains("king")) {
                tiles[r+rStep][t].classList.add("suggested-move");
            }
        }
        else if (tiles[r+rStep*2] && tiles[r+rStep*2][t-doubleTileStep] && !tiles[r+rStep*2][t-doubleTileStep].captured) {
            if (!tiles[r+rStep*2][t-doubleTileStep].classList.contains(friend) && !tiles[r+rStep*2][t-doubleTileStep].classList.contains(foe) || tiles[r+rStep*2][t-doubleTileStep] == originalPawn && capturedArr.length >= 3) {
                capturedArr.push(tiles[r+rStep][t]);
                markTiles(r, t, r+rStep*2, t-doubleTileStep, r+rStep, t, capturedArr.slice());
                showSuggestions(r+rStep*2, t-doubleTileStep, rStep, tStep, doubleTileStep, friend, foe, originalPawn, true, capturedArr.slice());
                capturedArr.pop();
            }
        }
    }
    
    /* BACKWARD MOVEMENT */
    if (tiles[r-rStep] && tiles[r-rStep][t+tStep] && !tiles[r-rStep][t+tStep].classList.contains(friend)) { 
        if (tiles[r-rStep][t+tStep].classList.contains(foe)) {
            if (tiles[r-rStep*2] && tiles[r-rStep*2][t+doubleTileStep] && !tiles[r-rStep*2][t+doubleTileStep].captured) { 
                if (!tiles[r-rStep*2][t+doubleTileStep].classList.contains(friend) && !tiles[r-rStep*2][t+doubleTileStep].classList.contains(foe) || tiles[r-rStep*2][t+doubleTileStep] == originalPawn && capturedArr.length >= 3) {
                    capturedArr.push(tiles[r-rStep][t+tStep]);
                    markTiles(r, t, r-rStep*2, t+doubleTileStep, r-rStep, t+tStep, capturedArr.slice());
                    showSuggestions(r-rStep*2, t+doubleTileStep, rStep, tStep, doubleTileStep, friend, foe, originalPawn, true, capturedArr.slice());
                    capturedArr.pop();
                }
            }
        }
        else if (originalPawn.classList.contains("king")) {
            tiles[r-rStep][t+tStep].classList.add("suggested-move");
        }
    }
    
    if (tiles[r-rStep] && tiles[r-rStep][t] && !tiles[r-rStep][t].classList.contains(friend)) { 
        if (tiles[r-rStep][t].classList.contains(foe)) {
            if (tiles[r-rStep*2] && tiles[r-rStep*2][t-doubleTileStep] && !tiles[r-rStep*2][t-doubleTileStep].captured) {
                if (!tiles[r-rStep*2][t-doubleTileStep].classList.contains(friend) && !tiles[r-rStep*2][t-doubleTileStep].classList.contains(foe) || tiles[r-rStep*2][t-doubleTileStep] == originalPawn && capturedArr.length >= 3) {
                    capturedArr.push(tiles[r-rStep][t]);
                    markTiles(r, t, r-rStep*2, t-doubleTileStep, r-rStep, t, capturedArr.slice());
                    showSuggestions(r-rStep*2, t-doubleTileStep, rStep, tStep, doubleTileStep, friend, foe, originalPawn, true, capturedArr.slice());
                }
            }
        }
        else if (originalPawn.classList.contains("king")) {
            tiles[r-rStep][t].classList.add("suggested-move");
        }
    }
}

function markTiles (r, t, rJump, tJump, rCap, tCap, capturedArr) {
    tiles[rJump][tJump].captured = capturedArr;
    tiles[rJump][tJump].classList.add("intermediate-capture");
    tiles[rCap][tCap].classList.add("capture");
}

function executeCapture (captured) {
    if (turn == "white-pawn") {
        captured.forEach(captured => { captured.classList.remove("black-pawn", "king"); blackPawns--; }); 
    }
    else {
        captured.forEach(captured => { captured.classList.remove("white-pawn", "king"); whitePawns--; });
    }
}

function checkGameOver () {
    if (whitePawns == 0 || blackPawns == 0) {
        let winner;
        if (whitePawns == 0) {
            winner = "Black";
        }
        else if (blackPawns == 0) {
            winner = "White";
        }
        gameOverScreen.style.display = "block";
        winnerMessage.textContent = winner + " Player Won!";
        board.style.filter = "blur(1px)";
    }
}