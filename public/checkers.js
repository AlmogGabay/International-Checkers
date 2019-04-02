let root = qS(":root"),
    loading = qS("#loading"),
    tiles = [null, qS(".first", true), qS(".second", true), qS(".third", true), qS(".fourth", true), 
                   qS(".fifth", true), qS(".sixth", true), qS(".seventh", true), qS(".eighth", true)],
    knights = qS(".knight", true),
    board = qS("#board"),
    coverContainer = qS("#cover-flex-container"),
    cover = qS("#cover"),
    rules = qS("#rules"),
    playButton = qS("#play-button"),
    newGameButton = qS("#newgame-button"),
    turn,
    whitePawns,
    blackPawns,
    lastSelected,
    setPawns = {
        white: tile => { tile.classList.add("white-pawn"); tile.whitePawn = true; },
        black: tile => { tile.classList.add("black-pawn"); tile.blackPawn = true; }
    };

window.addEventListener("DOMContentLoaded", () => { 
    getWidth(); 
    setTimeout(() => loading.style.opacity = "0", 500);
    loading.addEventListener("transitionend", () => loading.style.display = "none");
});
window.addEventListener("resize", () => getWidth());
playButton.addEventListener("click", () => { 
    cover.addEventListener("transitionend", () => coverContainer.style.display = "none"); // prevents the 'no cover on first launch' issue
    playButton.style.display = rules.style.display = "none"; 
    cover.style.backgroundColor = "rgba(255, 255, 255, 0)"; 
    gameStart(); 
});
newGameButton.addEventListener("click", () => { newGameButton.style.display = "none"; cover.style.backgroundColor = "rgba(255, 255, 255, 0)"; gameStart(); });

/* Shortens querySelector */
function qS(selector, all) {
    return all ? document.querySelectorAll(selector) : document.querySelector(selector);
}

function getWidth() {
    if (window.visualViewport) {
        if (window.visualViewport.width >= 1200) {
            resize(0.45, 0.1, true);
        } else if (window.visualViewport.width <= 576) {
            resize(0.95, 0.1, true);
        } else {
            resize((-1/1248) * window.visualViewport.width + (367/260), 0.1, true); // f(x) = (-1/1248)x + (367/260)
        }
    } 
    else {
        if (window.innerWidth >= 1200) {
            resize(0.45);
        } else if (window.innerWidth <= 576) {
            resize(0.95);
        } else {
            resize((-1/1248) * window.innerWidth + (367/260)); // f(x) = (-1/1248)x + (367/260)
        }
    }
}

function resize(bM, kM = 0.1, vV) { // boardMuliplier, knightMultiplier, visualViewport
    let boardWidth, knightWidth;
    if (vV) {
        boardWidth = window.visualViewport.width * bM + "px",
        knightWidth = window.visualViewport.width * kM + "px";    
    }
    else {
        boardWidth = window.innerWidth * bM + "px",
        knightWidth = window.innerWidth * kM + "px";
    }
    board.style.width = board.style.height = cover.style.width = cover.style.height = boardWidth;
    knights[0].style.width = knights[1].style.width = knightWidth;
    root.style.fontSize = `${boardWidth.slice(0, -2) / 50}px`;
    if (window.getComputedStyle(board).width != window.getComputedStyle(board).height) {
        resize(bM, kM / 2, vV);
    }
}

function gameStart() {
    [turn, whitePawns, blackPawns, lastSelected] = ["blackPawn", 12, 12, null]; // turn will be changed to white in fillPawns
    knights[0].style.opacity = "1";
    knights[1].style.opacity = "0.3";
    tiles.forEach(row => !row || clearTiles(row)); // tiles[0] is null
    tiles.forEach(row => !row || row.forEach(tile => tile.style.cursor = "default")); // removes all cursors
    fillPawns();
}

/* Places all the pawns in their initial position */
function fillPawns() {
    tiles.forEach((row, rowIndex) => {
        if (rowIndex >= 1 && rowIndex <= 3) {
            row.forEach(setPawns.white);
        } else if (rowIndex >= 6 && rowIndex <= 8) {
            row.forEach(setPawns.black);
        }
    });
    tiles.forEach((row, rowIndex) =>
        !row || row.forEach((tile, tileIndex) =>
            tile.addEventListener("click", () => checkMovement(tile, rowIndex, tileIndex))
        )
    );
    switchTurns(); // We call it here to make sure that all the cursors will be correct when pressing "Play Again"
}

/* Clears all previous pawns */
function clearTiles(tilesRow) {
    tilesRow.forEach(tile => { 
        tile.classList.remove("white-pawn", "black-pawn", "white-king", "black-king"); 
        delete tile.whitePawn; delete tile.blackPawn; delete tile.king; 
    });
}

