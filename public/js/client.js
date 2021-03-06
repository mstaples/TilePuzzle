/* eslint-disable no-console */
/* eslint-disable no-undef */
window.client = (function () {
    function getTiles(success) {
        return fetch('/api/tiles', {
            headers: {
                Accept: 'application/json',
            },
        }).then(checkStatus)
            .then(parseJSON)
            .then(shuffle)
            .then(success);
    }

    function updateMoves(tiles, emptyTile) {
        tiles = updateOrder(tiles);
        return setMoves(tiles, emptyTile);
    }

    function getSuccess(success) {
        return fetch('/api/tiles/solution', {
            headers: {
                Accept: 'application/json',
            },
        }).then(checkStatus)
            .then(parseJSON)
            .then(success);
    }

    function checkSuccess(tiles, success) {
        for (var i = 0; i < success.length; i++) {
            var match = tiles.filter((tile) => tile.id == success[i].id);
            match = match.pop();
            if (match.row != success[i].row || match.col != success[i].col) {
                return false;
            }
        }

        return true;
    }

    function checkStatus(response) {
        if (response.status >= 200 && response.status < 300) {
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
        var currentIndex = array.length, temporaryValue, randomIndex;
        var emptyTile = {};

        while (0 !== currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;

            if (array[randomIndex]["empty"]) {
                emptyTile = array[randomIndex];
            }
        }

        array = setColumns(array);
        array = setMoves(array, emptyTile);

        return array;
    }

    function updateOrder(array) {
        var columnSorted = { "a": [], "b": [], "c": [], "d": [] };
        array.map((tile) => {
            columnSorted[tile.col][tile.row] = tile;
        });
        var updatedArray = [];
        for (var key in columnSorted) {
            // skip loop if the property is from prototype
            if (!columnSorted.hasOwnProperty(key)) continue;

            var tiles = columnSorted[key];
            var ordered = [];
            for (var id in tiles) {
                // skip loop if the property is from prototype
                if(!tiles.hasOwnProperty(id)) continue;
                updatedArray.push(tiles[id]);
            }
        }

        return updatedArray;
    }

    function setMoves(array, emptyTile) {
        var movable = getMovablePositions(emptyTile);

        return array.map((tile) => {
            var position = tile.col + tile.row;
            tile.canMove = movable.includes(position);
            return tile;
        });
    }
    
    function setColumns(array) {
        array.map((tile, index) => {
            // set column value
            if (index < 4) {
                tile["col"] = "a";
            } else if (index < 8) {
                tile["col"] = "b";
            } else if (index < 12) {
                tile["col"] = "c";
            } else {
                tile["col"] = "d";
            }
            tile["row"] = getNextRow(array, tile["col"]);
            array[index] = tile;
        });

        return array;
    }

    function getNextRow(tiles, column)
    {
        var count = 0;
        tiles.map((tile) => {
            if (tile.col == column) {
                count++;
            }
        });
        return count;
    }

    function getActiveRows(row) {
        var possibleRows = [ 1, 2, 3, 4 ];
        var actualRows = [ row - 1, row, row + 1 ];
        return possibleRows.filter(row => actualRows.includes(row));
    }

    function getActiveColumns(column) {
        var possibleCols = [ "a", "b", "c", "d" ];
        var index = possibleCols.indexOf(column);
        var actualCols = [
            possibleCols[index - 1],
            column,
            possibleCols[index + 1]
        ];
        return possibleCols.filter(columnName => actualCols.includes(columnName));
    }

    function getMovablePositions(emptyTile) {
        var rows = getActiveRows(emptyTile.row);
        var columns = getActiveColumns(emptyTile.col);
        var movablePositions = [];
        columns.filter((colName) => {
            if (colName == emptyTile.col) {
                rows.map((each) => {
                    movablePositions.push(colName + each);
                });
            } else {
                movablePositions.push(colName + emptyTile.row);
            }
        });
        return movablePositions.filter(position => position != emptyTile.col + emptyTile.row);
    }

    return {
        getTiles,
        updateMoves,
        getSuccess,
        checkSuccess
    };
}());
