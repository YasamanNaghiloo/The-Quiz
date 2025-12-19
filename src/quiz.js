import { getQuestion, sendAnswer } from './api.js'
import { Timer } from './timer.js'
import { saveScore } from './storage.js'

export class Quiz {
  constructor(root) {
    this.root = root
    this.startTime = null
    this.timer = null
    this.currentFocusIndex = 0
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
    this.currentFocusIndex = 0
    this.root.innerHTML = `
      <h2 tabindex="0">${data.question}</h2>
      <form id="answer-form" role="form" aria-label="Question form"></form>
      <p>⏱️ Time left: <span id="timer">10</span>s</p>
    `

    const form = document.getElementById('answer-form')

    if (data.alternatives) {
      // Radio button question
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
              aria-label="${value}"
            >
            <label for="option-${index}">${value}</label>
          </div>
        `
      })
      
      form.innerHTML = radioHTML + `<button type="submit" class="submit-btn">➡️ Answer</button>`

      const radioInputs = form.querySelectorAll('input[type="radio"]')
      const submitButton = form.querySelector('.submit-btn')
      
      // Focus the first radio button immediately
      requestAnimationFrame(() => {
        radioInputs[0].focus()
      })

      // Keyboard navigation for radio buttons
      radioInputs.forEach((input, index) => {
        input.addEventListener('keydown', (e) => {
          switch(e.key) {
            case 'ArrowDown':
              e.preventDefault()
              const nextIndex = (index + 1) % radioInputs.length
              radioInputs[nextIndex].focus()
              radioInputs[nextIndex].checked = true
              this.currentFocusIndex = nextIndex
              break
              
            case 'ArrowUp':
              e.preventDefault()
              const prevIndex = (index - 1 + radioInputs.length) % radioInputs.length
              radioInputs[prevIndex].focus()
              radioInputs[prevIndex].checked = true
              this.currentFocusIndex = prevIndex
              break
              
            case 'Enter':
              e.preventDefault()
              form.requestSubmit()
              break
          }
        })
      })

      // Also allow Space to select
      radioInputs.forEach((input) => {
        input.addEventListener('keydown', (e) => {
          if (e.key === ' ') {
            e.preventDefault()
            input.checked = true
          }
        })
      })

      // Make submit button focusable and handle Enter
      submitButton.tabIndex = 0
      submitButton.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          form.requestSubmit()
        }
      })

    } else {
      // Text input question
      form.innerHTML = `
        <input 
          type="text" 
          name="answer" 
          required 
          class="text-answer" 
          placeholder="✏️ Your answer" 
          tabindex="0"
          autocomplete="off"
        />
        <button type="submit" class="submit-btn">➡️ Answer</button>
      `
      
      const textInput = form.querySelector('.text-answer')
      const submitButton = form.querySelector('.submit-btn')
      
      // Focus the text input immediately
      requestAnimationFrame(() => {
        textInput.focus()
        textInput.select()
      })
      
      // Handle Enter key in text input
      textInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && textInput.value.trim()) {
          e.preventDefault()
          form.requestSubmit()
        }
      })

      // Make submit button focusable and handle Enter
      submitButton.tabIndex = 0
      submitButton.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          form.requestSubmit()
        }
      })
    }

    // Timer
    this.timer = new Timer(10, () => this.gameOver('Time is up!'))
    this.timer.start(time => {
      const timerElement = document.getElementById('timer')
      if (timerElement) {
        timerElement.textContent = time
        
        // Visual warning when time is low
        if (time <= 3) {
          timerElement.style.color = '#ff0000'
          timerElement.style.fontWeight = 'bold'
          timerElement.style.animation = 'pulse 0.5s infinite alternate'
        }
      }
    })

    // Form submission
    form.onsubmit = (e) => {
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
      <h2 tabindex="0" class="success">🎉 Victory!</h2>
      <p tabindex="0">🏁 Time: ${totalTime.toFixed(2)}s</p>
      <div class="button-group">
        <button id="restart" tabindex="0">🔄 Restart</button>
        <button id="highscore" tabindex="0">🏆 High Scores</button>
      </div>
    `
    this.addGameEndHandlers()
  }

  gameOver(message) {
    this.root.innerHTML = `
      <h2 tabindex="0" class="error">❌ ${message}</h2>
      <div class="button-group">
        <button id="restart" tabindex="0">🔄 Restart</button>
        <button id="highscore" tabindex="0">🏆 High Scores</button>
      </div>
    `
    this.addGameEndHandlers()
  }

  addGameEndHandlers() {
    const restart = document.getElementById('restart')
    const highscore = document.getElementById('highscore')
    
    if (restart) {
      // Focus the restart button immediately
      restart.focus()
      
      // Keyboard navigation between buttons
      restart.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') {
          e.preventDefault()
          highscore.focus()
        } else if (e.key === 'Enter') {
          e.preventDefault()
          restart.click()
        }
      })
    }
    
    if (highscore) {
      highscore.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
          e.preventDefault()
          restart.focus()
        } else if (e.key === 'Enter') {
          e.preventDefault()
          highscore.click()
        }
      })
      
      restart.onclick = () => location.reload()
      highscore.onclick = () => import('./main.js').then(mod => mod.showHighScores())
    }
  }
}