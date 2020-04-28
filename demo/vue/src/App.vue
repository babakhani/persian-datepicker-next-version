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
      <h5>{{ selectedDate }}</h5>
      <input v-model="selectedDate" type="range" min="0" max="1589052600000" step="1000" />
      <Datepicker
        v-model="selectedDate"
        v-if="rerenderFlag"
        :options="datepickerConfig"
        @onSelectPrevView="onSelectPrevView"
        @onSelectTime="onSelectTime"
        />
    </div>
      <div
        class="config-area">
        <h3>Settings</h3>
        <h4>General</h4>
        <ConfigSelect
          label="View Mode"
          help="Default view mode, Acceptable value : day,month,year"
          :options="[
            {label: 'day', value: 'day'},
            {label: 'month', value: 'month'},
            {label: 'year', value: 'year'}
          ]"
          v-model="datepickerConfig.viewMode"/>
        <ConfigSwitch 
          label="Inline"
          help="if true datepicker render inline"
          v-model="datepickerConfig.inline"/>  
        <ConfigSwitch 
          label="Auto Close"
          help="If true picker close When select a date"
          v-model="datepickerConfig.autoClose"/>  
        <ConfigSwitch 
          label="Only Timepicker"
          help="if true all pickers hide and just show timepicker"
          v-model="datepickerConfig.onlyTimePicker"/>  
        <ConfigSwitch 
          label="Only Select on Date"
          help="if true date select just by click on day in month grid, and when user select month or year selected date doesnt change"
          v-model="datepickerConfig.onlySelectOnDate"/>  
        <ConfigSelect
          label="Position"
          help="position of datepicker element relative to input element, accept auto, [x,y]"
          :options="[
            {label: 'auto', value: 'auto'},
            {label: 'Offset 10', value: [10, 10]},
          ]"
          v-model="datepickerConfig.position"/>
        <ConfigText
          label="Format"
          help="Default input value formatt string."
          v-model="datepickerConfig.format"/>
        <ConfigText
          label="Alt Format"
          help="Default input value formatt string."
          v-model="datepickerConfig.altFormat"/>
        <ConfigSelect
          label="Min Date"
          help="Set min date on datepicker, prevent user select date before given unix time"
          :options="[
            {label: 'null', value: null },
            {label: '1 day', value: (new Date().valueOf() - (86400000 * 1))  },
            {label: '2 day', value: (new Date().valueOf() - (86400000 * 2))  },
            {label: '5 day', value: new Date().valueOf() - (86400000 * 5)  },
            {label: '30 day', value: new Date().valueOf() - (86400000 * 30)  },
          ]"
          v-model="datepickerConfig.minDate"/>
        <ConfigSelect
          label="Max Date"
          help="Set max date on datepicker, prevent user select date after given unix time"
          :options="[
            {label: 'null', value: null },
            {label: '1 day', value: new Date().valueOf() + 86400000 },
            {label: '2 day', value: (new Date().valueOf() + (86400000 * 2))  },
            {label: '5 day', value: new Date().valueOf() + (86400000 * 5)  },
            {label: '30 day', value: new Date().valueOf() + (86400000 * 30)  },
          ]"
          v-model="datepickerConfig.maxDate"/>
        <ConfigSwitch 
          label="Observer"
          help="if true datepicker update self by user inputted date string, accept 'yyyy/mm/dd' example: '1396/10/2', '1396/1/12'"
          v-model="datepickerConfig.observer"/>  
        <h4>Calendar</h4>
        <ConfigSelect
          label="Calendar Type"
          help="set default calendar mode of datepicker, available options: 'persian', 'gregorian'"
          :options="[
            {label: 'persian', value: 'persian'},
            {label: 'gregorian', value: 'gregorian'}
          ]"
          v-model="datepickerConfig.calendarType"/>
        <ConfigSwitch 
          label="Show Hint In Persian"
          help="if set true, small date hint of this calendar will be shown on another calendar"
          v-model="datepickerConfig.calendar.persian.showHint"/>  
        <ConfigSelect
          label="Locale In Persian"
          help="set locale of calendar available options: 'fa', 'en'"
          :options="[
            {label: 'Fa', value: 'fa'},
            {label: 'EN', value: 'en'}
          ]"
          v-model="datepickerConfig.calendar.persian.locale"/>
        <ConfigSelect
          label="Persian Leap year mode"
          :options="[
            {label: 'algorithmic', value: 'algorithmic'},
            {label: 'astronomical', value: 'astronomical'}
          ]"
          v-model="datepickerConfig.calendar.persian.locale"/>
        <ConfigSwitch 
          label="Show Hint In Gregorian"
          help="if set true, small date hint of this calendar will be shown on another calendar"
          v-model="datepickerConfig.calendar.gregorian.showHint"/>  
        <ConfigSelect
          label="Locale In Gregorian"
          help="set locale of calendar available options: 'fa', 'en'"
          :options="[
            {label: 'algorithmic', value: 'algorithmic'},
            {label: 'astronomical', value: 'astronomical'}
          ]"
          v-model="datepickerConfig.calendar.gregorian.locale"/>
        <h4>Day Picker</h4>
        <ConfigSwitch 
          label="Day Picker Enabled"
          v-model="datepickerConfig.dayPicker.enabled"/>  
        <ConfigText 
          label="Day Picker Title Format"
          v-model="datepickerConfig.dayPicker.titleFormat"/>  
        <h4>Month Picker</h4>
        <ConfigSwitch 
          label="Month Picker Enabled"
          v-model="datepickerConfig.monthPicker.enabled"/>  
        <ConfigText 
          label="Month Picker Title Format"
          v-model="datepickerConfig.monthPicker.titleFormat"/>  
        <h4>Year Picker</h4>
        <ConfigSwitch 
          label="Year Picker Enabled"
          v-model="datepickerConfig.yearPicker.enabled"/>  
        <ConfigText 
          label="Year Picker Title Format"
          v-model="datepickerConfig.yearPicker.titleFormat"/>  
        <h4>Time Picker</h4>
        <ConfigSwitch 
          label="Time Picker Enabled"
          v-model="datepickerConfig.timePicker.enabled"/>  
        <ConfigSelect
          label="Time Picker Steps"
          :options="[
            {label: '1', value: 1},
            {label: '5', value: 5}
          ]"
          v-model="datepickerConfig.timePicker.step"/>
        <ConfigText 
          label="Time Picker Title Format"
          v-model="datepickerConfig.timePicker.titleFormat"/>  
        <ConfigSwitch 
          label="Time Picker Hour Enabled"
          v-model="datepickerConfig.timePicker.hour.enabled"/>  
        <ConfigSelect
          label="Time Picker Hour Steps"
          :options="[
            {label: '1', value: 1},
            {label: '5', value: 5}
          ]"
          v-model="datepickerConfig.timePicker.hour.step"/>
        <ConfigSwitch 
          label="Time Picker Minute Enabled"
          v-model="datepickerConfig.timePicker.minute.enabled"/>  
        <ConfigSelect
          label="Time Picker Minute Steps"
          :options="[
            {label: '1', value: 1},
            {label: '5', value: 5}
          ]"
          v-model="datepickerConfig.timePicker.minute.step"/>
        <ConfigSwitch 
          label="Time Picker Second Enabled"
          v-model="datepickerConfig.timePicker.second.enabled"/>  
        <ConfigSelect
          label="Time Picker Second Steps"
          :options="[
            {label: '1', value: 1},
            {label: '5', value: 5}
          ]"
          v-model="datepickerConfig.timePicker.second.step"/>
        <ConfigSwitch 
          label="Time Picker Meridian Enabled"
          v-model="datepickerConfig.timePicker.meridian.enabled"/>  
        <h4>Toolbox</h4>
        <ConfigSwitch 
          label="Toolbox Enabled"
          v-model="datepickerConfig.toolbox.enabled"/>  
        <ConfigSwitch 
          label="Today Button Enabled"
          v-model="datepickerConfig.toolbox.todayButton.enabled"/>  
        <ConfigSwitch 
          label="Calendar Switch Button Enabled"
          v-model="datepickerConfig.toolbox.calendarSwitch.enabled"/>  
        <ConfigSwitch 
          label="Submit Button Enabled"
          v-model="datepickerConfig.toolbox.submitButton.enabled"/>  
        <h4>Navigator</h4>
        <ConfigSwitch 
          label="Navigator Enabled"
          v-model="datepickerConfig.navigator.enabled"/>  
        <ConfigSwitch 
          label="Navigat By Scroll Enabled"
          v-model="datepickerConfig.navigator.scroll.enabled"/>  
        <h4>Infobox</h4>
        <ConfigSwitch 
          label="Infobox Enabled"
          v-model="datepickerConfig.infobox.enabled"/>  
        <ConfigText 
          label="Infobox Title Format"
          v-model="datepickerConfig.infobox.titleFormat"/>  
        <ConfigText 
          label="Infobox Selected Date Format"
          v-model="datepickerConfig.infobox.selectedDateFormat"/>  
      </div>
  </div>
