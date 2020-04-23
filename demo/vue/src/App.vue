<template>
  <div id="app">
    <img
      class="vue-logo"
      alt="Vue logo"
      src="../public/logo.png"
    />
    <center>
      <h1> Persian Datepicket Vue Example</h1>
      <select v-model="viewModeSelected">
        <option value="day">Day</option>
        <option value="month">Month</option>
        <option value="year">Year</option>
      </select>
    </center>
    <SveltePlugin
      options="{
        inline: true,
      }"
      :number="viewModeSelected"
      @onSelectPrevView="onSelectPrevView"
      @onSelectTime="onSelectTime"
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
  data () {
    return {
       viewModeSelected: 'year'
    }
  },
  methods: {
    onSelectTime(e) {
      console.log('Vue handle onSelectTime')
      console.log(e.detail)
    },
    onSelectPrevView() {
      console.log('Vue handle onSelectPrevView')
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
