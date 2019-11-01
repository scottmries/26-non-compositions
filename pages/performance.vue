<template>
  <section class="bg-black w-screen h-screen" style="cursor: none;">
    <div
      v-if="showingCredit < 10"
      class="credits text-white container flex"
      @click="go"
    >
      <h1 v-if="showingCredit === 0">
        26 Non-Compositions
      </h1>
      <h2 v-if="showingCredit === 1">
        (or however many will fit in {{ timeRemaining }})
      </h2>
      <h3 v-if="showingCredit === 2">
        (and none of which will ever be heard again)
      </h3>
      <div v-if="[3, 5, 7, 9].indexOf(showingCredit) > -1"></div>
      <div v-if="showingCredit === 4">
        <h3 class="mb-2 text-2xl">Object Composition:</h3>
        <p class="text-xl">
          Combining simple objects to create more complex ones.
        </p>
      </div>
      <div v-if="showingCredit === 6">
        <h3 class="mb-2 text-2xl">Compositionality:</h3>
        <p class="text-xl">
          the principle that the meaning of a whole derives directly<br />from
          the meaning of its parts and the ways in which they are combined.
        </p>
      </div>
      <div v-if="showingCredit === 8">
        <p class="mb-2 text-xl">
          “I wanted to end composing, get rid of it. I wanted it to die out.”
        </p>
        <h3 class="text-2xl">Tony Conrad</h3>
      </div>
    </div>
    <form v-else class="container" @submit.prevent="submit">
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
      <a href="#" @click.prevent="startSound">Start</a>
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
      keyMap: [],
      showingCredit: -1,
      startedMSAgo: 0
    }
  },
  computed: {
    timeRemaining() {
      const millisecondsAgo = 1000 * 60 * 10 - this.startedMSAgo
      return (
        this.zeroPad(Math.floor(millisecondsAgo / (1000 * 60)), 2) +
        ':' +
        this.zeroPad(Math.floor(millisecondsAgo / 100) % 60, 2) +
        ':' +
        this.zeroPad(millisecondsAgo % 10, 4)
      )
    }
  },
  mounted() {
    // this.init()
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
        this.started = false
      }
    },
    submit() {
      this.stopNodes()
      this.startSound()
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
    async go() {
      if (!this.started) {
        this.started = true
        setInterval(() => this.startedMSAgo++, 1)
        for (let i = 0; i < 11; i++) {
          let time = 3000
          switch (i) {
            case 6:
              time = 6000
              break
            case 4:
            case 8:
              time = 4000
              break
            default:
              time = 3000
          }
          this.showingCredit = i
          await this.timeoutPromise(time)
        }
        this.startSound()
      }
    },
    startSound() {
      this.init()
      this.generateNodes()
      this.setMixerGain()
      this.connectNodes()
      this.startNodes()
      // this.draw()
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
    },
    timeoutPromise(ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    },
    zeroPad(num, digits) {
      return num < Math.pow(10, digits - 1) ? '0' + num : num
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
</style>
