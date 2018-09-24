/* eslint-disable no-console */
/* eslint-disable no-undef */
window.client = (function() {
  function getTiles(success) {
    return fetch('/api/tiles', {
      headers: {
        Accept: 'application/json'
      }
    })
      .then(checkStatus)
      .then(parseJSON)
      .then(shuffle)
      .then(success);
  }

  function updateMoves(tiles, emptyTile) {
    return setMoves(updateOrder(tiles), emptyTile);
  }

  function getSuccess(success) {
    if (this.solution) {
      return success(this.solution);
    }
    return fetch('/api/tiles/solution', {
      headers: {
        Accept: 'application/json'
      }
    })
      .then(checkStatus)
      .then(parseJSON)
      .then(solution => {
        this.solution = solution;
        success(this.solution);
      });
  }

  function checkSuccess(tiles, success) {
    for (const successTile of success) {
      const match = tiles.find(tile => tile.id == successTile.id);
      if (match.row != successTile.row || match.col != successTile.col) {
        return false;
      }
    }
    return true;
  }

  function checkStatus(response) {
    if (response.ok) {
      return response;
    } else {
      const error = new Error(`HTTP Error ${response.statusText}`);
      error.status = response.statusText;
      error.response = response;
      console.log(error);
      throw error;
    }
  }

  function parseJSON(response) {
    return response.json();
  }

  function shuffle(array) {
    let currentIndex = array.length,
      temporaryValue,
      randomIndex,
      emptyTile = {};

    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;

      if (array[randomIndex]['empty']) {
        emptyTile = array[randomIndex];
      }
    }
    return setMoves(setColumns(array), emptyTile);
  }

  function updateOrder(array) {
    const sortedColumns = { a: [], b: [], c: [], d: [] };
    array.map(tile => {
      sortedColumns[tile.col][tile.row] = tile;
    });
    // Iterating through an object uses arbitrary order, so we use an array of
    // column names for our loop.
    const columnNames = ['a', 'b', 'c', 'd'];
    const updatedArray = [];
    for (const column of columnNames) {
      for (const tile of sortedColumns[column]) {
        if (tile) {
          updatedArray.push(tile);
        }
      }
    }
    return updatedArray;
  }

  function setMoves(array, emptyTile) {
    var movable = getMovablePositions(emptyTile);

    return array.map(tile => {
      var position = tile.col + tile.row;
      tile.canMove = movable.includes(position);
      return tile;
    });
  }

  function setColumns(array) {
    array.map((tile, index) => {
      // set column value
      if (index < 4) {
        tile['col'] = 'a';
      } else if (index < 8) {
        tile['col'] = 'b';
      } else if (index < 12) {
        tile['col'] = 'c';
      } else {
        tile['col'] = 'd';
      }
      tile['row'] = getNextRow(array, tile['col']);
      array[index] = tile;
    });

    return array;
  }

  function getNextRow(tiles, column) {
    var count = 0;
    tiles.map(tile => {
      if (tile.col == column) {
        count++;
      }
    });
    return count;
  }

  function getActiveRows(row) {
    var possibleRows = [1, 2, 3, 4];
    var actualRows = [row - 1, row, row + 1];
    return possibleRows.filter(row => actualRows.includes(row));
  }

  function getActiveColumns(column) {
    var possibleCols = ['a', 'b', 'c', 'd'];
    var index = possibleCols.indexOf(column);
    var actualCols = [possibleCols[index - 1], column, possibleCols[index + 1]];
    return possibleCols.filter(columnName => actualCols.includes(columnName));
  }

  function getMovablePositions(emptyTile) {
    var rows = getActiveRows(emptyTile.row);
    var columns = getActiveColumns(emptyTile.col);
    var movablePositions = [];
    columns.filter(colName => {
      if (colName == emptyTile.col) {
        rows.map(each => {
          movablePositions.push(colName + each);
        });
      } else {
        movablePositions.push(colName + emptyTile.row);
      }
    });
    return movablePositions.filter(
      position => position != emptyTile.col + emptyTile.row
    );
  }

  return {
    getTiles,
    updateMoves,
    getSuccess,
    checkSuccess
  };
})();
