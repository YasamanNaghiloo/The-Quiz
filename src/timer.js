export class Timer {
  constructor(seconds, onTimeout) {
    this.seconds = seconds
    this.onTimeout = onTimeout
    this.interval = null
  }

  start(updateUI) {
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

  stop() {
    clearInterval(this.interval)
  }
}
