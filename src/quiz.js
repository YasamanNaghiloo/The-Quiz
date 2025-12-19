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
      <p>Time left: <span id="timer"></span></p>
    `

    const form = document.getElementById('answer-form')

    if (data.alternatives) {
      Object.entries(data.alternatives).forEach(([key, value]) => {
        form.innerHTML += `
          <label>
            <input type="radio" name="answer" value="${key}" required>
            ${value}
          </label><br>
        `
      })
    } else {
      // Nice text input matching nickname style
      form.innerHTML += `<input type="text" name="answer" required class="text-answer" />`
    }

    form.innerHTML += `<button>Answer</button>`

    this.timer = new Timer(10, () => this.gameOver('Time is up!'))
    this.timer.start(time => {
      document.getElementById('timer').textContent = time
    })

    form.addEventListener('submit', e => {
      e.preventDefault()
      this.timer.stop()
      const answer = new FormData(form).get('answer')
      this.submitAnswer(data.nextURL, answer)
    })
  }

  async submitAnswer(url, answer) {
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

  victory() {
    const totalTime = (Date.now() - this.startTime) / 1000
    saveScore(this.nickname, totalTime)

    this.root.innerHTML = `
      <h2 class="success">🎉 Victory!</h2>
      <p>Time: ${totalTime.toFixed(2)}s</p>
      <button id="restart">Restart</button>
      <button id="highscore">High Scores</button>
    `

    document.getElementById('restart').onclick = () => location.reload()
    document.getElementById('highscore').onclick = () => {
      import('./main.js').then(module => module.showHighScores())
    }
  }

  gameOver(message) {
    this.root.innerHTML = `
      <h2 class="error">${message}</h2>
      <button id="restart">Restart</button>
      <button id="highscore">High Scores</button>
    `

    document.getElementById('restart').onclick = () => location.reload()
    document.getElementById('highscore').onclick = () => {
      import('./main.js').then(module => module.showHighScores())
    }
  }
}
