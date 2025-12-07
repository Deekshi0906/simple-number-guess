// API Configuration
const API_BASE_URL = 'http://localhost:5001/api';

// DOM Elements
const guessInput = document.getElementById('guessInput');
const guessBtn = document.getElementById('guessBtn');
const hintBtn = document.getElementById('hintBtn');
const restartBtn = document.getElementById('restartBtn');
const guessCount = document.getElementById('guessCount');
const message = document.getElementById('message');
const guessList = document.getElementById('guessList');
const minRange = document.getElementById('minRange');
const maxRange = document.getElementById('maxRange');

// Game state
let guesses = [];

// Initialize the game
async function initGame() {
    try {
        const response = await fetch(`${API_BASE_URL}/game/status`);
        const data = await response.json();
        
        if (data.success) {
            updateGameDisplay(data);
        }
    } catch (error) {
        showMessage('Error connecting to server', 'error');
    }
}

// Update game display
function updateGameDisplay(gameData) {
    guessCount.textContent = gameData.guesses;
    minRange.textContent = gameData.minRange;
    maxRange.textContent = gameData.maxRange;
    
    if (gameData.gameOver) {
        guessBtn.disabled = true;
        guessInput.disabled = true;
    } else {
        guessBtn.disabled = false;
        guessInput.disabled = false;
    }
}

// Handle guess submission
async function handleGuess() {
    const guessValue = guessInput.value.trim();
    
    if (!guessValue) {
        showMessage('Please enter a number', 'info');
        return;
    }
    
    const guess = parseInt(guessValue);
    
    if (isNaN(guess) || guess < 1 || guess > 100) {
        showMessage('Please enter a number between 1 and 100', 'info');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/game/guess`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ guess })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Add to guess history
            addGuessToHistory(guess, data.hint);
            
            // Show message
            showMessage(data.message, data.hint);
            
            // Update game display
            updateGameDisplay(data);
            
            // Clear input
            guessInput.value = '';
            guessInput.focus();
            
            // If game over, show celebration
            if (data.gameOver) {
                celebrateWin(data.guesses);
            }
        } else {
            showMessage(data.message, 'error');
        }
    } catch (error) {
        showMessage('Error submitting guess', 'error');
    }
}

// Get hint
async function getHint() {
    try {
        const response = await fetch(`${API_BASE_URL}/game/hint`);
        const data = await response.json();
        
        if (data.success) {
            showMessage(data.message, 'info');
        } else {
            showMessage(data.message, 'info');
        }
    } catch (error) {
        showMessage('Error getting hint', 'error');
    }
}

// Restart game
async function restartGame() {
    try {
        const response = await fetch(`${API_BASE_URL}/game/restart`, {
            method: 'POST'
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Reset game state
            guesses = [];
            guessList.innerHTML = '';
            
            // Show message
            showMessage(data.message, 'info');
            
            // Update display
            updateGameDisplay(data);
            
            // Enable input
            guessInput.disabled = false;
            guessBtn.disabled = false;
            
            // Focus input
            guessInput.focus();
        }
    } catch (error) {
        showMessage('Error restarting game', 'error');
    }
}

// Add guess to history
function addGuessToHistory(guess, hint) {
    guesses.push({ guess, hint });
    
    const guessItem = document.createElement('div');
    guessItem.className = `guess-item ${hint}`;
    guessItem.textContent = guess;
    
    guessList.appendChild(guessItem);
    
    // Scroll to bottom
    guessList.scrollTop = guessList.scrollHeight;
}

// Show message
function showMessage(text, type) {
    message.textContent = text;
    message.className = `message ${type}`;
}

// Celebrate win
function celebrateWin(guessCount) {
    const stars = '⭐'.repeat(Math.max(1, Math.floor(6 - guessCount / 20)));
    setTimeout(() => {
        showMessage(`${stars} Amazing! You won in ${guessCount} guesses! ${stars}`, 'correct');
    }, 1000);
}

// Event Listeners
guessBtn.addEventListener('click', handleGuess);
hintBtn.addEventListener('click', getHint);
restartBtn.addEventListener('click', restartGame);

guessInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleGuess();
    }
});

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    initGame();
    guessInput.focus();
});

// Add some fun animations
guessInput.addEventListener('focus', () => {
    guessInput.style.transform = 'scale(1.02)';
});

guessInput.addEventListener('blur', () => {
    guessInput.style.transform = 'scale(1)';
});