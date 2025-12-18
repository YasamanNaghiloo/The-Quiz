import './styles/main.css'
import { questionData } from './data/question.js'

const app = document.querySelector('#app')
let timeLeft = Number(questionData.limit)
let timerId = null

function renderQuestion () {
  app.innerHTML = `
    <h2>${questionData.question}</h2>
    <p id="timer">Time left: ${timeLeft}s</p>

    <form id="quiz-form">
      <input type="text" name="answer" required />
      <br><br>
      <button type="submit">Submit</button>
    </form>

    <p>${questionData.message}</p>
  `

  document
    .querySelector('#quiz-form')
    .addEventListener('submit', handleSubmit)
}

function handleSubmit (event) {
  event.preventDefault()
  clearInterval(timerId)

  const answer = new FormData(event.target).get('answer')

  app.innerHTML = `
    <h2>Answer submitted!</h2>
    <p>Your answer: <strong>${answer}</strong></p>
    <p>(UI only – no backend validation)</p>
  `
}

function startTimer () {
  timerId = setInterval(() => {
    timeLeft--

    const timer = document.querySelector('#timer')
    if (timer) {
      timer.textContent = `Time left: ${timeLeft}s`
    }

    if (timeLeft === 0) {
      clearInterval(timerId)
      gameOver()
    }
  }, 1000)
}

function gameOver () {
  app.innerHTML = `
    <h2>Game Over</h2>
    <p>Time ran out.</p>
    <button id="restart">Restart</button>
  `

  document
    .querySelector('#restart')
    .addEventListener('click', () => {
      timeLeft = Number(questionData.limit)
      renderQuestion()
      startTimer()
    })
}

renderQuestion()
startTimer()
