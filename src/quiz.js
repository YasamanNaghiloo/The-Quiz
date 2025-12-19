/**
 * Quiz Game Class
 * Main game logic controller
 */
class QuizGame {
    constructor(apiService, timer, highscoreManager, uiManager) {
        this.apiService = apiService;
        this.timer = timer;
        this.highscoreManager = highscoreManager;
        this.uiManager = uiManager;
        
        this.nickname = '';
        this.startTime = null;
        this.totalTime = 0;
        this.questionCount = 0;
        this.isGameActive = false;
        
        this.bindEvents();
        
        // Set timer callbacks - THIS WAS MISSING!
        this.timer.onTick = (timeLeft) => {
            this.uiManager.updateTimer(timeLeft);
            this.uiManager.updateProgress((timeLeft / 10) * 100);
        };
        
        this.timer.onTimeout = () => {
            this.endGame(false);
        };
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Start game
        this.uiManager.elements.startBtn.addEventListener('click', () => this.startGame());
        this.uiManager.elements.nickname.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && this.uiManager.elements.nickname.value.trim()) {
                this.startGame();
            }
        });

        // Submit answer
        this.uiManager.elements.submitAnswer.addEventListener('click', () => this.submitAnswer());
        
        // Listen for Enter key in answer input
        this.uiManager.elements.answerContainer.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !this.uiManager.elements.submitAnswer.disabled) {
                this.submitAnswer();
            }
        });

        // Give up
        this.uiManager.elements.giveUpBtn.addEventListener('click', () => this.endGame(false));

        // Navigation
        this.uiManager.elements.viewHighscoreBtn.addEventListener('click', () => this.showHighScores());
        this.uiManager.elements.backFromHighscore.addEventListener('click', () => {
            if (this.isGameActive) {
                this.uiManager.showScreen('game');
            } else {
                this.uiManager.showScreen('start');
            }
        });
        this.uiManager.elements.clearHighscores.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all high scores?')) {
                this.highscoreManager.clearHighScores();
                this.uiManager.displayHighScores([], this.highscoreManager);
            }
        });
        this.uiManager.elements.playAgainBtn.addEventListener('click', () => this.resetGame());
        this.uiManager.elements.backToStartBtn.addEventListener('click', () => {
            this.resetGame();
            this.uiManager.showScreen('start');
        });
    }

    /**
     * Start a new game
     */
    async startGame() {
        const nickname = this.uiManager.elements.nickname.value.trim();
        if (!nickname) {
            alert('Please enter a nickname!');
            this.uiManager.elements.nickname.focus();
            return;
        }

        this.nickname = nickname;
        this.startTime = Date.now();
        this.totalTime = 0;
        this.questionCount = 0;
        this.isGameActive = true;

        // Update UI
        this.uiManager.elements.playerName.textContent = `Player: ${nickname}`;
        this.uiManager.showScreen('game');

        try {
            // Get first question
            const question = await this.apiService.getFirstQuestion();
            this.questionCount = 1;
            this.uiManager.displayQuestion(question, this.questionCount);
            this.timer.start();
        } catch (error) {
            console.error('Error starting game:', error);
            this.uiManager.showError('Failed to load quiz. Please try again.');
            this.uiManager.showScreen('start');
        }
    }

    /**
     * Submit current answer
     */
    async submitAnswer() {
        if (!this.isGameActive) return;

        const answer = this.uiManager.getAnswer();
        if (!answer) {
            this.uiManager.showError('Please provide an answer!');
            return;
        }

        // Stop timer temporarily
        const timeLeft = this.timer.getTimeLeft();
        this.timer.stop();
        this.totalTime += (10 - timeLeft);

        // Show loading
        this.uiManager.showLoading();

        try {
            const result = await this.apiService.sendAnswer(answer);

            if (result.success) {
                // Correct answer - show next question
                this.questionCount++;
                
                if (result.question.nextURL) {
                    // More questions available
                    this.uiManager.displayQuestion(result.question, this.questionCount);
                    this.timer.reset();
                    this.timer.start();
                } else {
                    // Quiz completed!
                    this.totalTime += (10 - timeLeft);
                    this.endGame(true);
                }
            } else {
                // Wrong answer
                this.endGame(false);
            }
        } catch (error) {
            console.error('Error submitting answer:', error);
            this.uiManager.showError('An error occurred. Please try again.');
            this.timer.start();
            this.uiManager.displayQuestion(this.apiService.currentQuestion, this.questionCount);
        }
    }

    /**
     * End the game
     * @param {boolean} isWin - Whether the player won
     */
    endGame(isWin) {
        this.isGameActive = false;
        this.timer.stop();

        if (isWin) {
            // Calculate total time
            const totalSeconds = Math.round(this.totalTime);
            
            // Check and add high score
            if (this.highscoreManager.isHighScore(totalSeconds)) {
                this.highscoreManager.addHighScore(this.nickname, totalSeconds);
            }
        }

        // Show game over screen
        this.uiManager.showGameOver(isWin, this.nickname, Math.round(this.totalTime), this.questionCount);
        this.uiManager.showScreen('gameOver');
    }

    /**
     * Show high scores screen
     */
    showHighScores() {
        const highscores = this.highscoreManager.getHighScores();
        this.uiManager.displayHighScores(highscores, this.highscoreManager);
        this.uiManager.showScreen('highscore');
    }

    /**
     * Reset the game
     */
    resetGame() {
        this.timer.reset();
        this.apiService.reset();
        this.isGameActive = false;
        
        // Reset UI elements
        this.uiManager.elements.nickname.value = '';
        this.uiManager.elements.nickname.focus();
        
        this.startGame();
    }
}

export default QuizGame;