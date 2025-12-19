/**
 * High Score Manager
 * Handles storage and retrieval of high scores using Web Storage
 */
class HighScoreManager {
    constructor() {
        this.storageKey = 'quiz-highscores';
        this.maxScores = 5;
        this.highscores = this.loadHighScores();
    }

    /**
     * Load high scores from local storage
     * @returns {Array} Array of high scores
     */
    loadHighScores() {
        const scores = localStorage.getItem(this.storageKey);
        return scores ? JSON.parse(scores) : [];
    }

    /**
     * Save high scores to local storage
     */
    saveHighScores() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.highscores));
    }

    /**
     * Add a new high score
     * @param {string} name - Player nickname
     * @param {number} time - Time in seconds
     */
    addHighScore(name, time) {
        const newScore = {
            name: name.trim(),
            time: time,
            date: new Date().toISOString()
        };

        this.highscores.push(newScore);
        // Sort by time (ascending - fastest first)
        this.highscores.sort((a, b) => a.time - b.time);
        // Keep only top scores
        this.highscores = this.highscores.slice(0, this.maxScores);
        
        this.saveHighScores();
    }

    /**
     * Get all high scores
     * @returns {Array} Sorted array of high scores
     */
    getHighScores() {
        return this.highscores;
    }

    /**
     * Clear all high scores
     */
    clearHighScores() {
        this.highscores = [];
        localStorage.removeItem(this.storageKey);
    }

    /**
     * Check if a score qualifies as a high score
     * @param {number} time - Time in seconds
     * @returns {boolean} True if score qualifies
     */
    isHighScore(time) {
        if (this.highscores.length < this.maxScores) {
            return true;
        }
        return time < this.highscores[this.highscores.length - 1].time;
    }

    /**
     * Format time for display
     * @param {number} seconds - Time in seconds
     * @returns {string} Formatted time string
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

export default HighScoreManager;