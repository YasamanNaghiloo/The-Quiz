import './style.css'
import { Quiz } from './quiz.js'
import { getScores } from './storage.js'

const app = document.getElementById('app')

export function showHighScores() {
  const scores = getScores()

  let scoreHTML = '<h2 tabindex="0">🏆 High Scores</h2>'
  if (scores.length === 0) scoreHTML += '<p tabindex="0">No high scores yet.</p>'
  else {
    scoreHTML += '<ol>'
    scores.forEach(s => {
      scoreHTML += `<li>🎯 ${s.name} - ${s.time.toFixed(2)}s</li>`
    })
    scoreHTML += '</ol>'
  }

  scoreHTML += `<button id="back" tabindex="0">⬅️ Back</button>`
  app.innerHTML = scoreHTML

  const backButton = document.getElementById('back')
  if (backButton) {
    backButton.focus()
    
    // Handle Enter key on back button
    backButton.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        backButton.click()
      }
    })
    
    backButton.onclick = () => showHome()
  }
}

// Helper function for circular arrow key navigation
function setupArrowNavigation(elements) {
  elements.forEach((element, index) => {
    element.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        const nextIndex = (index + 1) % elements.length
        elements[nextIndex].focus()
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        const prevIndex = (index - 1 + elements.length) % elements.length
        elements[prevIndex].focus()
      }
    })
  })
}

function showHome() {
  app.innerHTML = `
    <h1 tabindex="0">🧠 Quiz Game</h1>
    <input 
      id="nickname" 
      placeholder="📝 Your nickname" 
      tabindex="0" 
      autocomplete="off"
    />
    <div class="button-group">
      <button id="start" tabindex="0">▶️ Start</button>
      <button id="highscore" tabindex="0">🏆 High Scores</button>
    </div>
  `

  const nicknameInput = document.getElementById('nickname')
  const startBtn = document.getElementById('start')
  const highscoreBtn = document.getElementById('highscore')
  
  // Focus nickname input immediately
  requestAnimationFrame(() => {
    nicknameInput.focus()
  })

  // Handle Enter key in nickname input
  nicknameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (nicknameInput.value.trim()) {
        startBtn.click()
      }
    }
  })

  // Set up circular arrow key navigation between all elements
  const focusableElements = [nicknameInput, startBtn, highscoreBtn]
  setupArrowNavigation(focusableElements)

  // Also handle Enter key for buttons
  startBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      startBtn.click()
    }
  })

  highscoreBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      highscoreBtn.click()
    }
  })

  startBtn.onclick = () => {
    const name = nicknameInput.value.trim()
    if (!name) {
      alert('Please enter a nickname')
      nicknameInput.focus()
      return
    }
    new Quiz(app).start(name)
  }

  highscoreBtn.onclick = () => showHighScores()
}

showHome()