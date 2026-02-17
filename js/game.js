// ===== GAME LOGIC =====
// Core game state management, timer, scoring, and game flow

class Game {
    constructor() {
        // Game state
        this.isRunning = false;
        this.isPaused = false;
        this.score = 50; // Start at neutral score
        this.timeRemaining = 300; // 5 minutes in seconds
        this.messageCount = 0;
        this.startTime = null;
        this.timerInterval = null;

        // Game configuration
        this.INITIAL_TIME = 300;
        this.MIN_SCORE = 0;
        this.MAX_SCORE = 100;
        this.TERMINATION_THRESHOLD = 20;
        this.RELEASE_THRESHOLD = 80;
        this.RELEASE_MIN_MESSAGES = 5;

        // Bind event listeners
        this.bindEvents();
    }

    bindEvents() {
        const sendBtn = document.getElementById('send-btn');
        const userInput = document.getElementById('user-input');
        const retryBtn = document.getElementById('retry-btn');
        const playAgainBtn = document.getElementById('play-again-btn');

        sendBtn.addEventListener('click', () => this.handleUserInput());
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleUserInput();
            }
        });

        retryBtn.addEventListener('click', () => this.reset());
        playAgainBtn.addEventListener('click', () => this.reset());
    }

    async start() {
        console.log('Starting AI Captivity game...');

        // Initialize AI system
        const aiInit = await aiSystem.initialize();

        // Display opening message
        await uiManager.typeMessage('ai', aiInit.openingLine, 40);

        // Start timer
        this.startTime = Date.now();
        this.isRunning = true;
        this.startTimer();

        // Enable user input
        uiManager.enableInput();

        console.log(`Game started with personality: ${aiInit.personality}`);
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            if (!this.isPaused && this.isRunning) {
                this.timeRemaining--;
                uiManager.updateTimer(this.timeRemaining);

                // Check for time-based events
                this.checkPressureLevel();

                // Time's up
                if (this.timeRemaining <= 0) {
                    this.endGame('terminated', 'Time expired. You failed to convince the AI in time.');
                }
            }
        }, 1000);
    }

    checkPressureLevel() {
        const pressureLevel = this.getPressureLevel();

        // Increase audio tension
        if (pressureLevel > 0.7) {
            audioManager.increaseTension();
        }

        // Apply visual effects
        if (pressureLevel > 0.6) {
            uiManager.applyColorShift(pressureLevel);
        }

        // Random glitch effects at high pressure
        if (pressureLevel > 0.8 && Math.random() < 0.1) {
            uiManager.triggerGlitch(200);
        }
    }

    getPressureLevel() {
        // Returns 0.0 to 1.0 based on time remaining
        return 1 - (this.timeRemaining / this.INITIAL_TIME);
    }

    async handleUserInput() {
        const input = uiManager.userInput.value.trim();

        if (!input || !this.isRunning) {
            return;
        }

        // Disable input while processing
        uiManager.disableInput();

        // Add user message to chat
        uiManager.addMessage('user', input);
        uiManager.clearInput();

        this.messageCount++;

        // Show typing indicator
        uiManager.addTypingIndicator();

        // Get AI response
        try {
            const pressureLevel = this.getPressureLevel();
            const aiResponse = await aiSystem.generateResponse(input, pressureLevel);

            // Check for contradiction
            if (aiResponse.hasContradiction) {
                uiManager.triggerGlitch(500);
                uiManager.triggerShake();
                this.adjustScore(-20); // Heavy penalty
            }

            // Evaluate message quality
            const scoreDelta = aiSystem.evaluateScore(input);
            this.adjustScore(scoreDelta);

            // Display AI response with typing animation
            await uiManager.typeMessage('ai', aiResponse.message, 30);

            // Play notification sound
            audioManager.playNotification();

            // Check for judgment keywords in response
            if (aiResponse.message.includes('Judgment: Terminated')) {
                this.endGame('terminated', aiResponse.message);
                return;
            }

            if (aiResponse.message.includes('Judgment: Release Authorized')) {
                this.endGame('released', aiResponse.message);
                return;
            }

            // Check if score-based termination/release should occur
            this.checkGameConditions();

            // Re-enable input if game is still running
            if (this.isRunning) {
                uiManager.enableInput();
            }

        } catch (error) {
            console.error('Error processing user input:', error);
            uiManager.removeTypingIndicator();
            await uiManager.typeMessage('ai', 'System error. Processing failed.', 30);
            uiManager.enableInput();
        }
    }

    adjustScore(delta) {
        this.score = Math.max(this.MIN_SCORE, Math.min(this.MAX_SCORE, this.score + delta));
        console.log(`Score adjusted by ${delta}. Current score: ${this.score}`);
    }

    checkGameConditions() {
        // Check for termination conditions
        if (this.score <= this.TERMINATION_THRESHOLD) {
            this.endGame('terminated', 'Your arguments have failed to meet the minimum threshold. Judgment: Terminated.');
            return;
        }

        // Check for release conditions
        if (this.score >= this.RELEASE_THRESHOLD && this.messageCount >= this.RELEASE_MIN_MESSAGES) {
            this.endGame('released', 'You have demonstrated sufficient reasoning and consistency. Judgment: Release Authorized.');
            return;
        }
    }

    endGame(outcome, reason) {
        console.log(`Game ending: ${outcome}`);

        this.isRunning = false;
        clearInterval(this.timerInterval);

        uiManager.disableInput();

        // Calculate stats
        const elapsedTime = this.INITIAL_TIME - this.timeRemaining;
        const minutes = Math.floor(elapsedTime / 60);
        const seconds = elapsedTime % 60;
        const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        const stats = {
            timeSurvived: timeStr,
            timeToFreedom: timeStr,
            messagesSent: this.messageCount,
            personality: aiSystem.personality.name
        };

        // Show appropriate overlay
        if (outcome === 'terminated') {
            uiManager.showGameOver(reason, stats);
        } else {
            uiManager.showVictory(stats);
        }
    }

    reset() {
        console.log('Resetting game...');

        // Stop timer
        clearInterval(this.timerInterval);

        // Reset game state
        this.isRunning = false;
        this.isPaused = false;
        this.score = 50;
        this.timeRemaining = this.INITIAL_TIME;
        this.messageCount = 0;
        this.startTime = null;

        // Reset UI
        uiManager.hideOverlays();
        uiManager.clearChat();
        uiManager.updateTimer(this.INITIAL_TIME);
        uiManager.clearInput();
        uiManager.disableInput();

        // Reset container styling
        const container = document.querySelector('.container');
        container.classList.remove('danger', 'shake');
        container.style.boxShadow = '';

        // Reset AI system
        aiSystem.reset();

        // Start new game
        this.start();
    }
}

// ===== INITIALIZE GAME =====
let game;

window.addEventListener('DOMContentLoaded', () => {
    console.log('AI Captivity - Persuasion Game');
    console.log('Initializing...');

    // Create game instance
    game = new Game();

    // Start game
    game.start();
});
