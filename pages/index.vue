<template>
  <section class="bg-black">
    <form class="container" @submit.prevent="submit">
      <input v-model="text" type="textarea" @focus="init" />
      <a href="#" @click.prevent="go">Start</a>
      <a href="#" @click.prevent="stopNodes">Stop</a>
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
      inited: false
    }
  },
  methods: {
    init() {
      if (!this.inited) {
        try {
          this.context = new (window.AudioContext ||
            window.webkitAudioContext)()
        } catch (error) {
          alert('Not supported')
        }
      }
    },
    submit() {
      this.go()
    },
    generateNodes() {
      this.nodeSeries = []
      console.log(this.nodeSeries)
      const words = this.text.split(' ')
      words.map((word, index) => {
        const series = []
        const letters = word.split('')
        letters.map((letter, index) => {
          series.push(new AudioFunction(letter.charCodeAt(0), this.context))
        })
        this.nodesSeries.push(series)
      })
    },
    go() {
      this.init()
      this.generateNodes()
      this.connectNodes()
      this.startNodes()
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
