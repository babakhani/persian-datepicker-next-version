<div class="pwt-datepicker">
  <button on:click="{today}">Today</button>
  <button on:click="{navNext}">Next</button>
  <button on:click="{navPrev}">Prev</button>
  <!-- navigator -->
  <Navigator selectedUnix="{$selectedUnix}" />
  <br />
  <!-- year view -->
  <YearView
    on:select="{onSelectYear}"
    viewUnix="{$viewUnix}"
    selectedUnix="{$selectedUnix}" />
  <br />
  <!-- month view -->
  <MonthView
    on:select="{onSelectMonth}"
    viewUnix="{$viewUnix}"
    selectedUnix="{$selectedUnix}" />
  <br />
  <!-- time view -->
  <TimeView selectedUnix="{$selectedUnix}" />
  <br />
  <!-- date view -->
  <DateView
    on:selectDate="{onSelectDate}"
    {todayUnix}
    selectedUnix="{$selectedUnix}"
    viewUnix="{$viewUnix}" />
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
  import { persianDateToUnix } from './helpers.js'
  import { actions, selectedUnix, viewUnix } from './stores.js'

  // Public props
  export let options = {}

  const todayUnix = persianDateToUnix(new persianDate())

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

  const onSelectDate = function(event) {
    dispatcher('onSelectDate')(event)
  }

  const onSelectMonth = function(event) {
    dispatcher('onSelectMonth')(event)
  }

  const onSelectYear = function(event) {
    dispatcher('onSelectYear')(event)
  }

  const navNext = event => {
    dispatcher('onSelectNextView')(event)
  }

  const today = event => {
    dispatcher('onSelectToday')(event)
  }

  const navPrev = event => {
    dispatcher('onSelectPrevView')(event)
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
