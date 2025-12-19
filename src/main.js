import './style.css'
import { Quiz } from './quiz.js'

const app = document.getElementById('app')

app.innerHTML = `
  <h1>Quiz Game</h1>
  <input id="nickname" placeholder="Your nickname" />
  <button id="start">Start</button>
`

document.getElementById('start').onclick = () => {
  const name = document.getElementById('nickname').value.trim()
  if (!name) {
    alert('Please enter a nickname')
    return
  }
  new Quiz(app).start(name)
}
