/* -VARIABLE DEFINITIONS- */

type TileElement = HTMLElement & {
  whitePawn?: boolean
  blackPawn?: boolean
  king?: boolean
  stepped?: boolean
}

const qS = document.querySelector.bind(document)
const qSA = document.querySelectorAll.bind(document)

const fullscreenIcons: NodeListOf<HTMLImageElement> = qSA('.fullscreen-icon')
const coverContainer: HTMLDivElement = qS('#cover-flex-container')
const cover: HTMLDivElement = qS('#cover')
const rules: HTMLDivElement = qS('#rules')
const playButton: HTMLDivElement = qS('#play-button')
const newGameButton: HTMLDivElement = qS('#newgame-button')
const board: HTMLDivElement = qS('#board')
const knights: NodeListOf<HTMLImageElement> = qSA('.knight')
const tiles: NodeListOf<TileElement>[] = [
  null,
  qSA('.first'),
  qSA('.second'),
  qSA('.third'),
  qSA('.fourth'),
  qSA('.fifth'),
  qSA('.sixth'),
  qSA('.seventh'),
  qSA('.eighth'),
]

let firstGame: boolean = true
let turn: 'white-pawn' | 'black-pawn'
let whitePawns: number
let blackPawns: number
let lastSelected: TileElement
let paths: TileElement[][] = []

/* -FUNCTION DEFINITIONS- */

const gameStart = (): void => {
  turn = 'white-pawn'
  whitePawns = 12
  blackPawns = 12
  lastSelected = null
  knights[0].style.opacity = '1'
  knights[1].style.opacity = '0.3'
  tiles.forEach(row => row && clearTiles(row)) // tiles[0] is null
  fillPawns()
}

/* Clears all of the previous pawns */
const clearTiles = (tilesRow: NodeListOf<TileElement>): void => {
  tilesRow.forEach((tile: TileElement) => {
    tile.classList.remove(
      'pressed-pawn',
      'white-pawn',
      'black-pawn',
      'white-king',
      'black-king',
      'suggested-move-white-pawn',
      'suggested-move-black-pawn',
      'intermediate-capture',
      'capture',
    )
    delete tile.whitePawn
    delete tile.blackPawn
    delete tile.king
  })
}

/* Places all the pawns in their initial position */
const fillPawns = (): void => {
  tiles.forEach((row: NodeListOf<TileElement>, rowIndex: number) => {
    if (rowIndex >= 1 && rowIndex <= 3) {
      row.forEach((tile: TileElement) => setPawn('white-pawn', tile))
    } else if (rowIndex >= 6 && rowIndex <= 8) {
      row.forEach((tile: TileElement) => setPawn('black-pawn', tile))
    }
  })

  if (firstGame) {
    // this ensures that the event listeners are set only once
    tiles.forEach(
      (row: NodeListOf<TileElement>, rowIndex: number) =>
        row &&
        row.forEach((tile: TileElement, tileIndex: number) =>
          tile.addEventListener('click', () =>
            checkChosenPath(tile, rowIndex, tileIndex),
          ),
        ),
    )
  }
}

const setPawn = (
  pawnColor: 'white-pawn' | 'black-pawn',
  tile: TileElement,
): void => {
  tile.classList.add(pawnColor)
  tile[pawnColor == 'white-pawn' ? 'whitePawn' : 'blackPawn'] = true
}

