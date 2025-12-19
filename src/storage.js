const KEY = 'quiz-scores'

/**
 * Saves a score to localStorage
 * @param {string} name - Player name
 * @param {number} time - Completion time in seconds
 */
export function saveScore (name, time) { // Added space before (
  const scores = getScores()
  scores.push({ name, time })
  scores.sort((a, b) => a.time - b.time)
  localStorage.setItem(KEY, JSON.stringify(scores.slice(0, 5)))
}

/**
 * Gets all scores from localStorage
 * @returns {Array} Array of score objects
 */
export function getScores () { // Added space before (
  return JSON.parse(localStorage.getItem(KEY)) || []
}

/**
 * Clears all scores from localStorage
 */
export function clearScores () { // Added space before (
  localStorage.removeItem(KEY)
}
