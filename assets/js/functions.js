/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */
export default class AudioFunction {
  constructor(key, ctx, masterGain) {
    this.masterGain = masterGain
    this.key = key
    this.ctx = ctx
    this.oscillator = this.ctx.createOscillator()
    this.oscillator.type = ['sine', 'sawtooth'][key % 2]
    this.oscillator.detune.setValueAtTime(
      (key - 97) * 1.5,
      this.ctx.currentTime
    )
    this.octaveTunings = [1, 1.25, 1.3, 1.5, 1.75, 1.8, 1.9]
    this.baseFrequency = Math.floor((key - 97) / 7) * 110 + 110
    this.frequency = this.octaveTunings[key % 7] * this.baseFrequency
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
      Math.abs(this.frequency),
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
      this.gainNode.connect(this.masterGain)
    }
  }
  // this.inputConnection is the node to which an incoming signal will connect
  createInputConnection() {
    switch (this.key % 6) {
      case 0:
        this.inputConnection = this.gainNode.gain
        break
      case 1:
        this.filter = this.ctx.createBiquadFilter()
        this.filter.type = 'bandpass'
        this.filter.frequency.setValueAtTime(
          this.frequency,
          this.ctx.currentTime
        )
        this.filter.Q.value = (this.key % 9) + 1
        this.inputConnection = this.filter
        break
      case 2:
        this.inputConnection = this.ctx.createDelay((this.key * 1.0) / 26)
        break
      case 3:
        this.filter = this.ctx.createBiquadFilter()
        this.filter.type = 'lowpass'
        this.filter.frequency.setValueAtTime(
          this.frequency,
          this.ctx.currentTime
        )
        this.filter.Q.value = (this.key % 9) + 1
        this.inputConnection = this.filter
        break
      case 4:
        this.filter = this.ctx.createBiquadFilter()
        this.filter.type = 'lowshelf'
        this.filter.frequency.setValueAtTime(
          this.frequency,
          this.ctx.currentTime
        )
        this.filter.Q.value = (this.key % 9) + 1
        this.inputConnection = this.filter
        break
      case 5:
        this.waveShaper = this.ctx.createWaveShaper()
        const sampleRate = this.ctx.sampleRate
        const curve = new Float32Array(sampleRate)
        curve[0] = -1
        for (let i = 1; i < sampleRate - 1; i++) {
          const move = Math.random() * 0.1
          let direction = Math.random() - 0.5 > 0 ? -1 : 1
          const testMove = curve[i - 1] + move * direction
          if (Math.abs(testMove) >= 1) {
            direction *= -1
          }
          curve[i] = curve[i - 1] + move * direction
        }
        curve[sampleRate - 1] = 1
        for (let i = 1; i < sampleRate - 1; i++) {
          const average = (curve[0] + curve[1] + curve[2]) / 3.0
          curve[i] = average
        }
        this.waveShaper.curve = curve
        this.waveShaper.oversample = '4x'
        this.filter = this.ctx.createBiquadFilter()
        this.filter.type = 'lowpass'
        this.filter.frequency.setValueAtTime(
          Math.abs(this.frequency / 8.0),
          this.ctx.currentTime
        )
        this.filter.Q.value = (this.key % 5) + 5
        this.filter.connect(this.waveShaper)
        this.inputConnection = this.filter
        break
    }
  }
}
