import './App.css';
import React from 'react';

class Cell extends React.Component {

  onChange(e) {
    this.props.setValue(e.target.value, this.props.rowNum, this.props.colNum)
    this.props.setMatrix()
  }

  render() {
    return (
      <input type='number' className="cell-input" value={this.props.value} onChange={this.onChange.bind(this)}/>
    )
  }
}

class Dimension extends React.Component {

  onChange(e) {
    var setValue = this.props.setValue
    var promise = new Promise(function(resolve, reject) {
      setValue(e.target.value)
      resolve()
    })
    promise.then( () => {this.props.setMatrix()})
  }

  render() {
    return (
      <input type='number' className="dim-input" value={this.props.value} onChange={this.onChange.bind(this)}/>
    )
  }
}

class Error extends React.Component {
  render() {
  return <p className='errorMessage'>{this.props.message}</p>
  }
}

class Matrix extends React.Component {

  constructor(props) {
    super(props)
    this.makeCells = this.makeCells.bind(this)
    this.state = {
      numRows: this.props.defaultRows,
      numRowsDisplay: this.props.defaultRows,
      numCols: this.props.defaultCols,
      numColsDisplay: this.props.defaultCols,
      cells: this.initCells(),
      frozen: false
    }
  }

  componentDidMount() {
    this.setMatrix()
  }

  initCells() {
    return this.makeEmptyMatrix(5, 5)
  }

  makeEmptyMatrix(numRows, numCols) {
    var rows = []
    for (var i=0; i<numRows; i++) {
      rows.push([])
      for (var j=0; j<numCols; j++) {
        rows[i].push('')
      }
    }
    return rows
  }

  setNumRows(value) {
    if (value === '') {
      this.setState({numRowsDisplay: ''})
      return
    }
    var numRows = parseInt(value)
    if (numRows > 5) {
      numRows = 5
    }
    this.setState({numRowsDisplay: numRows})
    this.setState({numRows: numRows})
  }

  setNumCols(value) {
    if (value === '') {
      this.setState({numColsDisplay: ''})
      return
    }
    var numCols = parseInt(value)
    if (numCols > 5) {
      numCols = 5
    }
    this.setState({numColsDisplay: numCols})
    this.setState({numCols: numCols})
  }

  setCell(value, rowNum, colNum) {
    var cells = this.state.cells
    cells[rowNum][colNum] = value
    this.setState({cells: cells})
  }

  makeCells(numRows, numCols) {
    var rows = []
    for (var i=0; i<numRows; i++) {
      var row = []
      for (var j=0; j<numCols; j++) {
        row.push(<Cell 
          rowNum={i} 
          colNum={j} 
          value={this.state.cells[i][j]} 
          className="cell-input" 
          setValue={this.setCell.bind(this)} 
          setMatrix={this.setMatrix.bind(this)}
          />
        )
      }
      rows.push(<div>{row}</div>)
    }
    return rows
  }

  getMatrix() {
    var numRows = this.state.numRows
    var numCols = this.state.numCols
    var matrix = this.makeEmptyMatrix(numRows, numCols)
    for (var i=0; i<numRows; i++) {
      for (var j=0; j<numCols; j++) {
        var value = this.state.cells[i][j]
        matrix[i][j] = value
      }
    }
    return matrix
  }

  setMatrix() {
    var matrix = this.getMatrix()
    var index = this.props.index
    this.props.setMatrix(index, matrix)
  }

  render() {
    var cells = this.makeCells(this.state.numRows, this.state.numCols)
    return <div className="matrix">
      <Dimension 
        className="dim-input" 
        setValue={this.setNumRows.bind(this)}  
        setMatrix={this.setMatrix.bind(this)}
        value={this.state.numRowsDisplay}/>
      <span className="x">X</span>
      <Dimension 
        className="dim-input" 
        setValue={this.setNumCols.bind(this)} 
        setMatrix={this.setMatrix.bind(this)}
        value={this.state.numColsDisplay}/>
      <div>{cells}</div>
    </div>
  }
}

class Calculator extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      inputMatrices: [],
      outputMatrix: [[1,2,3],[4,5,6],[7,8,9]],
      outputIsHidden: true,
      errorMessage: ''
    }
  }
  
  setMatrices(index, matrix) {
    var inputMatrices = this.state.inputMatrices
    inputMatrices[index] = matrix
    this.setState({inputMatrices: inputMatrices})
  }

  matricesAreFull() {
    for (var i=0; i<this.state.inputMatrices.length; i++) {
      var matrix = this.state.inputMatrices[i]
      for (var j=0; j<matrix.length; j++) {
        for (var k=0; k<matrix[0].length; k++) {
          if (matrix[j][k] === '') {
            return false
          }
        }
      }
    }
    return true
  }

  dimensionsMatch() {
    var matrix1 = this.state.inputMatrices[0]
    var matrix2 = this.state.inputMatrices[1]
    if (matrix1[0].length != matrix2.length) {
      return false
    }
    return true
  }

  canDotProduct() {
    if (!this.matricesAreFull()) {
      this.setState({errorMessage: 'Cells cannot be empty'})
      return false
    }
    if (!this.dimensionsMatch()) {
      this.setState({errorMessage: 'Incompatible dimensions'})
      return false
    }
    this.setState({errorMessage: ''})
    return true
  }

  dotProduct() {
    if (!this.canDotProduct()) {
      return
    }
    var x = this.state.inputMatrices[0]
    var y = this.state.inputMatrices[1]

    var output = []
    for (var i=0; i < x.length; i++) {
      output.push([])
      for (var j=0; j < y[0].length; j++) {
        output[i].push(0)
        for (var k=0; k<x[0].length; k++) {
          output[i][j] += x[i][k] * y[k][j]
        }
      }
    }
    this.setState({
      outputMatrix: output,
      outputIsHidden: false
    })
    return output
  }

  render() {
    if (this.state.outputIsHidden)
      return (
        <div className="Calculator">
          <Matrix defaultRows="2" defaultCols="2" index={0} setMatrix={this.setMatrices.bind(this)}/>
          <button onClick={this.dotProduct.bind(this)}>Dot</button>
          <Matrix defaultRows="2" defaultCols="2" index={1} setMatrix={this.setMatrices.bind(this)}/>
          <Error message={this.state.errorMessage}/>
        </div>
      )
    else {
      return (
        <div className="Calculator">
          <Matrix defaultRows="2" defaultCols="2" index={0} setMatrix={this.setMatrices.bind(this)}/>
          <button onClick={this.dotProduct.bind(this)}>Dot</button>
          <Matrix defaultRows="2" defaultCols="2" index={1} setMatrix={this.setMatrices.bind(this)}/>
          <FrozenMatrix values={this.state.outputMatrix} />
          <Error message={this.state.errorMessage}/>
        </div>
      )
    }
  }
}

class FrozenMatrix extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      values: this.props.values,
      cells: this.makeCells(this.props.values)
    }
  }

  makeCells(values) {
    var rows = []
    for (var i=0; i<values.length; i++) {
      var row = []
      for (var j=0; j<values[0].length; j++) {
        row.push(<Cell 
          rowNum={i} 
          colNum={j} 
          value={values[i][j]} 
          className="cell-input" 
          />
        )
      }
      rows.push(<div>{row}</div>)
    }
    return rows
  }

  render() {
    return <div>{this.makeCells(this.props.values)}</div>
  }
}

// I need a matrix component that just accepts a 2d array and displays it

function App() {
  return (
    <div className="App">
      <Calculator />
    </div>
  );
}

export default App;