</template>
<script>
import Datepicker from '../../../dist/zerounip-vue.js'
// eslint-disable-next-line no-unused-vars
import styles from '../../../dist/zerounip.css'
import ConfigSelect from './Select.vue'
import ConfigText from './Text.vue'
import ConfigSwitch from './Switch.vue'
export default {
  name: 'App',
  components: { Datepicker, ConfigSelect, ConfigSwitch, ConfigText },
  data () {
    return {
      selectedDate: new Date().valueOf(),
      rerenderFlag: true,
      datepickerConfig: {
        calendarType: 'persian', // DONE
        calendar: {
          persian: {
            locale: 'fa', // DONE
            showHint: true, // DONE
            leapYearMode: 'algorithmic' // "astronomical" // DONE
          },
          gregorian: {
            locale: 'en', // DONE
            showHint: true  // DONE
          }
        },
        responsive: true, // Deprecated
        inline: true, // Deprected
        initialValue: false,  // DONE
        initialValueType: 'persian', // Works but deprecated in next version
        persianDigit: true, // Deprected
        viewMode: 'day', // DONE
        format: 'LLLL', // DONE
        formatter (unixDate, dateObject) {
          return new dateObject(unixDate).format(this.format);
        }, // DONE
        altField: '#containerAlt',  // DONE
        altFormat: 'g', // DONE
        altFieldFormatter: function (unixDate, dateObject) {
          if (this.altFormat === 'gregorian' || this.altFormat === 'g') {
            return new Date(unixDate)
          }
          else if (this.altFormat === 'unix' || this.altFormat === 'u') {
            return new dateObject(unixDate).valueOf();
          } else {
            return new dateObject(unixDate).format(this.altFormat);
          }
        }, // DONE
        minDate: null, // DONE
        maxDate: null, // DONE,
        navigator: {
          'enabled': true,
          'scroll': {
            'enabled': true
          },
          'text': {
            'btnNextText': '<', // Deprecated
            'btnPrevText': '>' // Deprected
          },
          'onNext': function (datepickerObject) { // DONE
            // console.log('navigator.onNext')
            // console.log(datepickerObject)
          },
          'onPrev': function (datepickerObject) { // DONE
            // console.log('navigator.onPrev')
            // console.log(datepickerObject)
          },
          'onSwitch': function (datepickerObject) { // DONE
            // console.log('navigator.onSwitch')
            //console.log(datepickerObject)
          }
        },
        toolbox: {
          enabled: true,
          text: { // DEPRECTED
            btnToday: 'امروز'
          },
          submitButton: {
            enabled: true, // DONE
            text: { // DEPRECTED
              fa: 'تایید',
              en: 'submit'
            },
            onSubmit: function (datepickerObject) { // DONE
              // console.log('toolbox.onSubmit')
            }
          },
          todayButton: {
            enabled: true, // DONE
            text: { // DEPRECTED
              fa: 'امروز',
              en: 'today'
            },
            onToday: function (datepickerObject) { // DONE
              // console.log('toolbox.onToday')
            }
          },
          calendarSwitch: {
            enabled: true, // DONE
            format: 'MMMM', // DEPRECATED
            onSwitch: function (datepickerObject) { // DONE
              // console.log('toolbox.onSwitch')
            }
          }
        },
        onlyTimePicker: false, // DONE
        onlySelectOnDate: true,
        checkDate: function (unix) { // DONE
          return true 
        },
        checkMonth: function (y, m) { // DONE
          return true;
        },
        checkYear: function (y) { // DONE
          return true;
        },
        'timePicker': {
          'enabled': true, // DONE
          'step': 1, // DONE
          'hour': {
            'enabled': true, // DONE
            'step': null // DONE
          },
          'minute': {
            'enabled': true, // DONE
            'step': null // DONE
          },
          'second': {
            'enabled': true, // DONE
            'step': null // DONE
          },
          'meridian': {
            'enabled': true // DONE
          }
        },
        dayPicker: {
          'enabled': true, // DONE
          'titleFormat': 'YYYY MMMM', // DONE
          'titleFormatter': function (unix, dateObject) { // DONE
            return new dateObject(unix).format(this.titleFormat)
          },
          'onSelect': function (selectedDayUnix) { // DONE
            // console.log('use event onSelect date')
          }
        },
        monthPicker: {
          'enabled': true,
          'titleFormat': 'YYYY', // DONE
          'titleFormatter': function (unix, dateObject) { // DONE
            return new dateObject(unix).format(this.titleFormat)
          },
          'onSelect': function (monthIndex) { // DONE
            // console.log('use event onSelect month')
          }
        },
        yearPicker: {
          'enabled': true,
          'titleFormat': 'YYYY', // DONE
          'titleFormatter': function (unix, dateObject) { // DONE
            let selectedYear = new dateObject(unix).year()
            let startYear = selectedYear - (selectedYear % 12)
            return new dateObject(unix).year(startYear).format(this.titleFormat) + '-' + new
              dateObject(unix).year(startYear+ 11).format(this.titleFormat)
          },
          onSelect: function (year) { // DONE
            // console.log('use event onSelect year')
          }
        },
        infobox : {
          enabled: true, // DONE
          'titleFormat': 'YYYY', // DONE
          'titleFormatter': function (unix, dateObject) { // DONE
            return new dateObject(unix).format(this.titleFormat)
          },
          'selectedDateFormat': ' dddd DD MMMM', // DONE
          'selectedDateFormatter': function (unix, dateObject) { // DONE
            return new dateObject(unix).format(this.selectedDateFormat)
          },
        },
        position: 'auto', // DONE
        autoClose: false, // DONE
        template: null, // DEPRECATED
        observer: true, // DONE
        inputDelay: 800, // DEPRECATED
      }
    }
  },
  watch: {
    datepickerConfig: {
      deep: true,
      handler () {
        this.$forceUpdate()
        this.rerenderFlag = false
        setTimeout(() => {
          this.rerenderFlag = true 
        }, 100)
      }
    }
  },
  methods: {
    onSelectTime(e) {
      // console.log('Vue handle onSelectTime')
      // console.log(e.detail)
    },
    onSelectPrevView() {
      // console.log('Vue handle onSelectPrevView')
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
  height: 80px;
  border-bottom: 1px solid #f1f1f1;
}

* {
  box-sizing: border-box;
}

header h1 {
  display: block;
  float: left;
  margin-top: 10px;
  margin-left: 1em;
}

.platform-logo {
  float: left;
  max-height: 60px;
}

.demo-box {
  display: block;
  float: left;
  min-height: calc(100vh - 80px);
  width: 20%;
  padding: 0;
  padding-top: 20px;
  margin: 0;
}

.config-area {
  display: block;
  float: left;
  width: 80%;
  padding:0 20px 20px 20px;
  margin: 0;
  background: rgba(250, 250, 250, 0.8);
  padding-bottom: 20px;
  overflow: auto;
  max-height: calc(100vh - 80px);
}

h4 {
  display: block;
  width: 100%;
  float: left;
  margin-top: 1.2em;
}

.config-selector-element {
  display: block;
  width: 100%;
  float: left;
  border-bottom: 1px solid #cccccc;
  padding-bottom: 10px;
}


label {
  display: block;
  float: left;
  width: 20%;
  max-width: 200px;
  margin-top: 10px;
}

input,
select {
  display: block;
  float: left;
  width: 250px;
  height: 38px;
  margin-top: 10px;
  margin-bottom: 20px;
  background: #fff;
  font-size: 1.1em;
}

.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.switch input {
  display: none;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: .1s;
  transition: .1s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  -webkit-transition: .1s;
  transition: .1s;
  border-radius: 34px;
}

input:checked + .slider {
  background-color: #00A693;
}

input:focus + .slider {
  box-shadow: 0 0 1px #2196F3;
}

input:disabled + .slider {
  opacity: 0.4;
}

input:checked + .slider:before {
  -webkit-transform: translateX(26px);
  -ms-transform: translateX(26px);
  transform: translateX(26px);
}

</style>
