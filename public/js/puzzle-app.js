class PuzzleDashboard extends React.Component {
  state = {
    tiles: [],
    emptyId: '',
    emptyCol: '',
    emptyRow: '',
    complete: false
  };

  componentDidMount() {
    this.loadPuzzleTilesFromServer();
  }

  loadPuzzleTilesFromServer = () => {
    client.getTiles(serverTiles => this.setState({ tiles: serverTiles }));
  };

  handleMakeMoveClick = tileId => {
    this.makeMove(tileId);
  };

  makeMove = clickedTileId => {
    var emptyTile = this.state.tiles.filter(tile => tile.empty == true).pop();
    var clickedTile = this.state.tiles
      .filter(tile => tile.id == clickedTileId)
      .pop();
    var complete = false;

    var tempState = {
      tiles: this.state.tiles.map(tile => {
        if (tile.id === clickedTileId) {
          return Object.assign({}, tile, {
            col: emptyTile.col,
            row: emptyTile.row
          });
        } else if (tile.id === emptyTile.id) {
          return Object.assign({}, tile, {
            col: clickedTile.col,
            row: clickedTile.row
          });
        } else {
          return tile;
        }
      })
    };

    tempState = tempState.tiles;
    emptyTile = Object.assign({}, emptyTile, {
      col: clickedTile.col,
      row: clickedTile.row
    });

    client.getSuccess(success => {
      complete = client.checkSuccess(tempState, success);
      var updatedMovesTiles = client.updateMoves(tempState, emptyTile);
      this.setState({ tiles: updatedMovesTiles, complete: complete });
    });
  };

  render() {
    console.log('render state: ' + this.state.complete);
    if (this.state.complete) {
      return (
        <div className="ui four column centered grid">
          <img src="../images/success.gif" />
        </div>
      );
    } else {
      return (
        <div className="ui four column centered grid">
          <Columns
            tiles={this.state.tiles}
            onMoveClick={this.handleMakeMoveClick}
          />
        </div>
      );
    }
  }
}

class Columns extends React.Component {
  render() {
    const colNames = ['a', 'b', 'c', 'd'];
    var columnTiles = [];
    colNames.map(column => {
      columnTiles[column] = [];
      this.props.tiles.map(tile => {
        if (tile.col == column) {
          columnTiles[column].push(tile);
        }
      });
    });
    const columns = colNames.map(name => {
      return (
        <Column
          key={name}
          id={name}
          tiles={columnTiles[name]}
          onMoveClick={this.props.onMoveClick}
        />
      );
    });
    return (
      <div className="ui equal width center aligned padded grid">{columns}</div>
    );
  }
}

class Column extends React.Component {
  render() {
    const tiles = this.props.tiles.map(tile => (
      <Tile
        key={tile.id}
        id={tile.id}
        file={tile.file}
        col={tile.col}
        canMove={tile.canMove}
        onMoveClick={this.props.onMoveClick}
      />
    ));
    return (
      <div className="four wide column" id={this.props.id}>
        {tiles}
      </div>
    );
  }
}

class Tile extends React.Component {
  handleOnClick = () => {
    this.props.onMoveClick(this.props.id);
  };

  render() {
    if (this.props.canMove) {
      return (
        <div className="ui centered card">
          <div className="content">
            <a href="#" onClick={this.handleOnClick}>
              <img src={'../images/' + this.props.file} />
            </a>
          </div>
        </div>
      );
    } else {
      return (
        <div className="ui centered card">
          <div className="content">
            <img src={'../images/' + this.props.file} />
          </div>
        </div>
      );
    }
  }
}

ReactDOM.render(<PuzzleDashboard />, document.getElementById('content'));
