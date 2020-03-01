<div class="pwt-datepicker">
  <button on:click="{today}">Today</button>
  <button on:click="{navNext}">Next</button>
  <button on:click="{navPrev}">Prev</button>
  <!-- navigator -->
  <Navigator {selectedUnix} />
  <br />
  <!-- year view -->
  <YearView
    on:select="{onSelectYear}"
    currentViewUnix="{selectedUnix}"
    {selectedUnix} />
  <br />
  <!-- month view -->
  <MonthView
    on:select="{onSelectMonth}"
    currentViewUnix="{selectedUnix}"
    {selectedUnix} />
  <br />
  <!-- time view -->
  <TimeView {selectedUnix} />
  <br />
  <!-- date view -->
  <DateView
    on:selectDate="{onSelectDate}"
    {todayUnix}
    {selectedUnix}
    {viewUnix} />
</div>

<script>
  import { createEventDispatcher } from 'svelte'
  import persianDate from 'persian-date'
  import YearView from './components/YearView.svelte'
  import MonthView from './components/MonthView.svelte'
  import DateView from './components/DateView.svelte'
  import TimeView from './components/TimeView.svelte'
  import Navigator from './components/Navigator.svelte'
  import config from './config.js'
  import { actions, selectedUnix, viewUnix } from './stores.js'

  // Public props
  export let options = {}

  // Merge default options with given options
  if (!options) {
    //options = Options
  } else {
    //options = Object.assign(Options, options)
  }

  // Public events
  const dispatch = createEventDispatcher()
  const dispatcher = function(input) {
    if (options[input]) {
      return event => options[input](event)
    } else {
      return event => {
        actions[input](event.detail.payload)
      }
    }
  }

  const onSelectDate = function(payload) {
    dispatcher('onSelectDate')(payload)
  }

  const onSelectMonth = function(payload) {
    console.log('on select month in app')
    currentDate = currentDate.month(payload.detail.payload)
    dispatcher('onSelectMonth')(payload)
  }

  const onSelectYear = function(payload) {
    dispatcher('onSelectYear')(payload)
  }

  let navNext = () => {
    currentDate = currentDate.add('month', 1)
    //selectedUnix = currentDate.unix() * 1000
  }

  let today = () => {
    currentDate = new persianDate()
  }

  let navPrev = () => {
    currentDate = currentDate.subtract('month', 1)
    //selectedUnix = currentDate.unix() * 1000
  }
</script>

<style>
  body {
    font-size: 12px;
  }
  * {
    direction: rtl;
  }
  td {
    width: 40px;
    height: 80px;
    padding: 2em;
  }
</style>
