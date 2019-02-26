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
    knights = document.querySelectorAll(".knight"),
    board = document.querySelector("#board"),
    coverScreen = document.querySelector("#cover-screen"),
    rules =document.querySelector("#rules"),
    playButton = document.querySelector("#play-button"),
    newGameButton = document.querySelector("#newgame-button"),
    turn, 
    whitePawns,
    blackPawns,
    lastSelected,
    setPawns = {
        white: tile => { tile.classList.add("white-pawn"); tile.whitePawn = true; },
        black: tile => { tile.classList.add("black-pawn"); tile.blackPawn = true; }
    };

window.addEventListener("resize", positionElements);
playButton.addEventListener("click", () => { playButton.style.display = "none"; rules.style.display = "none"; coverScreen.style.backgroundColor = "rgba(255, 255, 255, 0)"; gameStart(); });
newGameButton.addEventListener("click", () => { gameStart(); newGameButton.style.display = "none"; coverScreen.style.backgroundColor = "rgba(255, 255, 255, 0)"; gameStart(); });
coverScreen.addEventListener("transitionend", () => coverScreen.style.display = "none");

positionElements();

function positionElements() {
    resizeComputed(knights[0]);
    resizeComputed(knights[1]);
    resizeComputed(board);
    resizeComputed(coverScreen);
    resizeComputed(playButton);
    resizeComputed(newGameButton);
}

function resizeComputed(element) {
    if (element == knights[0] || element == knights[1]) {
        if (window.innerWidth <= 450) {
            element.style.marginTop = "auto";
            element.style.marginLeft = `${window.getComputedStyle(element).width.slice(0, -2) / -2}px`;
        } 
        else {
            element.style.marginTop = `${window.getComputedStyle(element).height.slice(0 ,-2) / -2}px`;
        }
    }
    else {
        if (element == board || element == coverScreen) {
            element.style.height = window.getComputedStyle(element).width; // makes the board a perfect responsive square   
        }
        element.style.marginTop = `${window.getComputedStyle(element).height.slice(0, -2) / -2}px`;
        element.style.marginLeft = `${window.getComputedStyle(element).width.slice(0, -2) / -2}px`;
    }
}

function gameStart() {
    turn = "whitePawn";
    whitePawns = 12;
    blackPawns = 12;
    lastSelected = undefined;
    knights[0].style.opacity = "1";
    knights[1].style.opacity = "0.3";
    for (let row = 1; row < tiles.length; row++) {
        clearTiles(tiles[row]);
    }
    /* Places all the pawns in their initial position */    
    tiles[1].forEach(setPawns.white);
    tiles[2].forEach(setPawns.white);
    tiles[3].forEach(setPawns.white);
    tiles[6].forEach(setPawns.black);
    tiles[7].forEach(setPawns.black);
    tiles[8].forEach(setPawns.black);
    for (let row = 1; row < tiles.length; row++) {
        tiles[row].forEach((tile, index) => tile.addEventListener("click", () => checkMovement(tile, row, index)));
    }
}

/* Clears all previous pawns */
function clearTiles(tiles) {
    tiles.forEach(tile => { tile.classList.remove("white-pawn", "black-pawn", "white-king", "black-king"); delete tile.whitePawn; delete tile.blackPawn; delete tile.king; });
}

