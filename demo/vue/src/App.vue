<template>
  <div id="app">
  <header>
  <img 
    class="platform-logo" 
    src="../public/logo.png"/>
    <h1>
    Persian Datepicker, Vue Demo
    </h1>
  </header>
  <div
    class="demo-box" >
    <Datepicker
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
        format: 'LLLL',
        formatter: function (unixDate, dateObject) {
          return new dateObject(unixDate).format(this.format);
        },
        minDate: null,
        maxDate: null,
        viewMode: viewModeSelected,
        navigator: {
          enabled: true,
          scroll: {
            enabled: true
          },
          text: {
            btnNextText: '<',
            btnPrevText: '>'
          },
          onNext: function (datepickerObject) { },
          onPrev: function (datepickerObject) { },
          onSwitch: function (datepickerObject) { }
        },
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
  <div
    class="config-area" >
      <h3>Settings</h3>
      <label>Calendar Type </label>
      <select v-model="calendarType">
        <option value="persian">persian</option>
        <option value="gregorian">gregorian</option>
      </select>
      <label>Show Hint </label>
      <select v-model="showHint">
        <option :value="true">Show Hint</option>
        <option :value="false">Dont Show Hint</option>
      </select>
      <label>View Mode </label>
      <select v-model="viewModeSelected">
        <option value="day">Day</option>
        <option value="month">Month</option>
        <option value="year">Year</option>
      </select>
      <label>Navigator Enabled </label>
      <select v-model="navigatorEnabled">
        <option :value="true">true</option>
        <option :value="false">false</option>
      </select>
  </div>
  </div>
</template>
<script>
import Datepicker from '../../../dist/zerounip-vue.js'
// eslint-disable-next-line no-unused-vars
import styles from '../../../dist/zerounip.css'
export default {
  name: 'App',
  components: { Datepicker },
  data () {
    return {
      showHint: true,
      navigatorEnabled: false,
      viewModeSelected: 'day',
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
header {
  display: block;
  width: 100%;
  float: left;
  margin-bottom: 20px;
}

header h1 {
  display: block;
  float: left;
  margin-top: 30px;
  margin-left: 1em;
}

.platform-logo {
  float: left;
  max-width: 120px;
  max-height: 120px;
}

.demo-box {
  display: block;
  float: left;
  width: 20%;
  padding: 0;
  margin: 0;
}
.config-area {
  display: block;
  float: left;
  width: 70%;
  padding: 0;
  margin: 0;
  background: #f1f1f1;
  padding: 20px;
}

label {
  display: block;
  float: left;
  width: 100%;
}

input,
select {
  display: block;
  float: left;
  clear: both;
  width: 250px;
  height: 38px;
  margin-top: 10px;
  margin-bottom: 20px;
  background: #fff;
  font-size: 1.1em;
}
</style>
