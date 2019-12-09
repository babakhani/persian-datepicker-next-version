<template>
  <div id="app">
    <img
      class="vue-logo"
      alt="Vue logo"
      src="../public/logo.png"
    />
    <SveltePlugin
      :options="{
        sampleConfig: 'passed from vue js',
      }"
      @onSampleEvent="handleClick"
      @onSampleEventOver="handleOver"
    />
  </div>
</template>
<script>
import SveltePlugin from '../../../dist/zerounip-vue.js'
// eslint-disable-next-line no-unused-vars
import styles from '../../../dist/zerounip.css'
export default {
  name: 'App',
  components: { SveltePlugin },
  methods: {
    handleOver() {
      console.log('Vue handle mouse over vue js')
    },
    handleClick() {
      alert('alert from vue js')
    },
  },
}
</script>

<style>
html {
  font-family: 'Open Sans', sans-serif;
}

.vue-logo { 
  display: block;
  margin: 0 auto;
}

#app {
  color: #2c3e50;
  margin-top: 60px;
}
</style>
