/**
 * Main Application Entry Point
 * Initializes and coordinates all components
 */

import ApiService from './api-service.js';
import Timer from './timer.js';
import HighScoreManager from './highscore.js';
import UIManager from './ui-manager.js';
import QuizGame from './quiz.js';

/**
 * Initialize the application
 */
class QuizApplication {
    constructor() {
        this.apiService = new ApiService();
        this.timer = new Timer(10); // 10 seconds per question
        this.highscoreManager = new HighScoreManager();
        this.uiManager = new UIManager();
        this.quizGame = new QuizGame(
            this.apiService,
            this.timer,
            this.highscoreManager,
            this.uiManager
        );

        this.initialize();
    }

    /**
     * Initialize the application
     */
    initialize() {
        console.log('Quiz Application initialized');
        
        // Focus on nickname input on start
        this.uiManager.elements.nickname.focus();

        // Display initial high scores if any
        const highscores = this.highscoreManager.getHighScores();
        this.uiManager.displayHighScores(highscores, this.highscoreManager);
    }
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new QuizApplication();
});

// Export for testing if needed
export default QuizApplication;