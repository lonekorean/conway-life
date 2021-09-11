// constants
const BOARD_COLUMNS_COUNT = 15;
const BOARD_ROWS_COUNT = 15;

class Board {
  constructor(columns, rows, el) {
    this.columns = columns;
    this.rows = rows;
    this.el = el;
    this.isIterating = false;

    // init board state
    this.board = this.createEmptyBoard();
    
    // init board element
    this.el.textContent = '';
    this.board.forEach(column => {
      const columnEl = document.createElement('div');
      column.forEach(cell => {
        const cellEl = document.createElement('div');
        columnEl.append(cellEl);
      });
      this.el.append(columnEl);
    });    
  }

  createEmptyBoard() {
    return (
      Array.from({ length: this.columns }, () =>
        Array.from({ length: this.rows }, () =>
          false
        )
      )
    );
  }

  createLife(x, y) {
    this.setLife(x, y, true);
  }
  
  endLife(x, y) {
    this.setLife(x, y, false);
  }
  
  setLife(x, y, isAlive) {
    if (this.board[x][y] === isAlive) {
      // nothing to do
      return;
    }

    // update cell state
    this.board[x][y] = isAlive;

    // update cell element
    const cellEl = this.el.children[x].children[y];
    cellEl.toggleAttribute('data-is-alive', isAlive)
  }
  
  setLifeFromElement(cellEl) {
    if (cellEl.parentElement.parentElement !== this.el) {
      // this is not a cell element
      return;
    }
    
    const columnEl = cellEl.parentElement;
    const x = [...this.el.children].indexOf(columnEl);
    const y = [...columnEl.children].indexOf(cellEl);
    this.createLife(x, y);
  }

  countNeighbors(x, y) {
    // array of coordinate offsets to all 8 (potential) neighbors
    const offsets = [
      [-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]
    ];
    
    return offsets
      .map(([xOffset, yOffset]) => [x + xOffset, y + yOffset]) // change to absolute positions
      .filter(([xPos, yPos]) => (
        xPos >= 0 && xPos < this.columns && // check if within x bounds
        yPos >= 0 && yPos < this.rows &&    // check if within y bounds
        this.board[xPos][yPos]              // check if is alive
      ))
      .length; // return count of neighbors
  }

  iterate() {
    // will hold the next state of the board
    const nextBoard = this.createEmptyBoard();
    
    // first pass, determine next state of all life on current board
    for (let x = 0; x < this.columns; x++) {
      for (let y = 0; y < this.rows; y++) {
        const isAlive = this.board[x][y];
        const neighbors = this.countNeighbors(x, y);
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
    for (let x = 0; x < this.columns; x++) {
      for (let y = 0; y < this.rows; y++) {
        this.setLife(x, y, nextBoard[x][y]);
      }
    }
  }
  
  async startIterating() {
    if (this.isIterating) {
      // already iterating
      return;
    }

    this.isIterating = true;
    while (true) {
      this.iterate();

      // sleep
      await new Promise(resolve => setTimeout(resolve, 200));

      if (!this.isIterating) {
        break;
      }
    }
  }
  
  stopIterating() {
    this.isIterating = false;
  }
}

// elements
const bodyEl = document.querySelector('body');
const boardEl = document.getElementById('board');
const startEl = document.getElementById('start');
const stopEl = document.getElementById('stop');

// globals
const board = new Board(BOARD_COLUMNS_COUNT, BOARD_ROWS_COUNT, boardEl);
let isDrawing = false;

// start iterating
startEl.addEventListener('click', () => {
  board.startIterating();
});

// stop iterating
stopEl.addEventListener('click', () => {
  board.stopIterating();
});

// create life in this cell and start drawing
boardEl.addEventListener('mousedown', (event) => {
  board.setLifeFromElement(event.target);
  isDrawing = true;
});

// create life in cells while drawing
boardEl.addEventListener('mouseover', (event) => {
  if (isDrawing) {
    board.setLifeFromElement(event.target);
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
