const board = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('statusText');
const restartBtn = document.getElementById('restartBtn');

const imgAlianza = 'img/alianza.png'; 
const imgHorda = 'img/horda.png';

let currentPlayer = "X";
let gameState = ["", "", "", "", "", "", "", "", ""];
let gameActive = true;

const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Horizontales
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Verticales
    [0, 4, 8], [2, 4, 6]             // Diagonales
];

function handleCellClick(e) {
    const clickedCell = e.target;
    const clickedIndex = parseInt(clickedCell.getAttribute('data-index'));

    if (gameState[clickedIndex] !== "" || !gameActive) return;

    updateCell(clickedCell, clickedIndex);
    checkResult();
}

function updateCell(cell, index) {
    gameState[index] = currentPlayer;
    const img = document.createElement('img');
    img.src = currentPlayer === "X" ? imgAlianza : imgHorda;
    cell.appendChild(img);
}

function checkResult() {
    let roundWon = false;

    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
            roundWon = true;
            break;
        }
    }

    if (roundWon) {
        statusText.innerText = `¡Victoria para la ${currentPlayer === "X" ? 'Alianza' : 'Horda'}!`;
        gameActive = false;
        return;
    }

    if (!gameState.includes("")) {
        statusText.innerText = "¡Empate en Azeroth!";
        gameActive = false;
        return;
    }

    // Cambio de turno
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusText.innerText = currentPlayer === "X" ? "Turno: Alianza (X)" : "Turno: Horda (O)";
}

function restartGame() {
    currentPlayer = "X";
    gameState = ["", "", "", "", "", "", "", "", ""];
    gameActive = true;
    statusText.innerText = "¡Por la Alianza! (Turno de X)";
    cells.forEach(cell => cell.innerHTML = "");
}

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
restartBtn.addEventListener('click', restartGame);