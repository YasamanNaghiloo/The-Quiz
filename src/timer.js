export class Timer {
  constructor (seconds, onTimeout) { // Added space before (
    this.seconds = seconds
    this.onTimeout = onTimeout
    this.interval = null
  }

  start (updateUI) { // Added space before (
    let timeLeft = this.seconds
    updateUI(timeLeft)

    this.interval = setInterval(() => {
      timeLeft--
      updateUI(timeLeft)

      if (timeLeft <= 0) {
        this.stop()
        this.onTimeout()
      }
    }, 1000)
  }

  stop () { // Added space before (
    clearInterval(this.interval)
  }
}