const checkChosenPath = (
  selectedTile: TileElement,
  row: number,
  tile: number,
): void => {
  if (selectedTile.classList.contains(`suggested-move-${turn}`)) {
    if (paths[0].length > 1) {
      const chosenPath: TileElement[] = paths.filter((path: TileElement[]) =>
        path.includes(selectedTile),
      )[0] // [0] is to prevent a 'reversed diamond' capture
      move(chosenPath)
    }

    if (turn == 'white-pawn') {
      // white turn
      if (lastSelected.king || row == 8) {
        // if the previously selected pawn is a king or is about to become one
        delete lastSelected.king
        selectedTile.classList.add('white-king')
        selectedTile.king = true
      } else {
        selectedTile.classList.add('white-pawn')
      }
      if (selectedTile != lastSelected) {
        // this makes sure that a pawn does not disappear after performing a diamond capture
        lastSelected.classList.remove('white-pawn', 'white-king')
        delete lastSelected.whitePawn
      }
      selectedTile.whitePawn = true
    } else {
      // black turn
      if (lastSelected.king || row == 1) {
        delete lastSelected.king
        selectedTile.classList.add('black-king')
        selectedTile.king = true
      } else {
        selectedTile.classList.add('black-pawn')
      }
      if (selectedTile != lastSelected) {
        lastSelected.classList.remove('black-pawn', 'black-king')
        delete lastSelected.blackPawn
      }
      selectedTile.blackPawn = true
    }

    if (!checkGameOver()) switchTurns()
  }

  clearPaths(null, lastSelected)
  if (
    selectedTile[turn == 'white-pawn' ? 'whitePawn' : 'blackPawn'] &&
    !checkGameOver()
  ) {
    selectedTile.classList.add('pressed-pawn')
    handlePaths(selectedTile, row, tile)
  }
  lastSelected = selectedTile // 'remembers' the last tile that was selected, this allows a capturer to move to its new position
}

const move = (chosenPath: TileElement[]): void => {
  turn == 'white-pawn'
    ? (blackPawns -= chosenPath.length / 2)
    : (whitePawns -= chosenPath.length / 2)
  clearPaths(chosenPath)
}

const clearPaths = (
  chosenPath: TileElement[],
  lastSelected?: TileElement,
): void => {
  paths.forEach((path: TileElement[]) =>
    path.forEach((tile: TileElement) => {
      tile.classList.remove(
        'intermediate-capture',
        'capture',
        'suggested-move-white-pawn',
        'suggested-move-black-pawn',
      )
    }),
  )

  if (chosenPath) {
    chosenPath.forEach((tile: TileElement) => {
      tile.classList.remove(
        'white-pawn',
        'black-pawn',
        'white-king',
        'black-king',
      )
      delete tile.whitePawn
      delete tile.blackPawn
      delete tile.king
    })
  }

  paths = []
  if (lastSelected) {
    lastSelected.classList.remove('pressed-pawn')
  }
}

const handlePaths = (
  selectedTile: TileElement,
  row: number,
  tile: number,
): void => {
  if (turn == 'white-pawn') {
    row % 2 == 0
      ? (paths = findPaths(
          row,
          tile,
          1,
          1,
          1,
          'whitePawn',
          'blackPawn',
          selectedTile,
        ))
      : (paths = findPaths(
          row,
          tile,
          1,
          -1,
          -1,
          'whitePawn',
          'blackPawn',
          selectedTile,
        ))
  } else {
    row % 2 == 0
      ? (paths = findPaths(
          row,
          tile,
          -1,
          1,
          1,
          'blackPawn',
          'whitePawn',
          selectedTile,
        ))
      : (paths = findPaths(
          row,
          tile,
          -1,
          -1,
          -1,
          'blackPawn',
          'whitePawn',
          selectedTile,
        ))
  }

  paths.forEach((path: TileElement[]) =>
    path.forEach((tile, ind) => {
      if (ind == path.length - 1) {
        tile.classList.add(`suggested-move-${turn}`)
      } else if (ind % 2 == 0) {
        tile.classList.add('capture')
      } else {
        tile.classList.add('intermediate-capture')
      }
    }),
  )
}

