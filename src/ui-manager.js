/**
 * UI Manager
 * Handles all UI updates and DOM manipulations
 */
class UIManager {
    constructor() {
        this.screens = {
            start: document.getElementById('start-screen'),
            game: document.getElementById('game-screen'),
            gameOver: document.getElementById('game-over-screen'),
            highscore: document.getElementById('highscore-screen')
        };

        this.elements = {
            nickname: document.getElementById('nickname'),
            startBtn: document.getElementById('start-btn'),
            playerName: document.getElementById('player-name'),
            timer: document.getElementById('timer'),
            questionNumber: document.getElementById('question-number'),
            questionText: document.getElementById('question-text'),
            answerContainer: document.getElementById('answer-container'),
            submitAnswer: document.getElementById('submit-answer'),
            giveUpBtn: document.getElementById('give-up-btn'),
            progressFill: document.querySelector('.progress-fill'),
            resultTitle: document.getElementById('result-title'),
            resultDetails: document.getElementById('result-details'),
            finalStats: document.getElementById('final-stats'),
            highscoreList: document.getElementById('highscore-list'),
            viewHighscoreBtn: document.getElementById('view-highscore-btn'),
            backFromHighscore: document.getElementById('back-from-highscore'),
            clearHighscores: document.getElementById('clear-highscores'),
            playAgainBtn: document.getElementById('play-again-btn'),
            backToStartBtn: document.getElementById('back-to-start-btn')
        };
    }

    /**
     * Switch between screens
     * @param {string} screenName - Name of screen to show
     */
    showScreen(screenName) {
        // Hide all screens
        Object.values(this.screens).forEach(screen => {
            screen.classList.remove('active');
        });

        // Show requested screen
        if (this.screens[screenName]) {
            this.screens[screenName].classList.add('active');
        }
    }

    /**
     * Update timer display
     * @param {number} seconds - Seconds remaining
     */
    updateTimer(seconds) {
        this.elements.timer.textContent = seconds;
        this.elements.timer.style.color = seconds <= 3 ? '#f72585' : 
                                          seconds <= 5 ? '#ff9e00' : 
                                          '#4cc9f0';
    }

    /**
     * Update progress bar
     * @param {number} progress - Progress percentage (0-100)
     */
    updateProgress(progress) {
        this.elements.progressFill.style.width = `${progress}%`;
    }

    /**
     * Display a question
     * @param {Object} question - Question data from API
     * @param {number} questionIndex - Current question number
     */
    displayQuestion(question, questionIndex) {
        this.elements.questionNumber.textContent = questionIndex;
        this.elements.questionText.textContent = question.question;
        
        // Clear previous answers
        this.elements.answerContainer.innerHTML = '';
        this.elements.submitAnswer.disabled = true;

        // Check question type based on available properties
        // The API doesn't have a "type" field, so we check for alternatives
        if (question.alternatives && Object.keys(question.alternatives).length > 0) {
            this.createMultipleChoice(question.alternatives);
        } else {
            this.createTextAnswerInput();
        }

        // Focus on the first input
        setTimeout(() => {
            const firstInput = this.elements.answerContainer.querySelector('input');
            if (firstInput) {
                firstInput.focus();
            }
        }, 100);
    }

