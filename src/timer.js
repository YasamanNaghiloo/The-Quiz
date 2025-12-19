/**
 * Timer Class
 * Manages the countdown timer for each question
 */
class Timer {
    constructor(duration = 10) {
        this.duration = duration;
        this.timeLeft = duration;
        this.timerId = null;
        this.onTick = null;
        this.onTimeout = null;
        this.isRunning = false;
        this.startTime = null;
    }

    /**
     * Start the timer
     * @param {Function} onTick - Callback for each tick
     * @param {Function} onTimeout - Callback when timer reaches zero
     */
    start(onTick = null, onTimeout = null) {
        if (this.isRunning) {
            this.stop();
        }

        this.onTick = onTick;
        this.onTimeout = onTimeout;
        this.timeLeft = this.duration;
        this.startTime = Date.now();
        this.isRunning = true;

        this.timerId = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            this.timeLeft = Math.max(0, this.duration - elapsed);

            if (this.onTick) {
                this.onTick(this.timeLeft);
            }

            if (this.timeLeft <= 0) {
                this.stop();
                if (this.onTimeout) {
                    this.onTimeout();
                }
            }
        }, 100);
    }

    /**
     * Stop the timer
     */
    stop() {
        if (this.timerId) {
            clearInterval(this.timerId);
            this.timerId = null;
        }
        this.isRunning = false;
    }

    /**
     * Reset the timer
     */
    reset() {
        this.stop();
        this.timeLeft = this.duration;
    }

    /**
     * Get the current time left
     * @returns {number} Time left in seconds
     */
    getTimeLeft() {
        return this.timeLeft;
    }

    /**
     * Check if timer is running
     * @returns {boolean} True if timer is running
     */
    isActive() {
        return this.isRunning;
    }
}

export default Timer;