function checkMovement(selectedTile, row, tile) {
    if (selectedTile.classList.contains("suggested-move")) { // if a suggested path is clicked (a pawn can move only to a suggested path)
        if (selectedTile.captured) executeCapture(selectedTile.captured); // if the clicked tile is a suggested capture path
        if (turn == "whitePawn") { // white turn
            if (lastSelected.king || row == 8) { // if the previously selected pawn is a king or is about to become one
                delete lastSelected.king; // since selectedTile and lastSelected might be the same (diamond capture scenario), this line has to be here and not outside the big 'if' statement in line 92
                selectedTile.classList.add("white-king");
                selectedTile.king = true;   
            }
            else {
                selectedTile.classList.add("white-pawn");
            }
            if (selectedTile != lastSelected) { // this makes sure that a pawn does not disappear after performing a diamond capture
                lastSelected.classList.remove("white-pawn", "white-king");
                delete lastSelected.whitePawn;  
            }
            selectedTile.whitePawn = true;
        }
        else { // black turn
            if (lastSelected.king || row == 1) {
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
            switchTurns();
        }
    }
    clearSuggestions();
    if (selectedTile[turn] && !checkGameOver()) { // if a current turn pawn is selected (checkGameOver prevents the issue when the final move is clicked twice and shows suggestions even after the game is over)
        selectedTile.classList.add("pressed-pawn");
        showSuggestions(selectedTile, row, tile);
    }
    if (lastSelected && lastSelected != selectedTile) { 
        lastSelected.classList.remove("pressed-pawn");
        if (!lastSelected[turn]) {
            lastSelected.style.cursor = "default";   
        }
    }
    lastSelected = selectedTile; // "remembers" the last tile that was selected, this allows a capturer to move to its new position
}

function showSuggestions(selectedTile, row, tile) {
    if (turn == "whitePawn") { // white turn
        (row%2 == 0) ? backtrackMovements(row, tile, 1, 1, 1, "whitePawn", "blackPawn", selectedTile) : backtrackMovements(row, tile, 1, -1, -1, "whitePawn", "blackPawn", selectedTile);
    }
    else { // black turn
        (row%2 == 0) ? backtrackMovements(row, tile, -1, 1, 1, "blackPawn", "whitePawn", selectedTile) : backtrackMovements(row, tile, -1, -1, -1, "blackPawn", "whitePawn", selectedTile);   
    }
    let stepTiles = Array.prototype.slice.call(document.querySelectorAll(".suggested-move")),
        captureTiles = Array.prototype.slice.call(document.querySelectorAll(".intermediate-capture"));
    if (captureTiles.length > 0) { // if there are captures
        stepTiles.forEach(t => t.classList.remove("suggested-move")); // removes all step tiles, since capture is mandatory for a specific pawn
        captureTiles // leaves only the max length captures
        .sort((a, b) => b.captured.length - a.captured.length) // sorts by capture magnitude
        .filter(tile => tile.captured.length == captureTiles[0].captured.length) // leaves only the longest capture paths
        .forEach(tile => { tile.classList.remove("intermediate-capture"); tile.classList.add("suggested-move"); });
    }
}

function clearSuggestions() {
    tiles.forEach(row => 
        !row || row.forEach(tile => {
            tile.classList.remove("suggested-move", "intermediate-capture", "capture");
            delete tile.captured;
        })
    );
}

/* The backtracking recursion which calculates all the possible movements */
function backtrackMovements(r, t, rStep, tStep, doubleTileStep, friend, foe, originalPawn, captureOccured = false, capturedArr = []) { // row, tile, rowStep, tileStep
    /* FORWARD MOVEMENT */
    if (tiles[r+rStep] && tiles[r+rStep][t+tStep] && !tiles[r+rStep][t+tStep][friend]) { // if not friend
        if (!tiles[r+rStep][t+tStep][foe]) { // if empty and the pressed pawn is not a king
            if (!captureOccured || originalPawn.king) tiles[r+rStep][t+tStep].classList.add("suggested-move"); // a step without a capture
        }
        else if (tiles[r+rStep*2] && tiles[r+rStep*2][t+doubleTileStep] && !tiles[r+rStep*2][t+doubleTileStep].captured) { // if jump tile exists AND has no captured
            if (!tiles[r+rStep*2][t+doubleTileStep][friend] && !tiles[r+rStep*2][t+doubleTileStep][foe] || tiles[r+rStep*2][t+doubleTileStep] == originalPawn && capturedArr.length >= 3) { // if jump tile is empty OR if jump tile equals the pressed tile AND at least 3 captures have been marked
                capturedArr.push(tiles[r+rStep][t+tStep]);
                markTiles(r+rStep*2, t+doubleTileStep, r+rStep, t+tStep, capturedArr.slice());
                backtrackMovements(r+rStep*2, t+doubleTileStep, rStep, tStep, doubleTileStep, friend, foe, originalPawn, true, capturedArr.slice());
                capturedArr.pop();
            }
        }
    }
    
    if (tiles[r+rStep] && tiles[r+rStep][t] && !tiles[r+rStep][t][friend]) {
        if (!tiles[r+rStep][t][foe]) {
            if (!captureOccured || originalPawn.king) tiles[r+rStep][t].classList.add("suggested-move");
        }
        else if (tiles[r+rStep*2] && tiles[r+rStep*2][t-doubleTileStep] && !tiles[r+rStep*2][t-doubleTileStep].captured) {
            if (!tiles[r+rStep*2][t-doubleTileStep][friend] && !tiles[r+rStep*2][t-doubleTileStep][foe] || tiles[r+rStep*2][t-doubleTileStep] == originalPawn && capturedArr.length >= 3) {
                capturedArr.push(tiles[r+rStep][t]);
                markTiles(r+rStep*2, t-doubleTileStep, r+rStep, t, capturedArr.slice());
                backtrackMovements(r+rStep*2, t-doubleTileStep, rStep, tStep, doubleTileStep, friend, foe, originalPawn, true, capturedArr.slice());
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
                    markTiles(r-rStep*2, t+doubleTileStep, r-rStep, t+tStep, capturedArr.slice());
                    backtrackMovements(r-rStep*2, t+doubleTileStep, rStep, tStep, doubleTileStep, friend, foe, originalPawn, true, capturedArr.slice());
                    capturedArr.pop();
                }
            }
        }
        else if (originalPawn.king) {
            tiles[r-rStep][t+tStep].classList.add("suggested-move"); // only a king is allowed to move backwards without a capture
        }
    }
    
    if (tiles[r-rStep] && tiles[r-rStep][t] && !tiles[r-rStep][t][friend]) { 
        if (tiles[r-rStep][t][foe]) {
            if (tiles[r-rStep*2] && tiles[r-rStep*2][t-doubleTileStep] && !tiles[r-rStep*2][t-doubleTileStep].captured) {
                if (!tiles[r-rStep*2][t-doubleTileStep][friend] && !tiles[r-rStep*2][t-doubleTileStep][foe] || tiles[r-rStep*2][t-doubleTileStep] == originalPawn && capturedArr.length >= 3) {
                    capturedArr.push(tiles[r-rStep][t]);
                    markTiles(r-rStep*2, t-doubleTileStep, r-rStep, t, capturedArr.slice());
                    backtrackMovements(r-rStep*2, t-doubleTileStep, rStep, tStep, doubleTileStep, friend, foe, originalPawn, true, capturedArr.slice());
                }
            }
        }
        else if (originalPawn.king) {
            tiles[r-rStep][t].classList.add("suggested-move");
        }
    }
}