    /**
     * Create text answer input
     */
    createTextAnswerInput() {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'text-answer';
        input.placeholder = 'Type your answer here...';
        
        input.addEventListener('input', () => {
            this.elements.submitAnswer.disabled = !input.value.trim();
        });

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && input.value.trim()) {
                this.elements.submitAnswer.click();
            }
        });

        this.elements.answerContainer.appendChild(input);
    }

    /**
     * Create multiple choice options
     * @param {Object} alternatives - Alternative answers
     */
    createMultipleChoice(alternatives) {
        const alternativesArray = Object.entries(alternatives);
        
        alternativesArray.forEach(([key, value]) => {
            const option = document.createElement('div');
            option.className = 'answer-option';
            
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'answer';
            radio.value = key;
            radio.id = key;

            const label = document.createElement('label');
            label.htmlFor = key;
            label.textContent = value;

            option.appendChild(radio);
            option.appendChild(label);

            option.addEventListener('click', () => {
                document.querySelectorAll('.answer-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                radio.checked = true;
                option.classList.add('selected');
                this.elements.submitAnswer.disabled = false;
            });

            // Keyboard navigation
            option.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    option.click();
                }
            });

            option.tabIndex = 0;
            this.elements.answerContainer.appendChild(option);
        });
    }

    /**
     * Get current answer from UI
     * @returns {string|Object} The answer
     */
    getAnswer() {
        const textInput = this.elements.answerContainer.querySelector('.text-answer');
        if (textInput) {
            return textInput.value;
        } else {
            const selectedRadio = this.elements.answerContainer.querySelector('input[type="radio"]:checked');
            return selectedRadio ? { answer: selectedRadio.value } : null;
        }
    }

    /**
     * Show game over screen
     * @param {boolean} isWin - Whether the player won
     * @param {string} nickname - Player nickname
     * @param {number} time - Total time taken
     * @param {number} questionCount - Number of questions answered
     */
    showGameOver(isWin, nickname, time, questionCount) {
        if (isWin) {
            this.elements.resultTitle.textContent = '🎉 Congratulations!';
            this.elements.resultTitle.style.color = '#4cc9f0';
            this.elements.resultDetails.textContent = 
                `You completed all ${questionCount} questions correctly!`;
            
            const timeFormatted = this.formatTime(time);
            this.elements.finalStats.innerHTML = `
                <div style="text-align: left; max-width: 300px; margin: 0 auto;">
                    <p><strong>Player:</strong> ${nickname}</p>
                    <p><strong>Total Time:</strong> ${timeFormatted}</p>
                    <p><strong>Questions:</strong> ${questionCount}</p>
                    <p><strong>Average time per question:</strong> ${(time / questionCount).toFixed(1)}s</p>
                </div>
            `;
        } else {
            this.elements.resultTitle.textContent = '😔 Game Over';
            this.elements.resultTitle.style.color = '#f72585';
            this.elements.resultDetails.textContent = 
                'Time ran out or you answered incorrectly.';
            
            this.elements.finalStats.innerHTML = `
                <div style="text-align: left; max-width: 300px; margin: 0 auto;">
                    <p><strong>Player:</strong> ${nickname}</p>
                    <p><strong>Questions completed:</strong> ${questionCount - 1}</p>
                    <p>Better luck next time!</p>
                </div>
            `;
        }
    }

    /**
     * Display high scores
     * @param {Array} highscores - Array of high score objects
     * @param {HighScoreManager} highscoreManager - For formatting time
     */
    displayHighScores(highscores, highscoreManager) {
        if (highscores.length === 0) {
            this.elements.highscoreList.innerHTML = `
                <div class="no-highscores">
                    <i class="fas fa-trophy" style="font-size: 3rem; color: #6c757d; margin-bottom: 1rem;"></i>
                    <p>No high scores yet. Be the first to complete the quiz!</p>
                </div>
            `;
            return;
        }

        const scoresHTML = highscores.map((score, index) => `
            <div class="highscore-item">
                <div class="highscore-rank">${index + 1}</div>
                <div class="highscore-name">${score.name}</div>
                <div class="highscore-time">${highscoreManager.formatTime(score.time)}</div>
            </div>
        `).join('');

        this.elements.highscoreList.innerHTML = scoresHTML;
    }

    /**
     * Format time for display
     * @param {number} seconds - Time in seconds
     * @returns {string} Formatted time
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * Show loading state
     */
    showLoading() {
        this.elements.questionText.textContent = 'Loading next question...';
        this.elements.answerContainer.innerHTML = '<p>Please wait...</p>';
        this.elements.submitAnswer.disabled = true;
    }

    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            background: #f72585;
            color: white;
            padding: 1rem;
            border-radius: 8px;
            margin: 1rem 0;
            animation: shake 0.5s ease;
        `;
        errorDiv.textContent = message;
        
        this.elements.questionContainer.prepend(errorDiv);
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 3000);
    }
}

export default UIManager;