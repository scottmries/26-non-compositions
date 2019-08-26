<template>
  <section class="bg-black">
    <form class="container" @submit.prevent="submit">
      <div>
        <input
          id="myRange"
          type="range"
          min="0.000001"
          max="1"
          value="0.1"
          class="slider($event)"
          step="0.001"
          @change="setGain"
        />
      </div>
      <input v-model="text" type="textarea" @focus="init" />
      <a href="#" @click.prevent="go">Start</a>
      <a href="#" @click.prevent="stopNodes">Stop</a>
      <div>
        <canvas id="scope" ref="scope" width="300" height="150"></canvas>
      </div>
    </form>
  </section>
</template>

<script>
import AudioFunction from '~/assets/js/functions'

export default {
  data() {
    return {
      context: null,
      playing: false,
      text: 'stuff stuff tough and rough tuff stuff',
      nodesSeries: [],
      inited: false,
      masterGain: null,
      mixerGain: null,
      gain: 0.000001,
      analyzer: null,
      scopeArray: null,
      scopeCtx: null,
      keyMap: []
    }
  },
  mounted() {
    this.init()
  },
  destroyed() {
    this.stopNodes()
  },
  methods: {
    init() {
      if (!this.inited) {
        this.generateKeyMap()
        this.context = new (window.AudioContext || window.webkitAudioContext)()
        this.mixerGain = this.context.createGain()
        this.masterGain = this.context.createGain()
        this.masterGain.gain.setValueAtTime(0.1, this.context.currentTime)
        this.analyzer = this.context.createAnalyser()
        this.mixerGain.connect(this.masterGain)
        this.masterGain.connect(this.analyzer)
        this.analyzer.connect(this.context.destination)
        this.analyzer.fftSize = 2048
        this.scopeArray = new Uint8Array(this.analyzer.frequencyBinCount)
        this.scopeCtx = this.$refs.scope.getContext('2d')
        this.inited = true
      }
    },
    submit() {
      this.stopNodes()
      this.go()
    },
    generateNodes() {
      const words = this.text.split(' ')
      words.map((word, index) => {
        const series = []
        const letters = word.split('')
        letters.map((letter, index) => {
          series.push(
            new AudioFunction(
              this.keyMap[letter.charCodeAt(0) - 97],
              this.context,
              this.masterGain
            )
          )
        })
        this.nodesSeries.push(series)
      })
    },
    go() {
      this.init()
      this.generateNodes()
      this.setMixerGain()
      this.connectNodes()
      this.startNodes()
      this.draw()
    },
    setMixerGain() {
      const gain = 1.0 / this.nodesSeries.length
      this.masterGain.gain.setValueAtTime(gain, this.context.currentTime)
    },
    connectNodes() {
      this.nodesSeries.map(series => {
        series.map((node, index) => {
          if (series[index - 1]) {
            node.setPreviousNode(series[index - 1])
          }
          if (series[index + 1]) {
            node.setNextNode(series[index + 1])
          }
          node.connect()
        })
      })
    },
    startNodes() {
      this.nodesSeries.map(series => {
        series.map(node => {
          node.start()
        })
      })
    },
    stopNodes() {
      this.nodesSeries.map(series => {
        series.map(node => {
          node.stop()
        })
      })
      this.clearNodes()
    },
    clearNodes() {
      this.nodesSeries = []
    },
    setGain(e) {
      this.masterGain.gain.exponentialRampToValueAtTime(
        e.target.value,
        this.context.currentTime + 1
      )
    },
    draw() {
      requestAnimationFrame(this.draw)
      this.analyzer.getByteTimeDomainData(this.scopeArray)
      this.scopeCtx.fillStyle = 'rgb(200,200,200)'
      this.scopeCtx.fillRect(
        0,
        0,
        this.$refs.scope.width,
        this.$refs.scope.height
      )
      this.scopeCtx.lineWidth = 2
      this.scopeCtx.strokeStyle = 'rgb(0, 0, 0)'
      this.scopeCtx.beginPath()
      const bufferLength = this.scopeArray.length
      const sliceWidth = (this.$refs.scope.width * 1.0) / bufferLength
      let x = 0
      for (let i = 0; i < bufferLength; i++) {
        const v = this.scopeArray[i] / 128.0
        const y = (v * this.$refs.scope.height) / 2

        if (i === 0) {
          this.scopeCtx.moveTo(x, y)
        } else {
          this.scopeCtx.lineTo(x, y)
        }

        x += sliceWidth
      }
      this.scopeCtx.lineTo(this.$refs.scope.width, this.$refs.scope.height / 2)
      this.scopeCtx.stroke()
    },
    generateKeyMap() {
      for (let i = 0; i < 97; i++) {
        this.keyMap.push(i)
      }
      this.keyMap = this.keyMap.sort(() => Math.random() - 0.5)
    }
  }
}
</script>

<style>
/* Sample `apply` at-rules with Tailwind CSS
.container {
  @apply min-h-screen flex justify-center items-center text-center mx-auto;
}
*/
.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}
</style>
