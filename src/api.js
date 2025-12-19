// Add JSDoc comments and fix spacing
/**
 * Fetches a question from the API
 * @param {string} url - The API endpoint URL
 * @returns {Promise<object>} - Question data
 */
export async function getQuestion (url) { // Added space before (
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch question')
  }
  return response.json()
}

/**
 * Sends an answer to the API
 * @param {string} url - The API endpoint URL
 * @param {string} answer - The user's answer
 * @returns {Promise<object>} - Response data
 */
export async function sendAnswer (url, answer) { // Added space before (
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answer })
  })

  if (!response.ok) {
    throw new Error('Wrong answer')
  }

  return response.json()
}
