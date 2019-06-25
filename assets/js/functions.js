/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */
export default class AudioFunction {
  constructor(key, ctx) {
    this.key = key
    this.ctx = ctx
    this.oscillator = this.ctx.createOscillator()
    this.oscillator.type = ['sine', 'square', 'sawtooth', 'triangle'][key % 4]
    this.octaveTunings = [1, 1.25, 1.3, 1.5, 1.75, 1.8, 1.9]
    this.frequency =
      this.octaveTunings[key % 7] * (Math.floor((key - 97) / 7) * 110)
    this.setFrequency()
    this.oscillator.start()
    this.gainNode = this.ctx.createGain()
    this.oscillator.connect(this.gainNode)
    this.createInputConnection()
    return false
  }
  start() {
    this.gainNode.gain.setValueAtTime(1, this.ctx.currentTime)
  }
  stop() {
    this.gainNode.gain.setValueAtTime(0, this.ctx.currentTime)
  }
  setFrequency() {
    this.oscillator.frequency.setValueAtTime(
      this.frequency,
      this.ctx.currentTime
    )
  }
  setPreviousNode(previousNode) {
    this.previousNode = previousNode
  }
  setNextNode(nextNode) {
    this.nextNode = nextNode
  }
  connect() {
    if (this.nextNode) {
      this.gainNode.connect(this.nextNode.inputConnection)
    } else {
      this.gainNode.connect(this.ctx.destination)
    }
  }
  createInputConnection() {
    switch (this.key % 3) {
      case 0:
        this.inputConnection = this.gainNode.gain
        break
      case 1:
        this.inputConnection = this.oscillator.frequency
        break
      default:
        this.filter = this.ctx.createBiquadFilter()
        this.filter.type = 'lowpass'
        this.filter.frequency.setValueAtTime(
          this.frequency,
          this.ctx.currentTime
        )
        this.filter.gain.setValueAtTime(25, this.ctx.currentTime)
        this.oscillator.disconnect(this.gainNode)
        this.oscillator.connect(this.filter)
        this.filter.connect(this.gainNode)
        this.inputConnection = this.filter.frequency
    }
  }
}
