const buttons = document.getElementsByClassName('gameCell');
const playAgainButton = document.getElementById('playAgainButton');
const resultText = document.getElementById('result');
const playerText = document.getElementById('player');

const winningCombinations = [
    // Rows
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    // Columns
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    // Diagonals
    [0, 4, 8],
    [2, 4, 6]
];

let board = ['','','','','','','','',''];
let currentMove = 'X';
let gameOver = false;
let enableAI = false;
let AIplayer = 'O';
let playerScore = 0
let draws = 0
let botScore = 0

console.log(buttons);

function fillCell (cell) {
    if (buttons[cell].innerHTML == '' && !gameOver) {
        board[cell] = currentMove;
        buttons[cell].innerHTML = currentMove;
        currentMove = currentMove === 'X' ? 'O' : 'X';
        playerText.innerHTML = `${currentMove} to move`;
        checkWin();
        if (!gameOver && enableAI && currentMove === AIplayer) {botPick()}
    };
    // checkWin();
    // if (!gameOver && enableAI) {botPick()}
}

function checkWin () {
    const board = Array.from(buttons).map(button => button.innerHTML);
    console.log(board);

    for (const combination of winningCombinations) {
        const [a, b, c] = combination;
        if (board[a] !== "" && board[a] === board[b] && board[a] === board[c]) {
            highlightWinningCells(a, b, c);
            endGame(`Winner: ${board[a]}`);
            if (board[a] === AIplayer) {
                botScore++;
                document.getElementById('botScore').innerHTML = botScore;
            } else {
                playerScore++;
                document.getElementById('playerScore').innerHTML = playerScore;
            }
        };    
    };
    
    if (!board.includes('') && !gameOver) {
        endGame('Draw');
        draws++;
        document.getElementById('draws').innerHTML = draws;
    }
}

function playAgain () {
    for (cell of buttons) {
        cell.innerHTML = '';
        cell.classList.remove('winningCell');
    };
    gameOver = false;
    currentMove = 'X';
    for (let i = 0; i < 9; i++) {
        board[i] = '';
    }
    resultText.innerHTML = '';
    playerText.innerHTML = `${currentMove} to move`;
    playAgainButton.style.display = 'none';
    if (currentMove === AIplayer && enableAI) {botPick()}
}

// THE AI
function botPick () {
    //const board = Array.from(buttons).map(button => button.innerHTML);
    let emptyTiles = [];
    for (const button of buttons) {button.disabled = true}
    for (let i = 0; i < 9; i++) { // 
        if(board[i] === '') {
            emptyTiles.push(i);
        }
    }
    const randomIndex = Math.floor(Math.random() * emptyTiles.length);
    console.log(emptyTiles);
    
    if (!gameOver) {
        setTimeout(() => { 
            // AI itself
            let analysisBoard = [];
            let oneTurn = false;
            copyArray(board, analysisBoard);
            console.log(analysisBoard);
            for (let i = 0; i < emptyTiles.length; i++) { // 1 turn win check
                analysisBoard[emptyTiles[i]] = currentMove;
                if(checkLocalWin(analysisBoard) === 1) {
                    oneTurn = true;
                    fillCell(emptyTiles[i]);
                    break;
                }
                copyArray(board, analysisBoard);
            }
            for (let i = 0; i < emptyTiles.length; i++) { // 1 turn loss check
                analysisBoard[emptyTiles[i]] = currentMove === 'O' ? 'X' : 'O';
                if(checkLocalWin(analysisBoard) === 0) {
                    oneTurn = true;
                    fillCell(emptyTiles[i]);
                    break;
                }
                copyArray(board, analysisBoard);
            }
            if (board[4] === '' && !oneTurn) { // If center is free - better take it
                oneTurn = true;
                fillCell(4);
            } else if (arrayInter(emptyTiles, [0,2,6,8]).map((x) => x === 'X').length === 2 && !oneTurn) {
                oneTurn = true; // Counter against two corners strategy
                console.log("We got here, now what?");
                fillCell(arrayInter(emptyTiles, [1,3,5,7])[Math.floor(Math.random() * arrayInter(emptyTiles, [1,3,5,7]).length)])
            } else if (!board.includes(AIplayer) && !oneTurn) {
                oneTurn = true; // If center is taken and our first turn, take corner
                fillCell([0,2,6,8][Math.floor(Math.random() * 4)])
            } else if((arrayInter(emptyTiles, [0,2,6,8]).length !== 0) && !oneTurn) {
                oneTurn = true; // Corners have bigger priority
                const emptyCorners = arrayInter(emptyTiles, [0,2,6,8]);
                fillCell(emptyCorners[Math.floor(Math.random() * emptyCorners.length)]);
            } else if (!oneTurn) {
                fillCell(emptyTiles[randomIndex]);
            }
            // End AI
            for (const button of buttons) {button.disabled = false};
        }, 700)
    };
    
}

function copyArray(fromBoard, toBoard) {
    for (let i = 0; i < 9; i++) {
        toBoard[i] = fromBoard[i];
    }
}

function arrayInter(array1, array2) {
    return (array1.filter(value => array2.includes(value)))
}

function checkLocalWin (board) {
    //console.log(board);

    for (const combination of winningCombinations) {
        const [a, b, c] = combination;
        if (board[a] === board[b] && board[a] === board[c] && board[a] !== "" && board[a] === AIplayer) {
            return 1;
        } else if (board[a] !== "" && board[a] === board[b] && board[a] === board[c] && board[a] !== AIplayer) {
            return 0;
        };    
    };
    
    if (!board.includes('')) {
        return 0.5;
    }
}

// DISPLAY FUNCTIONS
function toggleAI () {
    enableAI = !enableAI;
    if (currentMove === AIplayer) {botPick()};
    if (enableAI) {
        document.getElementsByClassName('whoAI__div')[0].style.display = 'block';
    } else {
        document.getElementsByClassName('whoAI__div')[0].style.display = 'none';
    }
}

function changeAI () {
    AIplayer = AIplayer === 'X' ? 'O' : 'X';
    if (currentMove === AIplayer) {botPick()};
}

function highlightWinningCells (...cellIds) {
    for (const id of cellIds) {
        buttons[id].classList.add('winningCell');
    }
}
// END DISPLAY FUNCTIONS

function endGame(message) {
    resultText.innerHTML = message;
    playerText.innerHTML = 'Game over';
    playAgainButton.style.display = 'block';
    gameOver = true;
}