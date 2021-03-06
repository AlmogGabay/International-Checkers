"use strict";
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
var qS = document.querySelector.bind(document);
var qSA = document.querySelectorAll.bind(document);
var fullscreenIcons = qSA('.fullscreen-icon');
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
    qSA('.eighth'),
];
var firstGame = true;
var turn;
var whitePawns;
var blackPawns;
var lastSelected;
var paths = [];
var gameStart = function () {
    turn = 'white-pawn';
    whitePawns = 12;
    blackPawns = 12;
    lastSelected = null;
    knights[0].style.opacity = '1';
    knights[1].style.opacity = '0.3';
    tiles.forEach(function (row) {
        if (row)
            clearTiles(row);
    });
    fillPawns();
};
var clearTiles = function (tilesRow) {
    tilesRow.forEach(function (tile) {
        tile.classList.remove('pressed-pawn', 'white-pawn', 'black-pawn', 'white-king', 'black-king', 'suggested-move-white-pawn', 'suggested-move-black-pawn', 'intermediate-capture', 'capture');
        delete tile.whitePawn;
        delete tile.blackPawn;
        delete tile.king;
    });
};
var fillPawns = function () {
    tiles.forEach(function (row, rowIndex) {
        if (rowIndex >= 1 && rowIndex <= 3) {
            row.forEach(function (tile) { return setPawn('white-pawn', tile); });
        }
        else if (rowIndex >= 6 && rowIndex <= 8) {
            row.forEach(function (tile) { return setPawn('black-pawn', tile); });
        }
    });
    if (!firstGame)
        return;
    tiles.forEach(function (row, rowIndex) { return row === null || row === void 0 ? void 0 : row.forEach(function (tile, tileIndex) {
        return tile.addEventListener('click', function () { return checkChosenPath(tile, rowIndex, tileIndex); });
    }); });
};
var setPawn = function (pawnColor, tile) {
    tile.classList.add(pawnColor);
    tile[pawnColor == 'white-pawn' ? 'whitePawn' : 'blackPawn'] = true;
};
var checkChosenPath = function (selectedTile, row, tile) {
    if (selectedTile.classList.contains("suggested-move-" + turn)) {
        if (paths[0].length > 1) {
            var chosenPath = paths.filter(function (path) { return path.includes(selectedTile); })[0];
            move(chosenPath);
        }
        if (turn == 'white-pawn') {
            if (lastSelected.king || row == 8) {
                delete lastSelected.king;
                selectedTile.classList.add('white-king');
                selectedTile.king = true;
            }
            else {
                selectedTile.classList.add('white-pawn');
            }
            if (selectedTile != lastSelected) {
                lastSelected.classList.remove('white-pawn', 'white-king');
                delete lastSelected.whitePawn;
            }
            selectedTile.whitePawn = true;
        }
        else {
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
        if (!checkGameOver())
            switchTurns();
    }
    clearPaths(null, lastSelected);
    if (selectedTile[turn == 'white-pawn' ? 'whitePawn' : 'blackPawn'] && !checkGameOver()) {
        selectedTile.classList.add('pressed-pawn');
        handlePaths(selectedTile, row, tile);
    }
    lastSelected = selectedTile;
};
var move = function (chosenPath) {
    turn == 'white-pawn' ? (blackPawns -= chosenPath.length / 2) : (whitePawns -= chosenPath.length / 2);
    clearPaths(chosenPath);
};
var clearPaths = function (chosenPath, lastSelected) {
    paths.forEach(function (path) {
        return path.forEach(function (tile) {
            tile.classList.remove('intermediate-capture', 'capture', 'suggested-move-white-pawn', 'suggested-move-black-pawn');
        });
    });
    if (chosenPath) {
        chosenPath.forEach(function (tile) {
            tile.classList.remove('white-pawn', 'black-pawn', 'white-king', 'black-king');
            delete tile.whitePawn;
            delete tile.blackPawn;
            delete tile.king;
        });
    }
    paths = [];
    if (lastSelected) {
        lastSelected.classList.remove('pressed-pawn');
    }
};
var handlePaths = function (selectedTile, row, tile) {
    if (turn == 'white-pawn') {
        row % 2 == 0
            ? (paths = findPaths(row, tile, 1, 1, 1, 'whitePawn', 'blackPawn', selectedTile))
            : (paths = findPaths(row, tile, 1, -1, -1, 'whitePawn', 'blackPawn', selectedTile));
    }
    else {
        row % 2 == 0
            ? (paths = findPaths(row, tile, -1, 1, 1, 'blackPawn', 'whitePawn', selectedTile))
            : (paths = findPaths(row, tile, -1, -1, -1, 'blackPawn', 'whitePawn', selectedTile));
    }
    paths.forEach(function (path) {
        return path.forEach(function (tile, ind) {
            if (ind == path.length - 1) {
                tile.classList.add("suggested-move-" + turn);
            }
            else if (ind % 2 == 0) {
                tile.classList.add('capture');
            }
            else {
                tile.classList.add('intermediate-capture');
            }
        });
    });
};
var findPaths = function (row, tile, rStep, tStep, doubleTileStep, friend, foe, originalTile, captureOccured, path) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    if (captureOccured === void 0) { captureOccured = false; }
    if (path === void 0) { path = []; }
    var pathsArr = [];
    tiles[row][tile].stepped = true;
    if (((_a = tiles[row + rStep]) === null || _a === void 0 ? void 0 : _a[tile + tStep]) && !tiles[row + rStep][tile + tStep][friend]) {
        if (!tiles[row + rStep][tile + tStep][foe]) {
            if (!captureOccured) {
                pathsArr.push(__spread(path, [tiles[row + rStep][tile + tStep]]));
            }
        }
        else if ((_b = tiles[row + rStep * 2]) === null || _b === void 0 ? void 0 : _b[tile + doubleTileStep]) {
            if ((!tiles[row + rStep * 2][tile + doubleTileStep][friend] &&
                !tiles[row + rStep * 2][tile + doubleTileStep][foe] &&
                !tiles[row + rStep * 2][tile + doubleTileStep].stepped) ||
                (tiles[row + rStep * 2][tile + doubleTileStep] == originalTile && path.length > 5 && path.length < 10)) {
                pathsArr.push.apply(pathsArr, __spread(findPaths(row + rStep * 2, tile + doubleTileStep, rStep, tStep, doubleTileStep, friend, foe, originalTile, true, __spread(path, [tiles[row + rStep][tile + tStep], tiles[row + rStep * 2][tile + doubleTileStep]]))));
            }
        }
    }
    if (((_c = tiles[row + rStep]) === null || _c === void 0 ? void 0 : _c[tile]) && !tiles[row + rStep][tile][friend]) {
        if (!tiles[row + rStep][tile][foe]) {
            if (!captureOccured) {
                pathsArr.push(__spread(path, [tiles[row + rStep][tile]]));
            }
        }
        else if ((_d = tiles[row + rStep * 2]) === null || _d === void 0 ? void 0 : _d[tile - doubleTileStep]) {
            if ((!tiles[row + rStep * 2][tile - doubleTileStep][friend] &&
                !tiles[row + rStep * 2][tile - doubleTileStep][foe] &&
                !tiles[row + rStep * 2][tile - doubleTileStep].stepped) ||
                (tiles[row + rStep * 2][tile - doubleTileStep] == originalTile && path.length > 5 && path.length < 10)) {
                pathsArr.push.apply(pathsArr, __spread(findPaths(row + rStep * 2, tile - doubleTileStep, rStep, tStep, doubleTileStep, friend, foe, originalTile, true, __spread(path, [tiles[row + rStep][tile], tiles[row + rStep * 2][tile - doubleTileStep]]))));
            }
        }
    }
    if (((_e = tiles[row - rStep]) === null || _e === void 0 ? void 0 : _e[tile + tStep]) && !tiles[row - rStep][tile + tStep][friend]) {
        if (tiles[row - rStep][tile + tStep][foe]) {
            if ((_f = tiles[row - rStep * 2]) === null || _f === void 0 ? void 0 : _f[tile + doubleTileStep]) {
                if ((!tiles[row - rStep * 2][tile + doubleTileStep][friend] &&
                    !tiles[row - rStep * 2][tile + doubleTileStep][foe] &&
                    !tiles[row - rStep * 2][tile + doubleTileStep].stepped) ||
                    (tiles[row - rStep * 2][tile + doubleTileStep] == originalTile && path.length > 5 && path.length < 10)) {
                    pathsArr.push.apply(pathsArr, __spread(findPaths(row - rStep * 2, tile + doubleTileStep, rStep, tStep, doubleTileStep, friend, foe, originalTile, true, __spread(path, [tiles[row - rStep][tile + tStep], tiles[row - rStep * 2][tile + doubleTileStep]]))));
                }
            }
        }
        else if (originalTile.king && !captureOccured) {
            pathsArr.push(__spread(path, [tiles[row - rStep][tile + tStep]]));
        }
    }
    if (((_g = tiles[row - rStep]) === null || _g === void 0 ? void 0 : _g[tile]) && !tiles[row - rStep][tile][friend]) {
        if (tiles[row - rStep][tile][foe]) {
            if ((_h = tiles[row - rStep * 2]) === null || _h === void 0 ? void 0 : _h[tile - doubleTileStep]) {
                if ((!tiles[row - rStep * 2][tile - doubleTileStep][friend] &&
                    !tiles[row - rStep * 2][tile - doubleTileStep][foe] &&
                    !tiles[row - rStep * 2][tile - doubleTileStep].stepped) ||
                    (tiles[row - rStep * 2][tile - doubleTileStep] == originalTile && path.length > 5 && path.length < 10)) {
                    pathsArr.push.apply(pathsArr, __spread(findPaths(row - rStep * 2, tile - doubleTileStep, rStep, tStep, doubleTileStep, friend, foe, originalTile, true, __spread(path, [tiles[row - rStep][tile], tiles[row - rStep * 2][tile - doubleTileStep]]))));
                }
            }
        }
        else if (originalTile.king && !captureOccured) {
            pathsArr.push(__spread(path, [tiles[row - rStep][tile]]));
        }
    }
    delete tiles[row][tile].stepped;
    return pathsArr.length > 0
        ? pathsArr.sort(function (a, b) { return b.length - a.length; }).filter(function (path) { return path.length == pathsArr[0].length; })
        : [__spread(path)];
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
        cover.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
        board.style.filter = 'blur(8px)';
        newGameButton.style.display = 'inline-block';
        firstGame = false;
        return true;
    }
    return false;
};
fullscreenIcons.forEach(function (icon) {
    return icon.addEventListener('click', function () {
        document.fullscreen ? document.exitFullscreen() : document.documentElement.requestFullscreen();
    });
});
knights.forEach(function (knight) {
    return knight.addEventListener('click', function () {
        if (confirm('Restart the game?')) {
            firstGame = false;
            gameStart();
        }
    });
});
playButton.addEventListener('click', function () {
    cover.addEventListener('transitionend', function () { return (coverContainer.style.display = 'none'); });
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
