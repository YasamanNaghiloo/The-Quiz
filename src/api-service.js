/**
 * API Service for Quiz Application
 * Handles all communication with the quiz server
 */
class ApiService {
    constructor() {
        this.baseUrl = 'https://courselab.lnu.se/quiz';
        this.currentQuestion = null;
        this.session = null;
    }

    /**
     * Fetch the first question
     * @returns {Promise<Object>} First question data
     */
    async getFirstQuestion() {
        try {
            const response = await fetch(`${this.baseUrl}/question/1`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.currentQuestion = await response.json();
            return this.currentQuestion;
        } catch (error) {
            console.error('Error fetching first question:', error);
            throw error;
        }
    }

    /**
     * Send answer to current question
     * @param {string|Object} answer - The answer to send
     * @returns {Promise<Object>} Next question or result
     */
    async sendAnswer(answer) {
        if (!this.currentQuestion) {
            throw new Error('No current question');
        }

        try {
            const response = await fetch(this.currentQuestion.nextURL, {
                method: this.currentQuestion.nextMethod || 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(answer)
            });

            const data = await response.json();

            if (response.status === 400 || response.status === 422) {
                // Wrong answer
                return {
                    success: false,
                    message: data.message || 'Wrong answer!'
                };
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Store the new question
            this.currentQuestion = data;
            return {
                success: true,
                question: data
            };

        } catch (error) {
            console.error('Error sending answer:', error);
            throw error;
        }
    }

    /**
     * Reset the API service
     */
    reset() {
        this.currentQuestion = null;
        this.session = null;
    }
}

export default ApiService;