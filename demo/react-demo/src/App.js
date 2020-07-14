import React from 'react'
import logo from './logo.svg'
import './App.css'
import ConfigSelect from './Select'
import ConfigSwitch from './Switch'
import ConfigText from './Text'
import SveltePlugin from './zerounip-react.js'
import Styles from './zerounip.css'
export default class TodoApp extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      animate: true,
      animateSpeed: 80,
      calendarType: 'persian',
      calendar: {
        persian: {
          locale: 'fa', // DONE
          showHint: false, // DONE
          leapYearMode: 'algorithmic' // "astronomical" // DONE
        },
        gregorian: {
          locale: 'en', // DONE
          showHint: false  // DONE
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
      altFormat: 'u', // DONE
      altFieldFormatter: function (unixDate, dateObject) {
        if (this.altFormat === 'gregorian' || this.altFormat === 'g') {
          return new Date(unixDate)
        } else if (this.altFormat === 'unix' || this.altFormat === 'u') {
          return unixDate
        } else {
          return new dateObject(unixDate).format(this.altFormat);
        }
      }, // DONE
      minDate: '', // DONE
      maxDate: '', // DONE,
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
      ocheckDate: function (unix) { // DONE
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
        'titleFormat': 'YYYY MMMM',
        'titleFormatter': function (unix, dateObject) {
          return new dateObject(unix).format(this.titleFormat)
        },
        'hour': {
          'enabled': true, // DONE
          'step': '' // DONE
        },
        'minute': {
          'enabled': true, // DONE
          'step': '' // DONE
        },
        'second': {
          'enabled': true, // DONE
          'step': '' // DONE
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
      inputDelay: 800, // DEPRECATEDnlySelectOnDate: true,
      navigatorEnabled: true,
      selectedDate: new Date().valueOf()
    }
  }
  handleChange (key, event) {
    let targetValue = null
    if (event.target.type === 'checkbox') {
      targetValue = event.target.checked
    } else {
      targetValue = event.target.value
    }
    this.setState({
      [key]: targetValue
    })
  }
  handleNestedChange (pathArray, event) {
    let targetValue = null
    if (event.target.type === 'checkbox') {
      targetValue = event.target.checked
    } else {
      targetValue = event.target.value
    }
    let result = targetValue 
    pathArray.map(item =>  {
      result = {
        [item]: result 
      }
    })
    this.setState(result)
  }
  render() {
    const logoStyle = {
      maxWidth: '60px'
    }

    return (
     <div className="App">
      <header>
        <img 
         className="platform-logo"
         style={logoStyle}
         src={logo}
        />
        <h1>
          Persian Datepicker, React Demo
        </h1>
      </header>
      <div
        className="demo-box"
      >
        <h5>{ this.state.selectedDate }</h5>
        <input
          value={this.state.selectedDate}
          type="range"
          min="0"
          max="1589052600000"
          step="10"
          onChange={(e) => this.handleChange('selectedDate', e)}
        />
        <SveltePlugin
          options={this.state}
          value={this.state.selectedDate}
          animate={this.state.animate}
          animateSpeed={this.state.animateSpeed}
          viewMode={this.state.viewMode}
          inline={this.state.inline}
          autoClose={this.state.autoClose}
          onlyTimePicker={this.state.onlyTimePicker}
          onlySelectOnDate={this.state.onlySelectOnDate}
          position={this.state.position}
          format={this.state.format}
          altFormat={this.state.altFormat}
          minDate={this.state.minDate}
          maxDate={this.state.maxDate}
          observer={this.state.observer}
          calendarType={this.state.calendarType}
        />
      </div>
      <div
        className="config-area"
      >
        <h3>Settings</h3>
        <h4>General</h4>
        <ConfigSwitch
          label="Animte"
          selectValue={this.state.animate}
          onChange={(e) => this.handleChange('animate', e)}
        />
        <ConfigSelect
          label="Animate Speed"
          options={[
            { label: '80ms', value: 80 },
            { label: '100ms', value: 100 },
            { label: '200ms', value: 200 },
            { label: '500ms', value: 500 },
          ]}
          selectValue={this.state.animateSpeed}
          onChange={(e) => this.handleChange('animateSpeed', e)}
        />
        <ConfigSelect
          label="viewMode"
          help="Default view mode, Acceptable value: 'day', 'month', 'year'"
          options={[
            { label: 'day', value: 'day' },
            { label: 'month', value: 'month' },
            { label: 'year', value: 'year' }
          ]}
          selectValue={this.state.viewMode}
          onChange={(e) => this.handleChange('viewMode', e)}
        />
        <ConfigSwitch
          label='Inline'
          help="if true datepicker render inline"
          selectValue={this.state.inline}
          onChange={(e) => this.handleChange('inline', e)}
        />
        <ConfigSwitch
          label="Auto Close"
          help="If true picker close When select a date"
          selectValue={this.state.autoClose}
          onChange={(e) => this.handleChange('autoClose', e)}
        />
        <ConfigSwitch
          label="Only Timepicker"
          help="if true all pickers hide and just show timepicker"
          selectValue={this.state.onlyTimePicker}
          onChange={(e) => this.handleChange('onlyTimePicker', e)}
        />
        <ConfigSwitch
          label="Only Select on Date"
          help="if true date select just by click on day in month grid, and when user select month or year selected date doesnt change"
          selectValue={this.state.onlySelectOnDate}
          onChange={(e) => this.handleChange('onlySelectOnDate', e)}
        />
        <ConfigSelect
          label="Position"
          help="position of datepicker element relative to input element, accept auto, [x,y]"
          options={[
            { label: 'auto', value: 'auto' },
            { label: 'Offset 20', value: [20, 20] },
            { label: 'Offset -20', value: [-20, -20] },
          ]}
          selectValue={this.state.position}
          onChange={(e) => this.handleChange('position', e)}
        />
        <ConfigText
          label="Format"
          help="Default input value formatt string."
          selectValue={this.state.format}
          onChange={(e) => this.handleChange('format', e)}
        />
        <ConfigText
          label="Alt Format"
          help="Default input value formatt string."
          selectValue={this.state.altFormat}
          onChange={(e) => this.handleChange('altFormat', e)}
        />
        <ConfigSelect
          label="Min Date"
          help="Set min date on datepicker, prevent user select date before given unix time"
          options={[
            { label: '', value: '' },
            { label: '1 day', value: (new Date().valueOf() - (86400000 * 1))  },
            { label: '2 day', value: (new Date().valueOf() - (86400000 * 2))  },
            { label: '5 day', value: new Date().valueOf() - (86400000 * 5)  },
            { label: '30 day', value: new Date().valueOf() - (86400000 * 30)  },
          ]}
          selectValue={this.state.minDate}
          onChange={(e) => this.handleChange('minDate', e)}
        />
        <ConfigSelect
          label="Max Date"
          help="Set max date on datepicker, prevent user select date after given unix time"
          options={[
            { label: '', value: '' },
            { label: '1 day', value: new Date().valueOf() + 86400000 },
            { label: '2 day', value: (new Date().valueOf() + (86400000 * 2))  },
            { label: '5 day', value: new Date().valueOf() + (86400000 * 5)  },
            { label: '30 day', value: new Date().valueOf() + (86400000 * 30)  },
          ]}
          selectValue={this.state.maxDate}
          onChange={(e) => this.handleChange('maxDate', e)}
        />
        <ConfigSwitch
          label="Observer"
          help="if true datepicker update self by user inputted date string, accept 'yyyy/mm/dd' example: '1396/10/2', '1396/1/12'"
          selectValue={this.state.observer}
          onChange={(e) => this.handleChange('observer', e)}
        />
        <h4>Calendar</h4>
        <ConfigSelect
          label='Calendar Type'
          selectValue={this.state.calendarType}
          options={[
            { label: 'persian', value: 'persian' },
            { label: 'gregorian', value: 'gregorian'},
          ]}
          help="set default calendar mode of datepicker, available options: 'persian', 'gregorian'"
          onChange={(e) => this.handleChange('calendarType', e)}
        />
        <ConfigSwitch
          label="Show Hint In Persian"
          help="if set true, small date hint of this calendar will be shown on another calendar"
          selectValue={this.state.calendar.persian.showHint}
          onChange={(e) => this.handleNestedChange(['showHint', 'persian', 'calendar'], e)}
        />
        <ConfigSelect
          label="Locale In Persian"
          selectValue={this.state.calendar.persian.locale}
          options={[
            {label: 'Fa', value: 'fa'},
            {label: 'EN', value: 'en'}
          ]}
          help="set locale of calendar available options: 'fa', 'en'"
          onChange={(e) => this.handleNestedChange(['locale', 'persian', 'calendar'], e)}
        />
        <ConfigSelect
          label="Persian Leap year mode"
          selectValue={this.state.calendar.persian.locale}
          options={[
            {label: 'algorithmic', value: 'algorithmic'},
            {label: 'astronomical', value: 'astronomical'}
          ]}
          onChange={(e) => this.handleNestedChange(['locale', 'persian', 'calendar'], e)}
        />
        <ConfigSwitch
          label="Show Hint In Gregorian"
          help="if set true, small date hint of this calendar will be shown on another calendar"
          selectValue={this.state.calendar.gregorian.showHint}
          onChange={(e) => this.handleNestedChange(['showHint', 'gregorian', 'calendar'], e)}
        />
        <ConfigSelect
          label="Locale In Gregorian"
          selectValue={this.state.calendar.gregorian.locale}
          options={[
            {label: 'algorithmic', value: 'algorithmic'},
            {label: 'astronomical', value: 'astronomical'}
          ]}
          help="set locale of calendar available options: 'fa', 'en'"
          onChange={(e) => this.handleNestedChange(['locale', 'gregorian', 'calendar'], e)}
        />
        <h4>Day Picker</h4>
        <ConfigSwitch
          label="Day Picker Enabled"
          selectValue={this.state.dayPicker.enabled}
          onChange={(e) => this.handleNestedChange(['enabled', 'dayPicker'], e)}
        />
        <ConfigText
          label="Day Picker Title Format"
          selectValue={this.state.dayPicker.titleFormat}
          onChange={(e) => this.handleNestedChange(['titleFormat', 'dayPicker'], e)}
        />
        <h4>Month Picker</h4>
        <ConfigSwitch
          label="Month Picker Enabled"
          selectValue={this.state.monthPicker.enabled}
          onChange={(e) => this.handleNestedChange(['enabled', 'monthPicker'], e)}
        />
        <ConfigText
          label="Month Picker Title Format"
          selectValue={this.state.monthPicker.titleFormat}
          onChange={(e) => this.handleNestedChange(['titleFormat', 'monthPicker'], e)}
        />
        <h4>Year Picker</h4>
        <ConfigSwitch 
          label="Year Picker Enabled"
          selectValue={this.state.yearPicker.titleFormat}
          onChange={(e) => this.handleNestedChange(['titleFormat', 'yearPicker'], e)}
        />
        <ConfigText 
          label="Year Picker Title Format"
          selectValue={this.state.yearPicker.titleFormat}
          onChange={(e) => this.handleNestedChange(['titleFormat', 'yearPicker'], e)}
        />
        <h4>Time Picker</h4>
        <ConfigSwitch 
          label="Time Picker Enabled"
          selectValue={this.state.timePicker.enabled}
          onChange={(e) => this.handleNestedChange(['enabled', 'timePicker'], e)}
        />
        <ConfigSelect
          label="Time Picker Steps"
          selectValue={this.state.timePicker.step}
          options={[
            {label: '1', value: 1},
            {label: '5', value: 5}
          ]}
          onChange={(e) => this.handleNestedChange(['step', 'timePicker'], e)}
        />
        <ConfigText 
          label="Time Picker Title Format"
          selectValue={this.state.timePicker.titleFormat}
          onChange={(e) => this.handleNestedChange(['titleFormat', 'timePicker'], e)}
        />
        <ConfigSwitch 
          label="Time Picker Hour Enabled"
          selectValue={this.state.timePicker.hour.enabled}
          onChange={(e) => this.handleNestedChange(['enabled', 'hour', 'timePicker'], e)}
        />
        <ConfigSelect
          label="Time Picker Hour Steps"
          selectValue={this.state.timePicker.hour.step}
          options={[
            {label: '1', value: 1},
            {label: '5', value: 5}
          ]}
          onChange={(e) => this.handleNestedChange(['step', 'hour', 'timePicker'], e)}
        />
        <ConfigSwitch 
          label="Time Picker Minute Enabled"
          selectValue={this.state.timePicker.minute.enabled}
          onChange={(e) => this.handleNestedChange(['enabled', 'minute', 'timePicker'], e)}
        />
        <ConfigSelect
          label="Time Picker Minute Steps"
          selectValue={this.state.timePicker.minute.step}
          options={[
            {label: '1', value: 1},
            {label: '5', value: 5}
          ]}
          onChange={(e) => this.handleNestedChange(['step', 'minute', 'timePicker'], e)}
        />
        <ConfigSwitch 
          label="Time Picker Second Enabled"
          selectValue={this.state.timePicker.second.enabled}
          onChange={(e) => this.handleNestedChange(['enabled', 'second', 'timePicker'], e)}
        />
        <ConfigSelect
          label="Time Picker Second Steps"
          selectValue={this.state.timePicker.second.step}
          options={[
            {label: '1', value: 1},
            {label: '5', value: 5}
          ]}
          onChange={(e) => this.handleNestedChange(['step', 'second', 'timePicker'], e)}
        />
        <ConfigSwitch 
          label="Time Picker Meridian Enabled"
          selectValue={this.state.timePicker.meridian.enabled}
          onChange={(e) => this.handleNestedChange(['enabled', 'meridian', 'timePicker'], e)}
        />
        <h4>Toolbox</h4>
        <ConfigSwitch 
          label="Toolbox Enabled"
          selectValue={this.state.toolbox.enabled}
          onChange={(e) => this.handleNestedChange(['enabled', 'toolbox'], e)}
        />
        <ConfigSwitch 
          label="Today Button Enabled"
          selectValue={this.state.toolbox.todayButton.enabled}
          onChange={(e) => this.handleNestedChange(['enabled', 'todayButton', 'toolbox'], e)}
        />
        <ConfigSwitch 
          label="Calendar Switch Button Enabled"
          selectValue={this.state.toolbox.calendarSwitch.enabled}
          onChange={(e) => this.handleNestedChange(['enabled', 'calendarSwitch', 'toolbox'], e)}
        />
        <ConfigSwitch 
          label="Submit Button Enabled"
          selectValue={this.state.toolbox.submitButton.enabled}
          onChange={(e) => this.handleNestedChange(['enabled', 'submitButton', 'toolbox'], e)}
        />
        <h4>Navigator</h4>
        <ConfigSwitch 
          label="Navigator Enabled"
          selectValue={this.state.navigator.enabled}
          onChange={(e) => this.handleNestedChange(['enabled', 'navigator'], e)}
        />
        <ConfigSwitch 
          label="Navigat By Scroll Enabled"
          selectValue={this.state.navigator.scroll.enabled}
          onChange={(e) => this.handleNestedChange(['enabled', 'scroll', 'navigator'], e)}
        />
        <h4>Infobox</h4>
        <ConfigSwitch 
          label="Infobox Enabled"
          selectValue={this.state.infobox.enabled}
          onChange={(e) => this.handleNestedChange(['enabled', 'infobox'], e)}
        />
        <ConfigText 
          label="Infobox Title Format"
          selectValue={this.state.infobox.titleFormat}
          onChange={(e) => this.handleNestedChange(['titleFormat', 'infobox'], e)}
        />
        <ConfigText 
          label="Infobox Selected Date Format"
          selectValue={this.state.infobox.selectedDateFormat}
          onChange={(e) => this.handleNestedChange(['selectedDateFormat', 'infobox'], e)}
        />
      </div>
    </div>
    )
  }
}
