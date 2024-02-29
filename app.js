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

// Filling the cell in both display HTML and board array
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

// THE AI PLAYER
function botPick () {
    let emptyTiles = [];
    for (const button of buttons) {button.disabled = true} // Disable all buttons
    for (let i = 0; i < 9; i++) { // Create empty tiles array
        if(board[i] === '') {
            emptyTiles.push(i);
        }
    }
    const randomIndex = Math.floor(Math.random() * emptyTiles.length);
    //console.log(emptyTiles);
    
    if (!gameOver) {
        setTimeout(() => { 
            // AI logic
            let analysisBoard = [];
            let oneTurn = false; 
            copyArray(board, analysisBoard);
            console.log(analysisBoard);
            for (let i = 0; i < emptyTiles.length; i++) { // 1 turn win check
                analysisBoard[emptyTiles[i]] = currentMove; // Try every position possible after own move
                if(checkLocalWin(analysisBoard) === 1) { // If it is winning,
                    oneTurn = true;
                    fillCell(emptyTiles[i]); // Play it and get out of the cycle
                    break;
                }
                copyArray(board, analysisBoard); // If it wasn't a win, return the analysis board to current state
            }
            for (let i = 0; i < emptyTiles.length; i++) { // 1 turn loss check
                analysisBoard[emptyTiles[i]] = currentMove === 'O' ? 'X' : 'O'; // Try every cell with opposite element
                if(checkLocalWin(analysisBoard) === 0) { // If it is losing,
                    oneTurn = true;
                    fillCell(emptyTiles[i]); // Stop the opponent by filling that cell yourself
                    break;
                }
                copyArray(board, analysisBoard); // And if it wasn't, return the analysis board to current state
            }
            if (board[4] === '' && !oneTurn) { // If center is free - better take it
                oneTurn = true;
                fillCell(4);
            } else if (((board[2] === board[6] && board[6] === 'X') || (board[0] === board[8] && board[8] === 'X')) && emptyTiles.length === 6 && !oneTurn) {
                oneTurn = true; // Counter against opposite corners strategy (pick the edge instead of corner)
                fillCell(arrayInter(emptyTiles, [1,3,5,7])[Math.floor(Math.random() * arrayInter(emptyTiles, [1,3,5,7]).length)])
            } else if((arrayInter(emptyTiles, [0,2,6,8]).length !== 0) && !oneTurn) {
                oneTurn = true; // Corners have bigger priority
                const emptyCorners = arrayInter(emptyTiles, [0,2,6,8]);
                fillCell(emptyCorners[Math.floor(Math.random() * emptyCorners.length)]);
            } else if (!oneTurn) {
                fillCell(emptyTiles[randomIndex]); // Fill random cell if nothing above happened
            }
            // End of AI logic
            for (const button of buttons) {button.disabled = false}; // Enable all buttons back
        }, 700)
    };
    
}

function checkLocalWin (board) { // Check the win but only return the result for AIplayer
    for (const combination of winningCombinations) {
        const [a, b, c] = combination;
        if (board[a] === board[b] && board[a] === board[c] && board[a] !== "" && board[a] === AIplayer) {
            return 1;
        } else if (board[a] !== "" && board[a] === board[b] && board[a] === board[c] && board[a] !== AIplayer) {
            return 0;
        };    
    };
}

// Check win on current global board
function checkWin () {
    console.log(board);

    for (const combination of winningCombinations) { // Checking every combination
        const [a, b, c] = combination;
        if (board[a] !== "" && board[a] === board[b] && board[a] === board[c]) {
            highlightWinningCells(a, b, c);
            endGame(`Winner: ${board[a]}`, board[a]); // If we got one of combinations, end the game
        };    
    };
    
    if (!board.includes('') && !gameOver) { // If the board is full then it's a draw
        endGame('Draw', undefined);
        draws++;
        document.getElementById('draws').innerHTML = draws;
    }
}

function endGame(message, winner) {
    if (winner === AIplayer) { // 
        botScore++;
        document.getElementById('botScore').innerHTML = botScore;
    } else if (winner === ((AIplayer === 'X') ? 'O' : 'X')) {
        playerScore++;
        document.getElementById('playerScore').innerHTML = playerScore;
    }
    resultText.innerHTML = message;
    playerText.innerHTML = 'Game over';
    playAgainButton.style.display = 'block';
    gameOver = true;
}

// Start the game over
function playAgain () {
    for (cell of buttons) {
        cell.innerHTML = ''; // Clean the board
        cell.classList.remove('winningCell');
    };
    gameOver = false;
    currentMove = 'X';
    board = ['','','','','','','','','']
    resultText.innerHTML = '';
    playerText.innerHTML = `${currentMove} to move`;
    playAgainButton.style.display = 'none'; // Hide the "Play again" button
    if (currentMove === AIplayer && enableAI) {botPick()}
}

// ARRAY FUNCTIONS
function copyArray(fromArray, toArray) { // Copies array of nine elements
    for (let i = 0; i < 9; i++) {
        toArray[i] = fromArray[i];
    };
}

function arrayInter(array1, array2) { // Returns array of common elements
    return (array1.filter(value => array2.includes(value)))
}

function toggleAI () {
    enableAI = !enableAI;
    if (currentMove === AIplayer && !gameOver) {botPick()};
    if (enableAI) {
        document.getElementsByClassName('whoAI__div')[0].style.display = 'block';
    } else {
        document.getElementsByClassName('whoAI__div')[0].style.display = 'none';
    }
}

function changeAI () {
    AIplayer = AIplayer === 'X' ? 'O' : 'X';
    if (currentMove === AIplayer && !gameOver) {botPick()};
}

function highlightWinningCells (...cellIds) {
    for (const id of cellIds) {
        buttons[id].classList.add('winningCell');
    }
}