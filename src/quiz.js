import { getQuestion, sendAnswer } from './api.js'
import { Timer } from './timer.js'
import { saveScore } from './storage.js'

export class Quiz {
  constructor(root) {
    this.root = root
    this.startTime = null
    this.timer = null
  }

  start(nickname) {
    this.nickname = nickname
    this.startTime = Date.now()
    this.loadQuestion('https://courselab.lnu.se/quiz/question/1')
  }

  async loadQuestion(url) {
    try {
      const data = await getQuestion(url)
      this.renderQuestion(data)
    } catch {
      this.gameOver('Could not load question')
    }
  }

  renderQuestion(data) {
    this.root.innerHTML = `
      <h2>${data.question}</h2>
      <form id="answer-form"></form>
      <p>⏱️ Time left: <span id="timer"></span></p>
    `

    const form = document.getElementById('answer-form')

    if (data.alternatives) {
      // Radio button question
      Object.entries(data.alternatives).forEach(([key, value]) => {
        form.innerHTML += `
          <label>
            <input type="radio" name="answer" value="${key}" required>
            ${value}
          </label><br>
        `
      })

      const radios = form.querySelectorAll('input[type="radio"]')
      requestAnimationFrame(() => radios[0].focus())

      // Arrow navigation + Enter
      form.onkeydown = e => {
        let index = Array.from(radios).findIndex(r => r === document.activeElement)

        if (e.key === 'ArrowDown') {
          e.preventDefault()
          index = (index + 1) % radios.length
          radios[index].focus()
        }

        if (e.key === 'ArrowUp') {
          e.preventDefault()
          index = (index - 1 + radios.length) % radios.length
          radios[index].focus()
        }

        if (e.key === 'Enter') {
          e.preventDefault()
          const selected = form.querySelector('input[type="radio"]:checked') || radios[0]
          selected.checked = true
          form.requestSubmit()
        }
      }

    } else {
      // Text input question
      form.innerHTML += `<input type="text" name="answer" required class="text-answer" placeholder="✏️ Your answer" />`
      const textInput = form.querySelector('.text-answer')
      requestAnimationFrame(() => textInput.focus())

      textInput.onkeydown = e => {
        if (e.key === 'Enter') {
          e.preventDefault()
          form.requestSubmit()
        }
      }
    }

    // Always add submit button
    form.innerHTML += `<button type="submit">➡️ Answer</button>`

    // Timer
    this.timer = new Timer(10, () => this.gameOver('Time is up!'))
    this.timer.start(time => {
      document.getElementById('timer').textContent = time
    })

    // Form submission
    form.onsubmit = e => {
      e.preventDefault()
      this.timer.stop()
      const answer = new FormData(form).get('answer')
      this.submitAnswer(data.nextURL, answer)
    }
  }

  async submitAnswer(url, answer) {
    try {
      const result = await sendAnswer(url, answer)
      if (!result.nextURL) this.victory()
      else this.loadQuestion(result.nextURL)
    } catch {
      this.gameOver('Wrong answer!')
    }
  }

  victory() {
    const totalTime = (Date.now() - this.startTime) / 1000
    saveScore(this.nickname, totalTime)

    this.root.innerHTML = `
      <h2 class="success">🎉 Victory!</h2>
      <p>🏁 Time: ${totalTime.toFixed(2)}s</p>
      <button id="restart">🔄 Restart</button>
      <button id="highscore">🏆 High Scores</button>
    `
    this.addButtonFocusHandlers()
  }

  gameOver(message) {
    this.root.innerHTML = `
      <h2 class="error">❌ ${message}</h2>
      <button id="restart">🔄 Restart</button>
      <button id="highscore">🏆 High Scores</button>
    `
    this.addButtonFocusHandlers()
  }

  addButtonFocusHandlers() {
    const firstButton = this.root.querySelector('button')
    if (firstButton) firstButton.focus()
    const restart = document.getElementById('restart')
    const highscore = document.getElementById('highscore')
    restart.onclick = () => location.reload()
    highscore.onclick = () => import('./main.js').then(mod => mod.showHighScores())
  }
}
