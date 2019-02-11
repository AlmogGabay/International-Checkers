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
    turn = "white-pawn", 
    whitePawns = 12,
    blackPawns = 12,
    lastSelected,
    captureFlag = false,
    setPawns = {
        white: tile => tile.classList.add("white-pawn"),
        black: tile => tile.classList.add("black-pawn")
    }

startButton.addEventListener("click", () => {
    gameStart();
    startButton.style.opacity = "0";
});
startButton.addEventListener("transitionend", function () { this.style.display = "none" });

/* Places all the pawns in their initial position */
function gameStart () { 
    tiles[1].forEach(setPawns.white);
    tiles[2].forEach(setPawns.white);
    tiles[3].forEach(setPawns.white);
    tiles[6].forEach(setPawns.black);
    tiles[7].forEach(setPawns.black);
    tiles[8].forEach(setPawns.black);
    printTurn.textContent = turn;
    for (let i = 1; i < tiles.length; i++) {
        for (let j = 0; j < 4; j++) {
            tiles[i][j].addEventListener("click", function() { checkMovement(this, i, j); });
        }
    }
}

function checkMovement (selectedTile, row, tile) {
    if (selectedTile.classList.contains("suggested-move")) { // if a suggested path is clicked
        if (selectedTile.captured) { // if the clicked tile is a suggested capture
            executeCapture(selectedTile.captured);
        }
        if (row == 8 || row == 1) {
            selectedTile.classList.add("king");
        }
        lastSelected.classList.remove(turn);
        selectedTile.classList.add(turn);
        turn = (turn == "white-pawn") ?  "black-pawn" : "white-pawn"; // switch turns
        printTurn.textContent = turn;
    }
    clearSuggestionsAndCaptures();
    if (selectedTile.classList.contains(turn)) { // if a tile which has a current-turn-pawn on it is selected
        preShowSuggestions(selectedTile, row, tile);
    }
    lastSelected = selectedTile; // "remembers" the last tile that was selected, this allows to move a capturer to its new position
}

function preShowSuggestions (selectedTile, row, tile) {
    if (turn == "white-pawn") { // white turn
        if (selectedTile.classList.contains("king")) {
            
        }
        else {
            (row%2 == 0) ? showSuggestions(row, tile, 1, 1, 1, "white-pawn", "black-pawn", selectedTile) : showSuggestions(row, tile, 1, -1, -1, "white-pawn", "black-pawn", selectedTile);
        }
    }
    else { // black turn
        if (selectedTile.classList.contains("king")) {
            
        }
        else {
            (row%2 == 0) ? showSuggestions(row, tile, -1, 1, 1, "black-pawn", "white-pawn", selectedTile) : showSuggestions(row, tile, -1, -1, -1, "black-pawn", "white-pawn", selectedTile);   
        }
    }
    if (captureFlag) {
        let stepTiles = Array.prototype.slice.call(document.querySelectorAll(".suggested-move")),
        captureTiles = Array.prototype.slice.call(document.querySelectorAll(".intermediate-capture"));
        stepTiles.forEach((tile) => {tile.classList.remove("suggested-move")}); // if theres a capture, remove all step tiles
        captureTiles // leave only the max length captures
        .sort((a, b) => b.captured.length - a.captured.length)
        .filter(tile => tile.captured.length == captureTiles[0].captured.length)
        .forEach(tile => {
            tile.classList.remove("intermediate-capture");
            tile.classList.add("suggested-move");
        });
    }
    captureFlag = false;
}

function clearSuggestionsAndCaptures () {
    for (let i = 1; i < tiles.length; i++) {
        for (let j = 0; j < 4; j++) {
            tiles[i][j].classList.remove("suggested-move", "intermediate-capture", "capture");
            delete tiles[i][j].captured;
        }
    }
}