/* A recursive backtracking function that finds all of the possible paths */
const findPaths = (
  row: number,
  tile: number,
  rStep: number,
  tStep: number,
  doubleTileStep: number,
  friend: 'whitePawn' | 'blackPawn',
  foe: 'whitePawn' | 'blackPawn',
  originalTile: TileElement,
  captureOccured: boolean = false,
  path: TileElement[] = [],
): TileElement[][] => {
  const pathsArr: TileElement[][] = []
  tiles[row][tile].stepped = true

  /* FORWARD MOVEMENT */
  if (
    tiles[row + rStep] &&
    tiles[row + rStep][tile + tStep] &&
    !tiles[row + rStep][tile + tStep][friend]
  ) {
    // if not friend
    if (!tiles[row + rStep][tile + tStep][foe]) {
      // if empty
      if (!captureOccured) {
        // a step without a capture
        pathsArr.push([...path, tiles[row + rStep][tile + tStep]])
      }
    } else if (
      tiles[row + rStep * 2] &&
      tiles[row + rStep * 2][tile + doubleTileStep]
    ) {
      // if jump tile exists
      if (
        // if jump tile is empty AND hasn't been stepped on OR if jump tile is the pressed pawn AND at least 5 tiles have been passed through
        (!tiles[row + rStep * 2][tile + doubleTileStep][friend] &&
          !tiles[row + rStep * 2][tile + doubleTileStep][foe] &&
          !tiles[row + rStep * 2][tile + doubleTileStep].stepped) ||
        (tiles[row + rStep * 2][tile + doubleTileStep] == originalTile &&
          path.length > 5 &&
          path.length < 10) // less than 10 prevents the reversed diamond issue
      ) {
        pathsArr.push(
          ...findPaths(
            row + rStep * 2,
            tile + doubleTileStep,
            rStep,
            tStep,
            doubleTileStep,
            friend,
            foe,
            originalTile,
            true,
            [
              ...path,
              tiles[row + rStep][tile + tStep],
              tiles[row + rStep * 2][tile + doubleTileStep],
            ],
          ),
        )
      }
    }
  }

  if (
    tiles[row + rStep] &&
    tiles[row + rStep][tile] &&
    !tiles[row + rStep][tile][friend]
  ) {
    if (!tiles[row + rStep][tile][foe]) {
      if (!captureOccured) {
        pathsArr.push([...path, tiles[row + rStep][tile]])
      }
    } else if (
      tiles[row + rStep * 2] &&
      tiles[row + rStep * 2][tile - doubleTileStep]
    ) {
      if (
        (!tiles[row + rStep * 2][tile - doubleTileStep][friend] &&
          !tiles[row + rStep * 2][tile - doubleTileStep][foe] &&
          !tiles[row + rStep * 2][tile - doubleTileStep].stepped) ||
        (tiles[row + rStep * 2][tile - doubleTileStep] == originalTile &&
          path.length > 5 &&
          path.length < 10)
      ) {
        pathsArr.push(
          ...findPaths(
            row + rStep * 2,
            tile - doubleTileStep,
            rStep,
            tStep,
            doubleTileStep,
            friend,
            foe,
            originalTile,
            true,
            [
              ...path,
              tiles[row + rStep][tile],
              tiles[row + rStep * 2][tile - doubleTileStep],
            ],
          ),
        )
      }
    }
  }

  /* BACKWARD MOVEMENT */
  if (
    tiles[row - rStep] &&
    tiles[row - rStep][tile + tStep] &&
    !tiles[row - rStep][tile + tStep][friend]
  ) {
    if (tiles[row - rStep][tile + tStep][foe]) {
      if (
        tiles[row - rStep * 2] &&
        tiles[row - rStep * 2][tile + doubleTileStep]
      ) {
        if (
          (!tiles[row - rStep * 2][tile + doubleTileStep][friend] &&
            !tiles[row - rStep * 2][tile + doubleTileStep][foe] &&
            !tiles[row - rStep * 2][tile + doubleTileStep].stepped) ||
          (tiles[row - rStep * 2][tile + doubleTileStep] == originalTile &&
            path.length > 5 &&
            path.length < 10)
        ) {
          pathsArr.push(
            ...findPaths(
              row - rStep * 2,
              tile + doubleTileStep,
              rStep,
              tStep,
              doubleTileStep,
              friend,
              foe,
              originalTile,
              true,
              [
                ...path,
                tiles[row - rStep][tile + tStep],
                tiles[row - rStep * 2][tile + doubleTileStep],
              ],
            ),
          )
        }
      }
    } else if (originalTile.king && !captureOccured) {
      // only a king is allowed to move backwards without a capture
      pathsArr.push([...path, tiles[row - rStep][tile + tStep]])
    }
  }

  if (
    tiles[row - rStep] &&
    tiles[row - rStep][tile] &&
    !tiles[row - rStep][tile][friend]
  ) {
    if (tiles[row - rStep][tile][foe]) {
      if (
        tiles[row - rStep * 2] &&
        tiles[row - rStep * 2][tile - doubleTileStep]
      ) {
        if (
          (!tiles[row - rStep * 2][tile - doubleTileStep][friend] &&
            !tiles[row - rStep * 2][tile - doubleTileStep][foe] &&
            !tiles[row - rStep * 2][tile - doubleTileStep].stepped) ||
          (tiles[row - rStep * 2][tile - doubleTileStep] == originalTile &&
            path.length > 5 &&
            path.length < 10)
        ) {
          pathsArr.push(
            ...findPaths(
              row - rStep * 2,
              tile - doubleTileStep,
              rStep,
              tStep,
              doubleTileStep,
              friend,
              foe,
              originalTile,
              true,
              [
                ...path,
                tiles[row - rStep][tile],
                tiles[row - rStep * 2][tile - doubleTileStep],
              ],
            ),
          )
        }
      }
    } else if (originalTile.king && !captureOccured) {
      pathsArr.push([...path, tiles[row - rStep][tile]])
    }
  }

  delete tiles[row][tile].stepped

  return pathsArr.length > 0
    ? pathsArr
        .sort((a, b) => b.length - a.length)
        .filter(path => path.length == pathsArr[0].length)
    : [[...path]]
}

