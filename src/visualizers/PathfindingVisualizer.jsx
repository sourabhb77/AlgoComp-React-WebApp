import React, { useEffect, useState, useRef } from 'react';
import dijkstra, { getNodesInShortestPathOrderDijkstra } from '../algorithms/dijkstra';
import BFS, { getNodesInShortestPathOrderBFS } from '../algorithms/BFS';
import DFS, { getNodesInShortestPathOrderDFS } from '../algorithms/DFS';
import AStar, { getNodesInShortestPathOrderAStar } from '../algorithms/Astar';
import { Nav, Navbar, Button, NavDropdown, Toast } from 'react-bootstrap';
import Node from '../models/Node/Node';
import './PathfindingVisualizer.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import basicRandom from '../mazeAlgorithms/basicRandom.js';
import basicWeighted from '../mazeAlgorithms/basicWeighted.js';
import Simplestair from '../mazeAlgorithms/Simplestair.js';
import recursive from '../mazeAlgorithms/recursive.js';
import Snake from '../mazeAlgorithms/Snakemaze';
import Cards from '../components/Card';

var START_NODE_ROW = 10;
var START_NODE_COL = 10;
var FINISH_NODE_ROW = 8;
var FINISH_NODE_COL = 39;

const NODE_WEIGHT = 10;