// function showSuggestions (r, t, rStep, tStep, doubleTileStep, friend, foe, originalPawn, captureOccured = false, capturedArr = []) {
//     /* FORWARD MOVEMENT */
//     if (tiles[r+rStep] && tiles[r+rStep][t+tStep] && !tiles[r+rStep][t+tStep].classList.contains(friend)) { // if not friend
//         if (!tiles[r+rStep][t+tStep].classList.contains(foe)) { // if empty
//             if (!captureOccured) {
//                 tiles[r+rStep][t+tStep].classList.add("suggested-move"); // a step without a capture
//             }
//         }
//         else { // if foe
//             if (tiles[r+rStep*2] && tiles[r+rStep*2][t+doubleTileStep] && !tiles[r+rStep*2][t+doubleTileStep].classList.contains(friend) && !tiles[r+rStep*2][t+doubleTileStep].classList.contains(foe)) { // if next is empty
//                 capturedArr.push(tiles[r+rStep][t+tStep]);
//                 if (!tiles[r+rStep*2][t+doubleTileStep].captured) {
//                     tiles[r+rStep*2][t+doubleTileStep].captured = capturedArr.slice(); // PREVENTS ALIASING!   
//                 }
//                 tiles[r+rStep*2][t+doubleTileStep].classList.add("intermediate-capture");
//                 tiles[r+rStep][t+tStep].classList.add("capture");
//                 showSuggestions(r+rStep*2, t+doubleTileStep, rStep, tStep, doubleTileStep, friend, foe, originalPawn, true, capturedArr.slice()); // PREVENTS ALIASING!
//                 capturedArr.pop();
//             }
//         }
//     }
    
//     if (tiles[r+rStep] && tiles[r+rStep][t] && !tiles[r+rStep][t].classList.contains(friend)) { // if not friend
//         if (!tiles[r+rStep][t].classList.contains(foe)) { // if empty
//             if (!captureOccured) {
//                 tiles[r+rStep][t].classList.add("suggested-move"); // a step without a capture
//             }
//         }
//         else { // if foe
//             if (tiles[r+rStep*2] && tiles[r+rStep*2][t-doubleTileStep] && !tiles[r+rStep*2][t-doubleTileStep].classList.contains(friend) && !tiles[r+rStep*2][t-doubleTileStep].classList.contains(foe)) {
//                 capturedArr.push(tiles[r+rStep][t]);
//                 if (!tiles[r+rStep*2][t-doubleTileStep].captured) {
//                     tiles[r+rStep*2][t-doubleTileStep].captured = capturedArr.slice(); // PREVENTS ALIASING! 
//                 }
//                 tiles[r+rStep*2][t-doubleTileStep].classList.add("intermediate-capture");
//                 tiles[r+rStep][t].classList.add("capture");
//                 showSuggestions(r+rStep*2, t-doubleTileStep, rStep, tStep, doubleTileStep, friend, foe, originalPawn, true, capturedArr.slice()); // PREVENTS ALIASING!
//                 capturedArr.pop();
//             }
//         }
//     }
//     /* BACKWARDS MOVEMENT */
//     if (tiles[r-rStep] && tiles[r-rStep][t+tStep] && !tiles[r-rStep][t+tStep].classList.contains(friend) && tiles[r-rStep][t+tStep].classList.contains(foe)) { // if foe
//         if (tiles[r-rStep*2] && tiles[r-rStep*2][t+doubleTileStep] && !tiles[r-rStep*2][t+doubleTileStep].classList.contains(friend) && !tiles[r-rStep*2][t+doubleTileStep].classList.contains(foe) && !tiles[r-rStep*2][t+doubleTileStep].captured) { // .captured prevents infinite recursion
//             capturedArr.push(tiles[r-rStep][t+tStep]);
//             if (!tiles[r-rStep*2][t+doubleTileStep].captured) {
//                 tiles[r-rStep*2][t+doubleTileStep].captured = capturedArr.slice(); // PREVENTS ALIASING!   
//             }
//             tiles[r-rStep*2][t+doubleTileStep].classList.add("intermediate-capture");
//             tiles[r-rStep][t+tStep].classList.add("capture");
//             showSuggestions(r-rStep*2, t+doubleTileStep, rStep, tStep, doubleTileStep, friend, foe, originalPawn, true, capturedArr.slice()); // PREVENTS ALIASING!
//             capturedArr.pop();
//         }
//     }
    
