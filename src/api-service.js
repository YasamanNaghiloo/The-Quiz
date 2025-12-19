/**
 * API Service for Quiz Application
 * Handles all communication with the quiz server
 */
class ApiService {
    constructor() {
        this.baseUrl = 'https://courselab.lnu.se/quiz';
        this.currentQuestion = null;
    }

    /**
     * Fetch the first question
     * @returns {Promise<Object>} First question data
     */
    async getFirstQuestion() {
        try {
            const response = await fetch(`${this.baseUrl}/question/1`);
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to fetch question: ${response.status} ${errorText}`);
            }
            
            this.currentQuestion = await response.json();
            console.log('First question:', this.currentQuestion); // For debugging
            return this.currentQuestion;
        } catch (error) {
            console.error('Error fetching first question:', error);
            throw new Error('Could not connect to quiz server. Please check your internet connection.');
        }
    }

    /**
     * Send answer to current question
     * @param {string|Object} answer - The answer to send
     * @returns {Promise<Object>} Next question or result
     */
    async sendAnswer(answer) {
        if (!this.currentQuestion) {
            throw new Error('No current question available');
        }

        if (!this.currentQuestion.nextURL) {
            throw new Error('No URL to send answer to');
        }

        try {
            console.log('Sending answer:', answer, 'to:', this.currentQuestion.nextURL);
            
            const response = await fetch(this.currentQuestion.nextURL, {
                method: this.currentQuestion.nextMethod || 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(answer)
            });

            const data = await response.json();
            console.log('Response:', response.status, data);

            if (response.status === 400 || response.status === 422) {
                return {
                    success: false,
                    message: data.message || 'Wrong answer!'
                };
            }

            if (!response.ok) {
                throw new Error(`Server error: ${response.status} ${JSON.stringify(data)}`);
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
    }
}

export default ApiService;