const PathfindingVisualizer = () => {
  const [grid, setGrid] = useState([]);
  const [mouseIsPressed, setMouseIsPressed] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [noOfCellVisited, setNoOfCellVisited] = useState(0);
  const [totalcost, settotalcost] = useState(0);
  const [algorithm, setAlgorithm] = useState("Choose Algorithm");
  const [mazeAlgorithm, setmazeAlgorithm] = useState("Choose Maze Algorithm");
  const [show, setShow] = useState(false);
  const [showComp, setShowComp] = useState(false);
  const [isAddWeight, setIsAddWeight] = useState(false);
  const [isStartNode, setIsStartNode] = useState(false);
  const [isEndNode, setIsEndNode] = useState(false);
  const [compValues, setCompValues] = useState([]);
  const [algoRunTime, setAlgoRunTime] = useState(0);
  const countRef = useRef(null)


  const handleStart = () => {
    setIsActive(true);
    setIsPaused(true);
    countRef.current = setInterval(() => {
      setTimer((timer) => timer + 1);
    }, 1000);
  }

  const handlePause = () => {
    clearInterval(countRef.current);
    setIsPaused(false);
  }

  const handleReset = () => {
    clearInterval(countRef.current);
    setIsActive(false);
    setIsPaused(false);
    setTimer(0);
  }

  const formatTime = () => {
    const getSeconds = `0${(timer % 60)}`.slice(-2)
    const minutes = `${Math.floor(timer / 60)}`
    const getMinutes = `0${minutes % 60}`.slice(-2)
    const getHours = `0${Math.floor(timer / 3600)}`.slice(-2)

    return `${getHours} : ${getMinutes} : ${getSeconds}`
  }

  useEffect(() => {
    console.log('component mounted');
    const grid = getInitialGrid();
    setGrid(grid);
  }, [])
  const movestart = (grid, row, col, isStartNode, isEndNode) => {
    const newGrid = grid.slice();
    if (isStartNode) {
      newGrid[START_NODE_ROW][START_NODE_COL].isStart = false;
    } else if (isEndNode) {
      newGrid[FINISH_NODE_ROW][FINISH_NODE_COL].isFinish = false;
    }

    const node = newGrid[row][col];
    const newNode = {
      ...node,
      isStart: isStartNode,
      isFinish: isEndNode,
      isWall: false,
      weight: 0,
    };
    newGrid[row][col] = newNode;
    if (isStartNode) {
      START_NODE_ROW = newNode.row;
      START_NODE_COL = newNode.col;
    } else if (isEndNode) {
      FINISH_NODE_ROW = newNode.row;
      FINISH_NODE_COL = newNode.col;
    }

    return newGrid;
  }
  const handleMouseDown = (row, col) => {
    // if((row == START_NODE_ROW && col == START_NODE_COL) || (row == FINISH_NODE_ROW && col == FINISH_NODE_COL)){
    //   return;
    // }
    const newGrid = getNewGridWithWallToggled(grid, row, col, isAddWeight, isStartNode, isEndNode);
    setGrid(newGrid);
    setMouseIsPressed(true);
  }

  const handleMouseEnter = (row, col) => {
    if (!mouseIsPressed) return;
    var newGrid;
    if (isStartNode || isEndNode) {
      newGrid = movestart(grid, row, col, isStartNode, isEndNode);
      setGrid(newGrid);
    } else if (!((row == START_NODE_ROW && col == START_NODE_COL) || (row == FINISH_NODE_ROW && col == FINISH_NODE_COL))) {
      newGrid = getNewGridWithWallToggled(grid, row, col, isAddWeight, isStartNode, isEndNode);
      setGrid(newGrid);
    }
  }

  const handleMouseUp = (row, col) => {
    setMouseIsPressed(false);
  }

  const animateAlgorithm = (visitedNodesInOrder, nodesInShortestPathOrder) => {
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        setTimeout(() => {
          animateShortestPath(nodesInShortestPathOrder);
        }, 10 * i);
        return;
      }
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        document.getElementById(`node-${node.row}-${node.col}`).className =
          'node node-visited';
        document.getElementById(`node-${START_NODE_ROW}-${START_NODE_COL}`).className = 'node node-start';
        document.getElementById(`node-${FINISH_NODE_ROW}-${FINISH_NODE_COL}`).className = 'node node-finish';
      }, 10 * i);
    }
  }

  const animateShortestPath = (nodesInShortestPathOrder) => {
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      setTimeout(() => {
        const node = nodesInShortestPathOrder[i];
        if (node.weight === NODE_WEIGHT) {
          document.getElementById(`node-${node.row}-${node.col}`).className = 'node node-weight-in-path';
        }
        else {
          document.getElementById(`node-${node.row}-${node.col}`).className = 'node node-shortest-path';
        }
        document.getElementById(`node-${START_NODE_ROW}-${START_NODE_COL}`).className = 'node node-start';
        document.getElementById(`node-${FINISH_NODE_ROW}-${FINISH_NODE_COL}`).className = 'node node-finish';
      }, 50 * i);
    }
    handlePause();
  }

  const visualizeAlgorithm = () => {
    handleStart();
    var start = new Date().getTime();
    // console.log("Start: ", start)
    const startNode = grid[START_NODE_ROW][START_NODE_COL];
    const finishNode = grid[FINISH_NODE_ROW][FINISH_NODE_COL];
    let visitedNodesInOrder, nodesInShortestPathOrder;
    if (algorithm == "Dijkstra") {
      visitedNodesInOrder = dijkstra(grid, startNode, finishNode);
      nodesInShortestPathOrder = getNodesInShortestPathOrderDijkstra(finishNode, startNode);
      var start2 = new Date().getTime();
      setAlgoRunTime(start2 - start);
      setShowComp(true);
    }
    else if (algorithm == "BFS") {
      visitedNodesInOrder = BFS(grid, startNode, finishNode);
      nodesInShortestPathOrder = getNodesInShortestPathOrderBFS(finishNode, startNode);
      var start2 = new Date().getTime();
      setAlgoRunTime(start2 - start);
      setShowComp(true);
    }
    else if (algorithm == "DFS") {
      visitedNodesInOrder = DFS(grid, startNode, finishNode);
      nodesInShortestPathOrder = getNodesInShortestPathOrderDFS(finishNode, startNode);
      var start2 = new Date().getTime();
      setAlgoRunTime(start2 - start);
      setShowComp(true);
    } else if (algorithm == "AStar") {
      // var start = new Date().getTime();
      // console.log("Start: ", start)
      visitedNodesInOrder = AStar(grid, startNode, finishNode);
      nodesInShortestPathOrder = getNodesInShortestPathOrderAStar(finishNode, startNode);
      var start2 = new Date().getTime();
      setAlgoRunTime(start2 - start);
      setShowComp(true);
    }
    else {
      setShow(true);
      handlePause();
      return;
    }

    settotalcost(finishNode.distance);
    animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder);
    setNoOfCellVisited(nodesInShortestPathOrder.length);
  }

  const clearBoard = () => {
    handleReset();
    setGrid(getInitialGrid());
    setNoOfCellVisited(0);
    settotalcost(0);
    clearGrid();
    // setAlgorithm("Choose Algorithm");
    // setmazeAlgorithm("Choose Maze Algorithm");
    document.getElementById(`node-${START_NODE_ROW}-${START_NODE_COL}`).className = 'node node-start';
    document.getElementById(`node-${FINISH_NODE_ROW}-${FINISH_NODE_COL}`).className = 'node node-finish';
  }

  const clearVisualization = (grid) => {
    handleReset();
    setGrid(getPartialGrid());
    setNoOfCellVisited(0);
    settotalcost(0);
    clearGrid();
    document.getElementById(`node-${START_NODE_ROW}-${START_NODE_COL}`).className = 'node node-start';
    document.getElementById(`node-${FINISH_NODE_ROW}-${FINISH_NODE_COL}`).className = 'node node-finish';
  }

  const getPartialGrid = () => {
    for (let row = 0; row < 20; row++) {
      for (let col = 0; col < 50; col++) {
        grid[row][col].previousNode = null;
      }
    }
    return grid;
  }
  const demoMazeAlgorithm = () => {
    if (mazeAlgorithm === "Choose Maze Algorithm") return;
    clearBoard();
    clearGrid();
    console.log(mazeAlgorithm);
    const startNode = grid[START_NODE_ROW][START_NODE_COL];
    const finishNode = grid[FINISH_NODE_ROW][FINISH_NODE_COL];
    if (mazeAlgorithm == "Basic Random Maze") {
      var griddef = basicRandom(grid, startNode, finishNode);
      for (var i = 0; i < griddef.length; i++) {
        document.getElementById(`node-${griddef[i].row}-${griddef[i].col}`).className =
          'node node-wall';
        const newGrid = getNewGridWithWallToggled(grid, griddef[i].row, griddef[i].col, isAddWeight);
        setGrid(newGrid);
      }
    }
    else if (mazeAlgorithm == "Basic Weight Maze") {
      var griddef = basicWeighted(grid, startNode, finishNode);
      for (var i = 0; i < griddef.length; i++) {
        document.getElementById(`node-${griddef[i].row}-${griddef[i].col}`).className =
          'node node-weight';
        const newGrid = getNewGridWithWallToggled(grid, griddef[i].row, griddef[i].col);
        setGrid(newGrid);
      }
    }
    else if (mazeAlgorithm == "Snake Maze") {
      // recursive(grid,0,grid.length-1,0,grid.length-1,startNode,finishNode);
      Snake(grid, startNode, finishNode);
      var griddef = Snake(grid, startNode, finishNode);
      for (var i = 0; i < griddef.length; i++) {
        document.getElementById(`node-${griddef[i].row}-${griddef[i].col}`).className =
          'node node-weight';
        const newGrid = getNewGridWithWallToggled(grid, griddef[i].row, griddef[i].col);
        setGrid(newGrid);
      }
    }
    else if (mazeAlgorithm == "Simple Stair Pattern") {
      var griddef = Simplestair(grid, startNode, finishNode);
      for (var i = 0; i < griddef.length; i++) {
        document.getElementById(`node-${griddef[i].row}-${griddef[i].col}`).className =
          'node node-weight';
        const newGrid = getNewGridWithWallToggled(grid, griddef[i].row, griddef[i].col);
        setGrid(newGrid);
      }
    }
    else if (mazeAlgorithm == "Recursive Division") {
      // recursive(grid,0,grid.length-1,0,grid.length-1,startNode,finishNode);
      // Snake(grid,startNode,finishNode);
      // var griddef= Snake(grid,startNode,finishNode);
      // for(var i=0;i<griddef.length;i++)
      // {
      //   document.getElementById(`node-${griddef[i].row}-${griddef[i].col}`).className =
      //   'node node-weight';
      //   const newGrid = getNewGridWithWallToggled(grid, griddef[i].row, griddef[i].col);
      //   setGrid(newGrid);
      // }
    }
  }

  const compareVisualization = () => {
    var maze1 = "";
    if (mazeAlgorithm == "Choose Maze Algorithm") {
      maze1 = "No algorithm selected";
    }
    else {
      maze1 = mazeAlgorithm;
    }
    const listOfValues = [grid, algorithm, totalcost, noOfCellVisited, algoRunTime, maze1];
    setCompValues([...compValues, listOfValues]);
    console.log(compValues);

  }

  const clearGrid = () => {
    const newGrid = grid;
    for (const row of newGrid) {
      for (const node of row) {
        let nodeClassName = document.getElementById(`node-${node.row}-${node.col}`,).className;
        if (nodeClassName !== 'node node-start' &&
          nodeClassName !== 'node node-finish' &&
          nodeClassName !== 'node node-wall') {
          document.getElementById(`node-${node.row}-${node.col}`).className =
            'node';
        }
      }
    }
  }

  const addWeights = () => {
    setIsAddWeight(!isAddWeight);
  }

  const setStartNode = () => {
    if (!isEndNode) {
      setIsStartNode(!isStartNode);
    } else {
      setShow(true);
    }
  }
  const setEndNode = () => {
    if (!isStartNode) {
      setIsEndNode(!isEndNode);
    } else {
      setShow(true);
    }
  }
  useEffect(() => {
    demoMazeAlgorithm();
  }, [mazeAlgorithm]);

  return (
    <>
      <Navbar bg="light" variant="light">
        <div className="container">
          <Navbar.Brand href="#home">Path Visualization</Navbar.Brand>
          <Nav className="mr-auto">
            <NavDropdown title={algorithm} id="basic-nav-dropdown">
              <NavDropdown.Item href="" onClick={() => setAlgorithm("Dijkstra")}>Dijkstra</NavDropdown.Item>
              <NavDropdown.Item href="" onClick={() => setAlgorithm("BFS")}>BFS</NavDropdown.Item>
              <NavDropdown.Item href="" onClick={() => setAlgorithm("DFS")}>DFS</NavDropdown.Item>
              <NavDropdown.Item href="" onClick={() => setAlgorithm("AStar")}>AStar</NavDropdown.Item>
            </NavDropdown>
            <NavDropdown title={mazeAlgorithm} id="basic-nav-dropdown">
              <NavDropdown.Item href="" onClick={() => {
                setmazeAlgorithm("Basic Random Maze");
              }}>Basic Random Maze</NavDropdown.Item>
              <NavDropdown.Item href="" onClick={() => {
                setmazeAlgorithm("Basic Weight Maze");
              }}>Basic Weight Maze</NavDropdown.Item>
              <NavDropdown.Item href="" onClick={() => {
                setmazeAlgorithm("Simple Stair Pattern");
              }}>Simple Stair Pattern</NavDropdown.Item>
              <NavDropdown.Item href="" onClick={() => {
                setmazeAlgorithm("Snake Maze");
              }}>Snake Maze</NavDropdown.Item>
              <NavDropdown.Item href="" onClick={() => {
                setmazeAlgorithm("Recursive Division");
              }}>Recursive Division</NavDropdown.Item>
            </NavDropdown>
          </Nav>
          <div>

            <Toast onClose={() => setShow(false)} show={show} delay={3000} autohide
              style={{
                position: 'absolute',
                top: 0,
                right: "50%",
              }}>
              <Toast.Header>
                {isStartNode ? <strong className="mr-auto">First Set StartNode</strong> : (isEndNode ? <strong className="mr-auto">First set Endnode</strong> : <strong className="mr-auto">First Choose Algorithm</strong>)}
              </Toast.Header>
            </Toast>
            <Toast onClose={() => clearVisualization()} show={totalcost == Infinity} delay={3000}
              style={{
                position: 'absolute',
                top: 0,
                right: "50%",
              }}>
              <Toast.Header>
                <strong className="mr-auto">No Path Found</strong>
              </Toast.Header>
            </Toast>
          </div>
          <div className="m">
            <span className="pBtn">
              <Button variant="success" size="sm" onClick={() => setStartNode()}>
                {isStartNode ? "Setting StartNode" : "Set StartNode"}
              </Button>
            </span>
            <span className="pBtn">
              <Button variant="success" size="sm" onClick={() => setEndNode()}>
                {isEndNode ? "Setting EndNode" : "Set EndNode"}
              </Button>
            </span>
            <span className="pBtn">
              <Button variant="success" size="sm" onClick={() => addWeights()}>
                {isAddWeight ? "Adding Weights" : "Add Weights"}
              </Button>
            </span>
            <span className="pBtn">
              <Button variant="secondary" size="sm" onClick={() => clearBoard()}>Clear Board</Button>
            </span>
            <span className="pBtn">
              <Button variant="secondary" size="sm" onClick={(grid) => clearVisualization(grid)}>Clear Visualization</Button>
            </span>
            <span className="pBtn">
              {showComp ?
                <Button variant="outline-primary" onClick={() => compareVisualization()}>Compare</Button>
                : <span></span>
              }
            </span>
            <Button variant="primary" onClick={() => visualizeAlgorithm()}>Start</Button>
          </div>
        </div>
      </Navbar>
      <span className="pText">Timer</span>
      <span className="timeBox">{formatTime()}</span>
      <span className="pText">No. of Cells Visited</span>
      <span className="timeBox">{noOfCellVisited}</span>
      <span className="pText">Total Cost</span>
      <span className="timeBox">{totalcost}</span>

      <div className="Flexbox1">

        {/* <ul>{compValues.length != 0 ? (compValues.map((todo, index) =>  <li key={index}>    {todo[1]} {todo[2]} {todo[3]} </li>)) : console.log('else')}</ul> */}
        {/* <ul>{compValues.length != 0 ? (compValues.map((todo, index) =>  <li>    {todo[1]} {todo[2]} {todo[3]} </li>)) : console.log('else')}</ul> */}

        {compValues.length != 0 ? (compValues.map((todo, index) => <Cards key={index} grid1={todo[0]} algo={todo[1]} tc={todo[2]} cells={todo[3]} time1={todo[4]} maze1={todo[5]}>  </Cards>)) : console.log('else')}
      </div>



      <div className="grid">
        {grid.map((row, rowIdx) => {
          return (
            <div key={rowIdx}>
              {row.map((node, nodeIdx) => {
                const { row, col, isFinish, isStart, isWall, weight } = node;
                return (
                  <Node
                    key={nodeIdx}
                    col={col}
                    isFinish={isFinish}
                    isStart={isStart}
                    isWall={isWall}
                    mouseIsPressed={mouseIsPressed}
                    weight={weight}
                    onMouseDown={(row, col) => handleMouseDown(row, col)}
                    onMouseEnter={(row, col) =>
                      handleMouseEnter(row, col)
                    }
                    onMouseUp={() => handleMouseUp()}
                    row={row}></Node>
                );
              })}
            </div>
          );
        })}
      </div>
    </>
  );
}



const getInitialGrid = () => {
  const grid = [];
  for (let row = 0; row < 20; row++) {
    const currentRow = [];
    for (let col = 0; col < 50; col++) {
      currentRow.push(createNode(col, row));
    }
    grid.push(currentRow);
  }
  return grid;
};

const createNode = (col, row) => {
  return {
    col,
    row,
    isStart: row === START_NODE_ROW && col === START_NODE_COL,
    isFinish: row === FINISH_NODE_ROW && col === FINISH_NODE_COL,
    distance: Infinity,
    isVisited: false,
    isWall: false,
    previousNode: null,
    weight: 0,
  };
};

const getNewGridWithWallToggled = (grid, row, col, isAddWeight, isStartNode, isEndNode) => {
  const newGrid = grid.slice();
  const node = newGrid[row][col];
  const newNode = {
    ...node,
    isWall: (isAddWeight || isStartNode || isEndNode) ? false : !node.isWall,
    weight: node.weight == 0 && isAddWeight ? NODE_WEIGHT : 0,
  };
  newGrid[row][col] = newNode;
  return newGrid;
};
export default PathfindingVisualizer;