//     if (tiles[r-rStep] && tiles[r-rStep][t] && !tiles[r-rStep][t].classList.contains(friend) && tiles[r-rStep][t].classList.contains(foe)) { // if foe
//         if (tiles[r-rStep*2] && tiles[r-rStep*2][t-doubleTileStep] && !tiles[r-rStep*2][t-doubleTileStep].classList.contains(friend) && !tiles[r-rStep*2][t-doubleTileStep].classList.contains(foe) && !tiles[r-rStep*2][t-doubleTileStep].captured) {// .captured prevents infinite recursion
//             capturedArr.push(tiles[r-rStep][t]);
//             if (!tiles[r-rStep*2][t-doubleTileStep].captured) {
//                 tiles[r-rStep*2][t-doubleTileStep].captured = capturedArr.slice(); // PREVENTS ALIASING! 
//             }
//             tiles[r-rStep*2][t-doubleTileStep].classList.add("intermediate-capture");
//             tiles[r-rStep][t].classList.add("capture");
//             showSuggestions(r-rStep*2, t-doubleTileStep, rStep, tStep, doubleTileStep, friend, foe, originalPawn, true, capturedArr.slice()); // PREVENTS ALIASING!
//         }
//     }
//     if (captureOccured) captureFlag = true;
// }


function showSuggestions (r, t, rStep, tStep, doubleTileStep, friend, foe, originalPawn, captureOccured = false, capturedArr = []) {
    /* FORWARD MOVEMENT */
    if (tiles[r+rStep] && tiles[r+rStep][t+tStep] && !tiles[r+rStep][t+tStep].classList.contains(friend)) { // if not friend
        if (!tiles[r+rStep][t+tStep].classList.contains(foe)) { // if empty
            if (!captureOccured) {
                tiles[r+rStep][t+tStep].classList.add("suggested-move"); // a step without a capture
            }
        }
        else if (tiles[r+rStep*2] && tiles[r+rStep*2][t+doubleTileStep] && !tiles[r+rStep*2][t+doubleTileStep].captured) { // if jump tile exists AND has no captured
            if (!tiles[r+rStep*2][t+doubleTileStep].classList.contains(friend) && !tiles[r+rStep*2][t+doubleTileStep].classList.contains(foe)) { // if jump tile is empty
                capturedArr.push(tiles[r+rStep][t+tStep]);
                tiles[r+rStep*2][t+doubleTileStep].captured = capturedArr.slice();
                tiles[r+rStep*2][t+doubleTileStep].classList.add("intermediate-capture");
                tiles[r+rStep][t+tStep].classList.add("capture");
                showSuggestions(r+rStep*2, t+doubleTileStep, rStep, tStep, doubleTileStep, friend, foe, originalPawn, true, capturedArr.slice());
                capturedArr.pop();
            }
            else if (tiles[r+rStep*2][t+doubleTileStep] == originalPawn && capturedArr.length >= 3) { // if jump tile equals pressed pawn AND a perfect diamond scenario AND jump tile doesn't have captured
                capturedArr.push(tiles[r+rStep][t+tStep]);
                tiles[r+rStep*2][t+doubleTileStep].captured = capturedArr.slice();
                tiles[r+rStep*2][t+doubleTileStep].classList.add("intermediate-capture");
                showSuggestions(r+rStep*2, t+doubleTileStep, rStep, tStep, doubleTileStep, friend, foe, originalPawn, true, capturedArr.slice());
                capturedArr.pop();
            }
        }
    }
    
    if (tiles[r+rStep] && tiles[r+rStep][t] && !tiles[r+rStep][t].classList.contains(friend)) {
        if (!tiles[r+rStep][t].classList.contains(foe)) {
            if (!captureOccured) {
                tiles[r+rStep][t].classList.add("suggested-move");
            }
        }
        else if (tiles[r+rStep*2] && tiles[r+rStep*2][t-doubleTileStep] && !tiles[r+rStep*2][t-doubleTileStep].captured) {
            if (!tiles[r+rStep*2][t-doubleTileStep].classList.contains(friend) && !tiles[r+rStep*2][t-doubleTileStep].classList.contains(foe)) {
                capturedArr.push(tiles[r+rStep][t]);
                tiles[r+rStep*2][t-doubleTileStep].captured = capturedArr.slice();
                tiles[r+rStep*2][t-doubleTileStep].classList.add("intermediate-capture");
                tiles[r+rStep][t].classList.add("capture");
                showSuggestions(r+rStep*2, t-doubleTileStep, rStep, tStep, doubleTileStep, friend, foe, originalPawn, true, capturedArr.slice());
                capturedArr.pop();
            }
            else if (tiles[r+rStep*2][t-doubleTileStep] == originalPawn && capturedArr.length >= 3) {
                capturedArr.push(tiles[r+rStep][t]);
                tiles[r+rStep*2][t-doubleTileStep].captured = capturedArr.slice();
                tiles[r+rStep*2][t-doubleTileStep].classList.add("intermediate-capture");
                showSuggestions(r+rStep*2, t-doubleTileStep, rStep, tStep, doubleTileStep, friend, foe, originalPawn, true, capturedArr.slice());
                capturedArr.pop();
            }
        }
    }
    
    /* BACKWARDS MOVEMENT */
    if (tiles[r-rStep] && tiles[r-rStep][t+tStep] && !tiles[r-rStep][t+tStep].classList.contains(friend) && tiles[r-rStep][t+tStep].classList.contains(foe)) {
        if (tiles[r-rStep*2] && tiles[r-rStep*2][t+doubleTileStep] && !tiles[r-rStep*2][t+doubleTileStep].captured) { 
            if (!tiles[r-rStep*2][t+doubleTileStep].classList.contains(friend) && !tiles[r-rStep*2][t+doubleTileStep].classList.contains(foe)) {
                capturedArr.push(tiles[r-rStep][t+tStep]);
                if (!tiles[r-rStep*2][t+doubleTileStep].captured) {
                    tiles[r-rStep*2][t+doubleTileStep].captured = capturedArr.slice(); 
                }
                tiles[r-rStep*2][t+doubleTileStep].classList.add("intermediate-capture");
                tiles[r-rStep][t+tStep].classList.add("capture");
                showSuggestions(r-rStep*2, t+doubleTileStep, rStep, tStep, doubleTileStep, friend, foe, originalPawn, true, capturedArr.slice());
                capturedArr.pop();
            }
            else if (tiles[r-rStep*2][t+doubleTileStep] == originalPawn && capturedArr.length >= 3) {
                capturedArr.push(tiles[r-rStep][t+tStep]);
                tiles[r-rStep*2][t+doubleTileStep].captured = capturedArr.slice();
                tiles[r-rStep*2][t+doubleTileStep].classList.add("intermediate-capture");
                showSuggestions(r-rStep*2, t+doubleTileStep, rStep, tStep, doubleTileStep, friend, foe, originalPawn, true, capturedArr.slice());
                capturedArr.pop();
            }
        }
    }
    
    if (tiles[r-rStep] && tiles[r-rStep][t] && !tiles[r-rStep][t].classList.contains(friend) && tiles[r-rStep][t].classList.contains(foe)) {
        if (tiles[r-rStep*2] && tiles[r-rStep*2][t-doubleTileStep] && !tiles[r-rStep*2][t-doubleTileStep].captured) {
            if (!tiles[r-rStep*2][t-doubleTileStep].classList.contains(friend) && !tiles[r-rStep*2][t-doubleTileStep].classList.contains(foe)) {
                capturedArr.push(tiles[r-rStep][t]);
                if (!tiles[r-rStep*2][t-doubleTileStep].captured) {
                    tiles[r-rStep*2][t-doubleTileStep].captured = capturedArr.slice();
                }
                tiles[r-rStep*2][t-doubleTileStep].classList.add("intermediate-capture");
                tiles[r-rStep][t].classList.add("capture");
                showSuggestions(r-rStep*2, t-doubleTileStep, rStep, tStep, doubleTileStep, friend, foe, originalPawn, true, capturedArr.slice());
            }
            else if (tiles[r-rStep*2][t-doubleTileStep] == originalPawn && capturedArr.length >= 3) {
                capturedArr.push(tiles[r-rStep][t]);
                tiles[r-rStep*2][t-doubleTileStep].captured = capturedArr.slice();
                tiles[r-rStep*2][t-doubleTileStep].classList.add("intermediate-capture");
                showSuggestions(r-rStep*2, t-doubleTileStep, rStep, tStep, doubleTileStep, friend, foe, originalPawn, true, capturedArr.slice());
                capturedArr.pop();
            }
        }
    }
    
    if (captureOccured) captureFlag = true;
}

function executeCapture (captured) {
    if (turn == "white-pawn") {
        captured.forEach(captured => {captured.classList.remove("black-pawn"); blackPawns--;}); 
    }
    else {
        captured.forEach(captured => {captured.classList.remove("white-pawn"); whitePawns--;});
    }
}