function checkMovement(selectedTile, row, tile) {
    if (selectedTile.classList.contains("suggested-move")) { // if a suggested path is clicked (a pawn can move only to a suggested path)
        if (selectedTile.captured) { // if the clicked tile is a suggested capture
            executeCapture(selectedTile.captured);
        }
        if (turn == "whitePawn") { // white turn
            if (lastSelected.king || row == 8) { // if white pawn is already king or has reached last tile
                delete lastSelected.king; // since selectedTile and lastSelected might be the same (diamond capture scenario), this line has to be here and not outside the big 'if' statement
                selectedTile.classList.add("white-king");
                selectedTile.king = true;   
            }
            else {
                selectedTile.classList.add("white-pawn");
            }
            if (selectedTile != lastSelected) { // makes sure that a pawn stays after performing a diamond capture
                lastSelected.classList.remove("white-pawn", "white-king");
                delete lastSelected.whitePawn;  
            }
            selectedTile.whitePawn = true;
        }
        else { // black turn
            if (lastSelected.king || row == 1) { // if black pawn is already king or has reached last tile
                delete lastSelected.king;
                selectedTile.classList.add("black-king");
                selectedTile.king = true;
            }
            else {
                selectedTile.classList.add("black-pawn");
            }
            if (selectedTile != lastSelected) {
                lastSelected.classList.remove("black-pawn", "black-king");
                delete lastSelected.blackPawn;   
            }
            selectedTile.blackPawn = true;
        }
        if (!checkGameOver()) {
            /* Switch turns */
            if (turn == "whitePawn") {
                turn = "blackPawn";
                knights[0].style.opacity = "0.3";
                knights[1].style.opacity = "1";
            }
            else {
                turn = "whitePawn";
                knights[0].style.opacity = "1";
                knights[1].style.opacity = "0.3";
            }
        }
    }
    clearSuggestionsAndCaptures();
    if (lastSelected) lastSelected.classList.remove("pressed-pawn");
    if (selectedTile[turn] && !checkGameOver()) { // if a tile which has a current-turn-pawn on it is selected (checkGameOver prevents the issue when the final move is clicked twice and shows suggestions even after the game is over)
        preShowSuggestions(selectedTile, row, tile);
        selectedTile.classList.toggle("pressed-pawn");
    }
    lastSelected = selectedTile; // "remembers" the last tile that was selected, this allows to move a capturer to its new position
}