const switchTurns = (): void => {
  if (turn == 'white-pawn') {
    turn = 'black-pawn'
    knights[0].style.opacity = '0.3'
    knights[1].style.opacity = '1'
  } else {
    turn = 'white-pawn'
    knights[0].style.opacity = '1'
    knights[1].style.opacity = '0.3'
  }
}

const checkGameOver = (): boolean => {
  if (whitePawns == 0 || blackPawns == 0) {
    coverContainer.style.display = 'flex'
    cover.style.backgroundColor = 'rgba(255, 255, 255, 0.5)'
    board.style.filter = 'blur(8px)'
    newGameButton.style.display = 'inline-block'
    firstGame = false

    return true
  }
  return false
}

/* -EVENT LISTENERS- */

fullscreenIcons.forEach((icon: HTMLImageElement) =>
  icon.addEventListener('click', () => {
    document.fullscreen
      ? document.exitFullscreen()
      : document.documentElement.requestFullscreen()
  }),
)

knights.forEach((knight: HTMLImageElement) =>
  knight.addEventListener('click', () => {
    if (confirm('Restart the game?')) {
      firstGame = false
      gameStart()
    }
  }),
)

playButton.addEventListener('click', () => {
  cover.addEventListener(
    'transitionend',
    () => (coverContainer.style.display = 'none'),
  )
  playButton.style.display = 'none'
  rules.style.display = 'none'
  cover.style.backgroundColor = 'rgba(255, 255, 255, 0)'
  board.style.filter = 'none'
  gameStart()
})

newGameButton.addEventListener('click', () => {
  newGameButton.style.display = 'none'
  cover.style.backgroundColor = 'rgba(255, 255, 255, 0)'
  board.style.filter = 'none'
  gameStart()
})