/* Colors the possible paths */
function markTiles(rowJump, tileJump, rowCap, tileCap, capturedArr) { // Cap means 'capture'
    tiles[rowJump][tileJump].captured = capturedArr;
    tiles[rowJump][tileJump].classList.add("intermediate-capture");
    tiles[rowCap][tileCap].classList.add("capture");
}

function executeCapture(captured) {
    turn == "whitePawn" ? blackPawns -= captured.length : whitePawns -= captured.length;
    clearTiles(captured);
}

function switchTurns() {
    if (turn == "whitePawn") {
        turn = "blackPawn";
        knights[0].style.opacity = "0.3";
        knights[1].style.opacity = "1";
        qS(".white-pawn, .white-king", true).forEach(pawn => pawn.style.cursor = "default");
        qS(".black-pawn, .black-king", true).forEach(pawn => pawn.style.cursor = "pointer");
    }
    else {
        turn = "whitePawn";
        knights[0].style.opacity = "1";
        knights[1].style.opacity = "0.3";
        qS(".black-pawn, .black-king", true).forEach(pawn => pawn.style.cursor = "default");
        qS(".white-pawn, .white-king", true).forEach(pawn => pawn.style.cursor = "pointer");
    }
}

function checkGameOver() {
    if (whitePawns == 0 || blackPawns == 0) {
        coverContainer.style.display = "flex";
        cover.style.backgroundColor = "rgba(255, 255, 255, 0.4)";
        newGameButton.style.display = "inline-block";
        return true;
    }
    return false;
}