function preShowSuggestions(selectedTile, row, tile) {
    if (turn == "whitePawn") { // white turn
        (row%2 == 0) ? showSuggestions(row, tile, 1, 1, 1, "whitePawn", "blackPawn", selectedTile) : showSuggestions(row, tile, 1, -1, -1, "whitePawn", "blackPawn", selectedTile);
    }
    else { // black turn
        (row%2 == 0) ? showSuggestions(row, tile, -1, 1, 1, "blackPawn", "whitePawn", selectedTile) : showSuggestions(row, tile, -1, -1, -1, "blackPawn", "whitePawn", selectedTile);   
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

function clearSuggestionsAndCaptures() {
    for (let i = 1; i < tiles.length; i++) {
        for (let j = 0; j < 4; j++) {
            tiles[i][j].classList.remove("suggested-move", "intermediate-capture", "capture");
            delete tiles[i][j].captured;
        }
    }
}

function showSuggestions(r, t, rStep, tStep, doubleTileStep, friend, foe, originalPawn, captureOccured = false, capturedArr = []) {
    /* FORWARD MOVEMENT */
    if (tiles[r+rStep] && tiles[r+rStep][t+tStep] && !tiles[r+rStep][t+tStep][friend]) { // if not friend
        if (!tiles[r+rStep][t+tStep][foe]) { // if empty and the pressed pawn is not a king
            if (!captureOccured || originalPawn.king) {
                tiles[r+rStep][t+tStep].classList.add("suggested-move"); // a step without a capture
            }
        }
        else if (tiles[r+rStep*2] && tiles[r+rStep*2][t+doubleTileStep] && !tiles[r+rStep*2][t+doubleTileStep].captured) { // if jump tile exists AND has no captured
            if (!tiles[r+rStep*2][t+doubleTileStep][friend] && !tiles[r+rStep*2][t+doubleTileStep][foe] || tiles[r+rStep*2][t+doubleTileStep] == originalPawn && capturedArr.length >= 3) { // if jump tile is empty OR if jump tile equals the pressed tile AND at least 3 captures have been marked
                capturedArr.push(tiles[r+rStep][t+tStep]);
                markTiles(r, t, r+rStep*2, t+doubleTileStep, r+rStep, t+tStep, capturedArr.slice());
                showSuggestions(r+rStep*2, t+doubleTileStep, rStep, tStep, doubleTileStep, friend, foe, originalPawn, true, capturedArr.slice());
                capturedArr.pop();
            }
        }
    }
    
    if (tiles[r+rStep] && tiles[r+rStep][t] && !tiles[r+rStep][t][friend]) {
        if (!tiles[r+rStep][t][foe]) {
            if (!captureOccured || originalPawn.king) {
                tiles[r+rStep][t].classList.add("suggested-move");
            }
        }
        else if (tiles[r+rStep*2] && tiles[r+rStep*2][t-doubleTileStep] && !tiles[r+rStep*2][t-doubleTileStep].captured) {
            if (!tiles[r+rStep*2][t-doubleTileStep][friend] && !tiles[r+rStep*2][t-doubleTileStep][foe] || tiles[r+rStep*2][t-doubleTileStep] == originalPawn && capturedArr.length >= 3) {
                capturedArr.push(tiles[r+rStep][t]);
                markTiles(r, t, r+rStep*2, t-doubleTileStep, r+rStep, t, capturedArr.slice());
                showSuggestions(r+rStep*2, t-doubleTileStep, rStep, tStep, doubleTileStep, friend, foe, originalPawn, true, capturedArr.slice());
                capturedArr.pop();
            }
        }
    }
    
    /* BACKWARD MOVEMENT */
    if (tiles[r-rStep] && tiles[r-rStep][t+tStep] && !tiles[r-rStep][t+tStep][friend]) { 
        if (tiles[r-rStep][t+tStep][foe]) {
            if (tiles[r-rStep*2] && tiles[r-rStep*2][t+doubleTileStep] && !tiles[r-rStep*2][t+doubleTileStep].captured) { 
                if (!tiles[r-rStep*2][t+doubleTileStep][friend] && !tiles[r-rStep*2][t+doubleTileStep][foe] || tiles[r-rStep*2][t+doubleTileStep] == originalPawn && capturedArr.length >= 3) {
                    capturedArr.push(tiles[r-rStep][t+tStep]);
                    markTiles(r, t, r-rStep*2, t+doubleTileStep, r-rStep, t+tStep, capturedArr.slice());
                    showSuggestions(r-rStep*2, t+doubleTileStep, rStep, tStep, doubleTileStep, friend, foe, originalPawn, true, capturedArr.slice());
                    capturedArr.pop();
                }
            }
        }
        else if (originalPawn.king) {
            tiles[r-rStep][t+tStep].classList.add("suggested-move");
        }
    }
    
    if (tiles[r-rStep] && tiles[r-rStep][t] && !tiles[r-rStep][t][friend]) { 
        if (tiles[r-rStep][t][foe]) {
            if (tiles[r-rStep*2] && tiles[r-rStep*2][t-doubleTileStep] && !tiles[r-rStep*2][t-doubleTileStep].captured) {
                if (!tiles[r-rStep*2][t-doubleTileStep][friend] && !tiles[r-rStep*2][t-doubleTileStep][foe] || tiles[r-rStep*2][t-doubleTileStep] == originalPawn && capturedArr.length >= 3) {
                    capturedArr.push(tiles[r-rStep][t]);
                    markTiles(r, t, r-rStep*2, t-doubleTileStep, r-rStep, t, capturedArr.slice());
                    showSuggestions(r-rStep*2, t-doubleTileStep, rStep, tStep, doubleTileStep, friend, foe, originalPawn, true, capturedArr.slice());
                }
            }
        }
        else if (originalPawn.king) {
            tiles[r-rStep][t].classList.add("suggested-move");
        }
    }
}

function markTiles(r, t, rJump, tJump, rCap, tCap, capturedArr) {
    tiles[rJump][tJump].captured = capturedArr;
    tiles[rJump][tJump].classList.add("intermediate-capture");
    tiles[rCap][tCap].classList.add("capture");
}

function executeCapture(captured) {
    clearTiles(captured);
    turn == "whitePawn" ? blackPawns -= captured.length : whitePawns -= captured.length;
}

function checkGameOver() {
    if (whitePawns == 0 || blackPawns == 0) {
        coverScreen.style.display = "block";
        coverScreen.style.backgroundColor = "rgba(255, 255, 255, 0.4)";
        newGameButton.style.display = "inline-block";
        resizeComputed(coverScreen);
        resizeComputed(newGameButton);
        return true;
    }
    return false;
}