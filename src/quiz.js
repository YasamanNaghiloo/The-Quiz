import { getQuestion, sendAnswer } from './api.js'
import { Timer } from './timer.js'
import { saveScore } from './storage.js'

export class Quiz {
  constructor (root) {
    this.root = root
    this.startTime = null
    this.timer = null
    this.currentFocusIndex = 0
  }

  start (nickname) {
    this.nickname = nickname
    this.startTime = Date.now()
    this.loadQuestion('https://courselab.lnu.se/quiz/question/1')
  }

  async loadQuestion (url) {
    try {
      const data = await getQuestion(url)
      this.renderQuestion(data)
    } catch {
      this.gameOver('Could not load question')
    }
  }

  renderQuestion (data) {
    this.currentFocusIndex = 0

    this.root.innerHTML = `
      <h2 tabindex="0">${data.question}</h2>
      <form id="answer-form" aria-label="Question form"></form>
      <p>⏱️ Time left: <span id="timer">10</span>s</p>
    `

    const form = document.getElementById('answer-form')

    if (data.alternatives) {
      // ===== RADIO QUESTION =====
      let radioHTML = ''

      Object.entries(data.alternatives).forEach(([key, value], index) => {
        radioHTML += `
          <div class="radio-option">
            <input
              type="radio"
              id="option-${index}"
              name="answer"
              value="${key}"
              ${index === 0 ? 'checked' : ''}
              tabindex="${index === 0 ? '0' : '-1'}"
            >
            <label for="option-${index}">${value}</label>
          </div>
        `
      })

      form.innerHTML = `
        ${radioHTML}
        <button type="submit" class="submit-btn" tabindex="0">➡️ Answer</button>
      `

      const radioInputs = form.querySelectorAll('input[type="radio"]')
      const submitButton = form.querySelector('.submit-btn')

      // Focus first radio button
      requestAnimationFrame(() => radioInputs[0].focus())

      radioInputs.forEach((input, index) => {
        input.addEventListener('keydown', (e) => {
          switch (e.key) {
            case 'ArrowDown': {
              e.preventDefault()
              const nextIndex = (index + 1) % radioInputs.length
              radioInputs[nextIndex].focus()
              radioInputs[nextIndex].checked = true
              this.currentFocusIndex = nextIndex
              break
            }

            case 'ArrowUp': {
              e.preventDefault()
              const prevIndex = (index - 1 + radioInputs.length) % radioInputs.length
              radioInputs[prevIndex].focus()
              radioInputs[prevIndex].checked = true
              this.currentFocusIndex = prevIndex
              break
            }

            case ' ': {
              e.preventDefault()
              input.checked = true
              break
            }

            case 'Enter': {
              e.preventDefault()
              form.requestSubmit()
              break
            }
          }
        })
      })

      submitButton.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          form.requestSubmit()
        }
      })
    } else {
      // ===== TEXT QUESTION =====
      form.innerHTML = `
        <input
          type="text"
          name="answer"
          class="text-answer"
          placeholder="✏️ Your answer"
          required
          autocomplete="off"
          tabindex="0"
        >
        <button type="submit" class="submit-btn" tabindex="0">➡️ Answer</button>
      `

      const textInput = form.querySelector('.text-answer')
      const submitButton = form.querySelector('.submit-btn')

      requestAnimationFrame(() => {
        textInput.focus()
        textInput.select()
      })

      textInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && textInput.value.trim()) {
          e.preventDefault()
          form.requestSubmit()
        }
      })

      submitButton.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          form.requestSubmit()
        }
      })
    }

    // ===== TIMER =====
    this.timer = new Timer(10, () => this.gameOver('Time is up!'))
    this.timer.start((time) => {
      const timerElement = document.getElementById('timer')
      if (timerElement) {
        timerElement.textContent = time
        if (time <= 3) {
          timerElement.style.color = 'red'
          timerElement.style.fontWeight = 'bold'
        }
      }
    })

    // ===== SUBMIT =====
    form.onsubmit = (e) => {
      e.preventDefault()
      this.timer.stop()
      const answer = new FormData(form).get('answer')
      this.submitAnswer(data.nextURL, answer)
    }
  }

  async submitAnswer (url, answer) {
    try {
      const result = await sendAnswer(url, answer)
      if (!result.nextURL) {
        this.victory()
      } else {
        this.loadQuestion(result.nextURL)
      }
    } catch {
      this.gameOver('Wrong answer!')
    }
  }

  victory () {
    const totalTime = (Date.now() - this.startTime) / 1000
    saveScore(this.nickname, totalTime)

    this.root.innerHTML = `
      <h2 tabindex="0">🎉 Victory!</h2>
      <p tabindex="0">🏁 Time: ${totalTime.toFixed(2)}s</p>
      <button id="restart" tabindex="0">🔄 Restart</button>
      <button id="highscore" tabindex="0">🏆 High Scores</button>
    `

    this.addGameEndHandlers()
  }

  gameOver (message) {
    this.root.innerHTML = `
      <h2 tabindex="0">❌ ${message}</h2>
      <button id="restart" tabindex="0">🔄 Restart</button>
      <button id="highscore" tabindex="0">🏆 High Scores</button>
    `

    this.addGameEndHandlers()
  }

  addGameEndHandlers () {
    const restart = document.getElementById('restart')
    const highscore = document.getElementById('highscore')

    restart.focus()

    restart.onclick = () => location.reload()
    highscore.onclick = () => import('./main.js').then(mod => mod.showHighScores())
  }
}
