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
      <select v-model="calendarType">
        <option value="persian">persian</option>
        <option value="gregorian">gregorian</option>
      </select>
      <select v-model="navigatorEnabled">
        <option :value="true">true</option>
        <option :value="false">false</option>
      </select>
      <select v-model="showHint">
        <option :value="true">Show Hint</option>
        <option :value="false">Dont Show Hint</option>
      </select>
    </center>

    <SveltePlugin
      :options="{
        calendarType: calendarType,
        calendar: {
          persian: {
            locale: 'fa',
            showHint: showHint,
            leapYearMode: 'algorithmic' 
          },
          gregorian: {
            locale: 'en',
            showHint: showHint
          }
        },
        inline: true,
        viewMode: viewModeSelected,
        minDate: minDate,
        navigator: {
          enabled: navigatorEnabled,
          scroll: {
            enabled:navigatorEnabled 
          }
        }
      }"
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
      showHint: true,
      navigatorEnabled: true,
      viewModeSelected: 'year',
      calendarType: 'persian',
      minDate: null,
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
