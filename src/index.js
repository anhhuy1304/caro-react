import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';


function Square(props) {
  return (
    <button className="square" style={props.style} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (<Square value={this.props.squares[i]}
      style={this.props.listWin.includes(i) ? {backgroundColor:'red'}: {}}
      onClick={() => this.props.onClick(i)} />);
  }

  createTable = () => {
    let table = [];
    for (let i = 0; i < 20; i++) {
      let child = [];
      for (let j = 0; j < 20; j++) {
          child.push(this.renderSquare(i * 20 + j));
      }
      table.push(<div className="board-row">{child}</div>)
    }
    return table;
  }

  render() {
    return (
      <div>
        {this.createTable()}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(20 * 20).fill(null),
      }],
      xIsNext: true,
      stepNumber: 0,
      stepChange: [],
      isWin: false,
      listWin: Array(5).fill(null),
      isDraw: false,
      sort: true //asc
    }
  }
  jumpTo(step) {
    if (step === 0) {
      this.setState({
        history: [{
          squares: Array(20 * 20).fill(null),
        }],
        xIsNext: true,
        stepNumber: 0,
        isWin: false,
        listWin: Array(5).fill(null),
        isWin: false,
      })
    } else {
      this.setState({
        stepNumber: step,
        xIsNext: (step % 2) === 0,
        listWin: Array(5).fill(null),
        isWin: false
      })
    }
  }
  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const step = this.state.stepChange.slice(0,this.state.stepNumber);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    const isWin = this.state.isWin;
    if (isWin || squares[i]) {
      return;
    }

    squares[i] = this.state.xIsNext ? 'X' : 'O';
    const objWinner = calcWinner(squares, i, this.state.xIsNext)

    if (objWinner !== undefined && objWinner.isdraw) {
      this.setState({
        history: history.concat([{
          squares: squares,
        }]),
        stepChange: step.concat([i]),
        isWin: false,
        isDraw: true,
      });
    }
    if (objWinner !== undefined && objWinner.isWin) {
      this.setState({
        history: history.concat([{
          squares: squares,
        }]),
        stepNumber: history.length,
        isWin: true,
        isDraw: false,
        listWin: objWinner.listWin,
        stepChange: step.concat([i]),
      });
    } else {
      this.setState({
        history: history.concat([{
          squares: squares,
        }]),
        xIsNext: !this.state.xIsNext,
        stepNumber: history.length,
        stepChange: step.concat([i]),
      });
    }


  }

  renderHistory(currentStep){
      let history = this.state.history.slice(0, this.state.history.length);
      let stepChange = this.state.stepChange.slice(0, this.state.stepChange.length);
      if(!this.state.sort){ 
        history =  history.reverse();
      }
      return history.map((step, move) => {
      const calcMove = this.state.sort ? move :  history.length - move -1;
      const desc = calcMove ? 'Go to move #'+calcMove+'  at (' + Math.floor(stepChange[calcMove-1]/20)+';'+stepChange[calcMove-1]%20+')' :'Go to game start'
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(calcMove)}
                  style={currentStep == calcMove ? {fontWeight: 'bold'}: {}}>{desc}</button>
        </li>
      )
    })

  }
  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const isWin = this.state.isWin;
    const isDraw = this.state.isDraw;
    const moves =this.renderHistory(this.state.stepNumber);

    let status;
    if (isDraw) {
      status = 'Draw!!!';
    } 
    if (isWin) {
      status = 'Winner: ' + (this.state.xIsNext ? 'X' : 'O');
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O')
    }
    

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
            listWin={this.state.listWin} />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol><button onClick={()=>{this.setState({sort: !this.state.sort})}}>{this.state.sort? 'Ascending': 'Descending'}</button> </ol>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function calcWinner(squares, i, xIsNext) {
  let value;
  let listResult = [];
  if (xIsNext) {
    value = 'X';
  } else {
    value = 'O';
  }
  //check hang ngang
  let totalElement = 1;
  let left = i - 1;
  let right = i + 1;
  let chan1 = false; // trai | tren
  let chan2 = false; // phai | duoi
  while (left % 20 >= 0) {
    if (squares[left] === value) {
      totalElement++;
      listResult.push(left);
      left--;
    } else if (squares[left] === null) {
      break;
    } else {
      chan1 = true;
      break;
    }
  }
  while (right % 20 < 20) {
    if (squares[right] === value) {
      totalElement++;
      listResult.push(right);
      right++;
    } else if (squares[right] === null) {
      break;
    } else {
      chan2 = true;
      break;
    }
  }
  if (totalElement === 5 && !(chan1 === true && chan2 === true)) {
    listResult.push(i)
    return {
      isWin: true,
      listWin: listResult
    };
  }

  //check hang doc
  listResult.length = 0;
  totalElement = 1;
  let top = i - 20;
  let bottom = i + 20;
  chan1 = false; // trai | tren | trai dcc | trai dcp
  chan2 = false; // phai | duoi | phai dcc | phai dcp
  while (top / 20 >= 0) {
    if (squares[top] === value) {
      totalElement++;
      listResult.push(top);
      top = top - 20;
    } else if (squares[top] === null) {
      break;
    } else {
      chan1 = true;
      break;
    }
  }
  while (bottom / 20 < 20) {
    if (squares[bottom] === value) {
      totalElement++;
      listResult.push(bottom);
      bottom = bottom + 20;
    } else if (squares[bottom] === null) {
      break;
    } else {
      chan2 = true;
      break;
    }
  }
  if (totalElement === 5 && !(chan1 === true && chan2 === true)) {
    listResult.push(i);
    return {
      isWin: true,
      listWin: listResult
    };
  }


  //duong cheo phu
  totalElement = 1;
  top = i - 19;
  bottom = i + 19;
  chan1 = false; // trai | tren | trai dcc | trai dcp
  chan2 = false; // phai | duoi | phai dcc | phai dcp
  while (top / 20 >= 0 && top % 20 >= 0 && top % 20 < 20) {
    if (squares[top] === value) {
      totalElement++;
      listResult.push(top);
      top = top - 19;
    } else if (squares[top] === null) {
      break;
    } else {
      chan1 = true;
      break;
    }
  }
  while (bottom / 20 < 20 && bottom % 20 >= 0 && bottom % 20 < 20) {
    if (squares[bottom] === value) {
      totalElement++;
      listResult.push(bottom);
      bottom = bottom + 19;
    } else if (squares[bottom] === null) {
      break;
    } else {
      chan2 = true;
      break;
    }
  }
  if (totalElement === 5 && !(chan1 === true && chan2 === true)) {
    listResult.push(i);
    return {
      isWin: true,
      listWin: listResult
    };
  }

  //duong cheo chinh
  totalElement = 1;
  top = i - 21;
  bottom = i + 21;
  chan1 = false; // trai | tren | trai dcc | trai dcp
  chan2 = false; // phai | duoi | phai dcc | phai dcp
  while (top / 20 >= 0 && top % 20 >= 0 && top % 20 < 20) {
    if (squares[top] === value) {
      totalElement++;
      listResult.push(top);
      top = top - 21;
    } else if (squares[top] === null) {
      break;
    } else {
      chan1 = true;
      break;
    }
  }
  while (bottom / 20 < 20 && bottom % 20 >= 0 && bottom % 20 < 20) {
    if (squares[bottom] === value) {
      totalElement++;
      listResult.push(bottom);
      bottom = bottom + 21;
    } else if (squares[bottom] === null) {
      break;
    } else {
      chan2 = true;
      break;
    }
  }
  if (totalElement === 5 && !(chan1 === true && chan2 === true)) {
    listResult.push(i);
    return {
      isWin: true,
      listWin: listResult
    };
  }
  if (!squares.includes(null)) {
    return {
      isdraw: true
    }
  }
}