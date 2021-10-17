// config
const BOARD_COLUMNS_COUNT = 16;
const BOARD_ROWS_COUNT = 16;

// elements
const bodyEl = document.querySelector('body');
const boardEl = document.getElementById('board');
const startEl = document.getElementById('start');
const stopEl = document.getElementById('stop');

// globals
let board = [[]];
let isDrawing = false;
let isIterating = false;

function reset() {
  // init board state
  board = createEmptyBoard();

  // init board element
  boardEl.textContent = '';
  board.forEach(column => {
    const columnEl = document.createElement('div');
    column.forEach(cell => {
      const cellEl = document.createElement('div');
      columnEl.append(cellEl);
    });
    boardEl.append(columnEl);
  });
}

function createEmptyBoard() {
  return (
    Array.from({ length: BOARD_COLUMNS_COUNT }, () =>
      Array.from({ length: BOARD_ROWS_COUNT }, () =>
        false
      )
    )
  );
}

function setLife(x, y, isAlive) {
  if (board[x][y] === isAlive) {
    // nothing to do
    return;
  }

  // update cell state
  board[x][y] = isAlive;

  // update cell element
  const cellEl = boardEl.children[x].children[y];
  cellEl.toggleAttribute('data-is-alive', isAlive)
}

function setLifeFromElement(cellEl, isAlive) {
  if (cellEl.parentElement.parentElement !== boardEl) {
    // this is not a cell element
    return;
  }
  
  const columnEl = cellEl.parentElement;
  const x = [...boardEl.children].indexOf(columnEl);
  const y = [...columnEl.children].indexOf(cellEl);
  setLife(x, y, isAlive);
}

function countNeighbors(x, y) {
  // array of coordinate offsets to all 8 (potential) neighbors
  const offsets = [
    [-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]
  ];

  return offsets
    .map(([xOffset, yOffset]) => [x + xOffset, y + yOffset]) // change to absolute positions
    .filter(([xPos, yPos]) => (
      xPos >= 0 && xPos < BOARD_COLUMNS_COUNT && // check if within x bounds
      yPos >= 0 && yPos < BOARD_ROWS_COUNT &&    // check if within y bounds
      board[xPos][yPos]                          // check if is alive
    ))
    .length; // return count of neighbors
}

function iterate() {
  // will hold the next state of the board
  const nextBoard = createEmptyBoard();
  
  // first pass, determine next state of all life on current board
  for (let x = 0; x < BOARD_COLUMNS_COUNT; x++) {
    for (let y = 0; y < BOARD_ROWS_COUNT; y++) {
      const isAlive = board[x][y];
      const neighbors = countNeighbors(x, y);
      if (isAlive && (neighbors === 2 || neighbors === 3)) {
        // life continues
        nextBoard[x][y] = true;
      } else if (!isAlive && neighbors === 3) {
        // life is created
        nextBoard[x][y] = true;
      }
    }
  }

  // second pass, copy state of all life from next to current
  for (let x = 0; x < BOARD_COLUMNS_COUNT; x++) {
    for (let y = 0; y < BOARD_ROWS_COUNT; y++) {
      setLife(x, y, nextBoard[x][y]);
    }
  }
}

async function startIterating() {
  if (isIterating) {
    // already iterating
    return;
  }

  isIterating = true;
  startEl.disabled = true;
  stopEl.disabled = false;

  while (true) {
    iterate();

    // sleep
    await new Promise(resolve => setTimeout(resolve, 200));

    if (!isIterating) {
      break;
    }
  }
}

function stopIterating() {
  if (!isIterating) {
    // already not iterating
    return;
  }

  isIterating = false;
  startEl.disabled = false;
  stopEl.disabled = true;
}

// start iterating
startEl.addEventListener('click', () => {
  startIterating();
});

// stop iterating
stopEl.addEventListener('click', () => {
  stopIterating();
});

// create life in this cell and start drawing
boardEl.addEventListener('mousedown', (event) => {
  setLifeFromElement(event.target, !event.shiftKey);
  isDrawing = true;
});

// create life in cells while drawing
boardEl.addEventListener('mouseover', (event) => {
  if (isDrawing) {
    setLifeFromElement(event.target, !event.shiftKey);
  }
});

// stop drawing
bodyEl.addEventListener('mouseup', () => {
  isDrawing = false;
});

// stop drawing
bodyEl.addEventListener('mouseleave', () => {
  isDrawing = false;
});

// disable dragging
boardEl.addEventListener('dragstart', (event) => {
  event.preventDefault();
});

reset();
