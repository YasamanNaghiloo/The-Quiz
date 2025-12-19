const KEY = 'quiz-scores'

export function saveScore(name, time) {
  const scores = getScores()
  scores.push({ name, time })
  scores.sort((a, b) => a.time - b.time)
  localStorage.setItem(KEY, JSON.stringify(scores.slice(0, 5)))
}

export function getScores() {
  return JSON.parse(localStorage.getItem(KEY)) || []
}
