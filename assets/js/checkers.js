"use strict";
/**********************/
/*VARIABLE DEFINITIONS*/
/**********************/
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var qS = function (selector) { return document.querySelector(selector); };
var qSA = function (selector) { return document.querySelectorAll(selector); };
var loading = qS('#loading');
var coverContainer = qS('#cover-flex-container');
var cover = qS('#cover');
var rules = qS('#rules');
var playButton = qS('#play-button');
var newGameButton = qS('#newgame-button');
var board = qS('#board');
var knights = qSA('.knight');
var tiles = [
    null,
    qSA('.first'),
    qSA('.second'),
    qSA('.third'),
    qSA('.fourth'),
    qSA('.fifth'),
    qSA('.sixth'),
    qSA('.seventh'),
    qSA('.eighth')
];
var turn;
var whitePawns;
var blackPawns;
var lastSelected;
/**********************/
/*FUNCTION DEFINITIONS*/
/**********************/
var gameStart = function () {
    var _a;
    _a = __read(['white-pawn', 12, 12, null], 4), turn = _a[0], whitePawns = _a[1], blackPawns = _a[2], lastSelected = _a[3];
    knights[0].style.opacity = '1';
    knights[1].style.opacity = '0.3';
    tiles.forEach(function (row) { return row && clearTiles(row); }); // tiles[0] is null
    fillPawns();
};
/* Places all the pawns in their initial position */
var fillPawns = function () {
    tiles.forEach(function (row, rowIndex) {
        if (rowIndex >= 1 && rowIndex <= 3) {
            row.forEach(function (tile) { return setPawn('white-pawn', tile); });
        }
        else if (rowIndex >= 6 && rowIndex <= 8) {
            row.forEach(function (tile) { return setPawn('black-pawn', tile); });
        }
    });
    tiles.forEach(function (row, rowIndex) {
        return row && row.forEach(function (tile, tileIndex) {
            return tile.addEventListener('click', function () { return checkChosenPath(tile, rowIndex, tileIndex); });
        });
    });
};
var setPawn = function (pawnColor, tile) {
    tile.classList.add(pawnColor);
    tile[pawnColor == 'white-pawn' ? 'whitePawn' : 'blackPawn'] = true;
};
/* Clears all previous pawns */
var clearTiles = function (tilesRow) {
    tilesRow.forEach(function (tile) {
        tile.classList.remove('white-pawn', 'black-pawn', 'white-king', 'black-king');
        delete tile.whitePawn;
        delete tile.blackPawn;
        delete tile.king;
    });
};
var checkChosenPath = function (selectedTile, row, tile) {
    if (selectedTile.classList.contains('suggested-move-' + turn)) { // if a suggested path is taken (a pawn can move only to a suggested path)
        if (selectedTile.captured) { // if the pressed tile is a suggested capture path
            executeCapture(selectedTile.captured);
        }
        if (turn == 'white-pawn') { // white turn
            if (lastSelected.king || row == 8) { // if the previously selected pawn is a king or is about to become one
                delete lastSelected.king; // since selectedTile and lastSelected might be the same (diamond capture scenario), this line has to be here and not outside the big 'if' statement in line 92
                selectedTile.classList.add('white-king');
                selectedTile.king = true;
            }
            else {
                selectedTile.classList.add('white-pawn');
            }
            if (selectedTile != lastSelected) { // this makes sure that a pawn does not disappear after performing a diamond capture
                lastSelected.classList.remove('white-pawn', 'white-king');
                delete lastSelected.whitePawn;
            }
            selectedTile.whitePawn = true;
        }
        else { // black turn
            if (lastSelected.king || row == 1) {
                delete lastSelected.king;
                selectedTile.classList.add('black-king');
                selectedTile.king = true;
            }
            else {
                selectedTile.classList.add('black-pawn');
            }
            if (selectedTile != lastSelected) {
                lastSelected.classList.remove('black-pawn', 'black-king');
                delete lastSelected.blackPawn;
            }
            selectedTile.blackPawn = true;
        }
        if (!checkGameOver()) {
            switchTurns();
        }
    }
    clearSuggestions();
    if (selectedTile[turn == 'white-pawn' ? 'whitePawn' : 'blackPawn'] && !checkGameOver()) { // if a current turn pawn is selected (checkGameOver prevents the issue when the final move is clicked twice and shows suggestions even after the game is over)
        selectedTile.classList.add('pressed-pawn');
        paths(selectedTile, row, tile);
    }
    if (lastSelected) {
        lastSelected.classList.remove('pressed-pawn');
    }
    lastSelected = selectedTile; // 'remembers' the last tile that was selected, this allows a capturer to move to its new position
};
var paths = function (selectedTile, row, tile) {
    if (turn == 'white-pawn') { // white turn
        (row % 2 == 0) ?
            findPaths(row, tile, 1, 1, 1, 'whitePawn', 'blackPawn', selectedTile) :
            findPaths(row, tile, 1, -1, -1, 'whitePawn', 'blackPawn', selectedTile);
    }
    else { // black turn
        (row % 2 == 0) ?
            findPaths(row, tile, -1, 1, 1, 'blackPawn', 'whitePawn', selectedTile) :
            findPaths(row, tile, -1, -1, -1, 'blackPawn', 'whitePawn', selectedTile);
    }
    var stepTiles = __spread(qSA('.suggested-move-' + turn));
    var captureTiles = __spread(qSA('.intermediate-capture'));
    if (captureTiles.length > 0) { // if there are captures
        filterPaths(stepTiles, captureTiles);
    }
};
var clearSuggestions = function () {
    tiles.forEach(function (row) {
        return row && row.forEach(function (tile) {
            tile.classList.remove('suggested-move-white-pawn', 'suggested-move-black-pawn', 'intermediate-capture', 'capture');
            delete tile.captured;
        });
    });
};
/* A backtracking recursion that finds all of the possible movements */
var findPaths = function (row, tile, rStep, tStep, doubleTileStep, friend, foe, originalPawn, captureOccured, capturedArr) {
    if (captureOccured === void 0) { captureOccured = false; }
    if (capturedArr === void 0) { capturedArr = []; }
    /* FORWARD MOVEMENT */
    if (tiles[row + rStep] && tiles[row + rStep][tile + tStep] && !tiles[row + rStep][tile + tStep][friend]) { // if not friend
        if (!tiles[row + rStep][tile + tStep][foe]) { // if empty and the pressed pawn is not a king
            if (!captureOccured || originalPawn.king)
                tiles[row + rStep][tile + tStep].classList.add('suggested-move-' + turn); // a step without a capture
        }
        else if (tiles[row + rStep * 2] && tiles[row + rStep * 2][tile + doubleTileStep] && !tiles[row + rStep * 2][tile + doubleTileStep].captured) { // if jump tile exists AND has no captured
            if (!tiles[row + rStep * 2][tile + doubleTileStep][friend] && !tiles[row + rStep * 2][tile + doubleTileStep][foe] || tiles[row + rStep * 2][tile + doubleTileStep] == originalPawn && capturedArr.length >= 3) { // if jump tile is empty OR if jump tile equals the pressed tile AND at least 3 captures have been marked
                capturedArr.push(tiles[row + rStep][tile + tStep]);
                showPaths(row + rStep * 2, tile + doubleTileStep, row + rStep, tile + tStep, capturedArr.slice());
                findPaths(row + rStep * 2, tile + doubleTileStep, rStep, tStep, doubleTileStep, friend, foe, originalPawn, true, capturedArr.slice());
                capturedArr.pop();
            }
        }
    }
    if (tiles[row + rStep] && tiles[row + rStep][tile] && !tiles[row + rStep][tile][friend]) {
        if (!tiles[row + rStep][tile][foe]) {
            if (!captureOccured || originalPawn.king)
                tiles[row + rStep][tile].classList.add('suggested-move-' + turn);
        }
        else if (tiles[row + rStep * 2] && tiles[row + rStep * 2][tile - doubleTileStep] && !tiles[row + rStep * 2][tile - doubleTileStep].captured) {
            if (!tiles[row + rStep * 2][tile - doubleTileStep][friend] && !tiles[row + rStep * 2][tile - doubleTileStep][foe] || tiles[row + rStep * 2][tile - doubleTileStep] == originalPawn && capturedArr.length >= 3) {
                capturedArr.push(tiles[row + rStep][tile]);
                showPaths(row + rStep * 2, tile - doubleTileStep, row + rStep, tile, capturedArr.slice());
                findPaths(row + rStep * 2, tile - doubleTileStep, rStep, tStep, doubleTileStep, friend, foe, originalPawn, true, capturedArr.slice());
                capturedArr.pop();
            }
        }
    }
    /* BACKWARD MOVEMENT */
    if (tiles[row - rStep] && tiles[row - rStep][tile + tStep] && !tiles[row - rStep][tile + tStep][friend]) {
        if (tiles[row - rStep][tile + tStep][foe]) {
            if (tiles[row - rStep * 2] && tiles[row - rStep * 2][tile + doubleTileStep] && !tiles[row - rStep * 2][tile + doubleTileStep].captured) {
                if (!tiles[row - rStep * 2][tile + doubleTileStep][friend] && !tiles[row - rStep * 2][tile + doubleTileStep][foe] || tiles[row - rStep * 2][tile + doubleTileStep] == originalPawn && capturedArr.length >= 3) {
                    capturedArr.push(tiles[row - rStep][tile + tStep]);
                    showPaths(row - rStep * 2, tile + doubleTileStep, row - rStep, tile + tStep, capturedArr.slice());
                    findPaths(row - rStep * 2, tile + doubleTileStep, rStep, tStep, doubleTileStep, friend, foe, originalPawn, true, capturedArr.slice());
                    capturedArr.pop();
                }
            }
        }
        else if (originalPawn.king) {
            tiles[row - rStep][tile + tStep].classList.add('suggested-move-' + turn); // only a king is allowed to move backwards without a capture
        }
    }
    if (tiles[row - rStep] && tiles[row - rStep][tile] && !tiles[row - rStep][tile][friend]) {
        if (tiles[row - rStep][tile][foe]) {
            if (tiles[row - rStep * 2] && tiles[row - rStep * 2][tile - doubleTileStep] && !tiles[row - rStep * 2][tile - doubleTileStep].captured) {
                if (!tiles[row - rStep * 2][tile - doubleTileStep][friend] && !tiles[row - rStep * 2][tile - doubleTileStep][foe] || tiles[row - rStep * 2][tile - doubleTileStep] == originalPawn && capturedArr.length >= 3) {
                    capturedArr.push(tiles[row - rStep][tile]);
                    showPaths(row - rStep * 2, tile - doubleTileStep, row - rStep, tile, capturedArr.slice());
                    findPaths(row - rStep * 2, tile - doubleTileStep, rStep, tStep, doubleTileStep, friend, foe, originalPawn, true, capturedArr.slice());
                }
            }
        }
        else if (originalPawn.king) {
            tiles[row - rStep][tile].classList.add('suggested-move-' + turn);
        }
    }
};
var showPaths = function (rowJump, tileJump, rowCapture, tileCapture, capturedArr) {
    tiles[rowJump][tileJump].captured = capturedArr;
    tiles[rowJump][tileJump].classList.add('intermediate-capture');
    tiles[rowCapture][tileCapture].classList.add('capture');
};
var filterPaths = function (stepTiles, captureTiles) {
    stepTiles.forEach(function (tile) { return tile.classList.remove('suggested-move-' + turn); }); // removes all step tiles, since capture is mandatory for a specific pawn
    captureTiles // leaves only the max length captures
        .sort(function (a, b) { return b.captured.length - a.captured.length; })
        .filter(function (tile) { return tile.captured.length == captureTiles[0].captured.length; })
        .forEach(function (tile) {
        tile.classList.remove('intermediate-capture');
        tile.classList.add('suggested-move-' + turn);
    });
};
var executeCapture = function (captured) {
    turn == 'white-pawn' ? blackPawns -= captured.length : whitePawns -= captured.length;
    clearTiles(captured);
};
var switchTurns = function () {
    if (turn == 'white-pawn') {
        turn = 'black-pawn';
        knights[0].style.opacity = '0.3';
        knights[1].style.opacity = '1';
    }
    else {
        turn = 'white-pawn';
        knights[0].style.opacity = '1';
        knights[1].style.opacity = '0.3';
    }
};
var checkGameOver = function () {
    if (whitePawns == 0 || blackPawns == 0) {
        coverContainer.style.display = 'flex';
        cover.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
        board.style.filter = 'blur(8px)';
        newGameButton.style.display = 'inline-block';
        return true;
    }
    return false;
};
/*****************/
/*EVENT LISTENERS*/
/*****************/
window.addEventListener('DOMContentLoaded', function () {
    setTimeout(function () { return loading.style.opacity = '0'; }, 500);
    loading.addEventListener('transitionend', function () { return document.body.removeChild(loading); });
});
knights.forEach(function (knight) { return knight.addEventListener('click', function () {
    if (confirm('Restart the game?')) {
        gameStart();
    }
}); });
playButton.addEventListener('click', function () {
    cover.addEventListener('transitionend', function () { return coverContainer.style.display = 'none'; }); // prevents the 'no cover on first launch' issue
    playButton.style.display = 'none';
    rules.style.display = 'none';
    cover.style.backgroundColor = 'rgba(255, 255, 255, 0)';
    board.style.filter = 'none';
    gameStart();
});
newGameButton.addEventListener('click', function () {
    newGameButton.style.display = 'none';
    cover.style.backgroundColor = 'rgba(255, 255, 255, 0)';
    board.style.filter = 'none';
    gameStart();
});
