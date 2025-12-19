import './style.css'
import { Quiz } from './quiz.js'
import { getScores } from './storage.js'

const app = document.getElementById('app')

export function showHighScores() {
  const scores = getScores()

  let scoreHTML = '<h2>🏆 High Scores</h2>'
  if (scores.length === 0) scoreHTML += '<p>No high scores yet.</p>'
  else {
    scoreHTML += '<ol>'
    scores.forEach(s => {
      scoreHTML += `<li>🎯 ${s.name} - ${s.time.toFixed(2)}s</li>`
    })
    scoreHTML += '</ol>'
  }

  scoreHTML += `<button id="back">⬅️ Back</button>`
  app.innerHTML = scoreHTML

  const firstButton = app.querySelector('button')
  if (firstButton) firstButton.focus()
  document.getElementById('back').onclick = () => showHome()
}

function showHome() {
  app.innerHTML = `
    <h1>🧠 Quiz Game</h1>
    <input id="nickname" placeholder="📝 Your nickname" />
    <button id="start">▶️ Start</button>
    <button id="highscore">🏆 High Scores</button>
  `

  const nicknameInput = document.getElementById('nickname')
  const startBtn = document.getElementById('start')
  nicknameInput.focus()

  nicknameInput.addEventListener('keyup', e => {
    if (e.key === 'Enter') startBtn.click()
  })

  startBtn.onclick = () => {
    const name = nicknameInput.value.trim()
    if (!name) return alert('Please enter a nickname')
    new Quiz(app).start(name)
  }

  document.getElementById('highscore').onclick = () => showHighScores()
}

showHome()
