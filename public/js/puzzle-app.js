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
    const emptyTile = this.state.tiles.find(tile => tile.empty);
    const clickedTile = this.state.tiles.find(tile => tile.id == clickedTileId);

    const tempTiles = this.state.tiles.map(tile => {
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
    });

    const newEmptyTile = Object.assign({}, emptyTile, {
      col: clickedTile.col,
      row: clickedTile.row
    });

    client.getSuccess(success => {
      this.setState({
        tiles: client.updateMoves(tempTiles, newEmptyTile),
        complete: client.checkSuccess(tempTiles, success)
      });
    });
  };

  render() {
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

function Columns(props) {
  const colNames = ['a', 'b', 'c', 'd'];
  const columnTiles = [];
  colNames.map(column => {
    columnTiles[column] = [];
    props.tiles.map(tile => {
      if (tile.col == column) {
        columnTiles[column].push(tile);
      }
    });
  });
  return (
    <div className="ui equal width center aligned padded grid">
      {colNames.map(name => {
        return (
          <Column
            key={name}
            id={name}
            tiles={columnTiles[name]}
            onMoveClick={props.onMoveClick}
          />
        );
      })}
    </div>
  );
}

function Column(props) {
  return (
    <div className="four wide column" id={props.id}>
      {props.tiles.map(tile => (
        <Tile
          key={tile.id}
          id={tile.id}
          file={tile.file}
          col={tile.col}
          canMove={tile.canMove}
          onMoveClick={props.onMoveClick}
        />
      ))}
    </div>
  );
}

function Tile(props) {
  const handleOnClick = () => {
    props.onMoveClick(props.id);
  };

  if (props.canMove) {
    return (
      <div className="ui centered card">
        <div className="content">
          <a href="#" onClick={handleOnClick}>
            <img src={'../images/' + props.file} />
          </a>
        </div>
      </div>
    );
  } else {
    return (
      <div className="ui centered card">
        <div className="content">
          <img src={'../images/' + props.file} />
        </div>
      </div>
    );
  }
}

ReactDOM.render(<PuzzleDashboard />, document.getElementById('content'));
