<div class="pwt-datepicker" >
	<button on:click={today} > Today </button>
	<button on:click={navNext} > Next </button>
	<button on:click={navPrev} > Prev </button>
	<Navigator
	   bind:currentUnix={currentUnix} />
	<br/>
	<YearView
       on:select="{ onSelectYear }"
	   bind:currentUnix={currentUnix} />
	<br/>
	<MonthView
       on:select="{ onSelectMonth }"
	   bind:currentUnix={currentUnix} />
	<br/>
	<TimeView
	   bind:currentUnix={currentUnix} />
	<br/>
	<DateView 
       on:selectDate="{ onSelectDate }"
	   bind:todayUnix={todayUnix}
	   bind:selectedUnix={currentUnix}
	   bind:currentUnix={currentUnix} />
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

    import { time, elapsed, countable } from './stores.js'
	// Public props
    export let options

    // Merge default options with given options
    if (!options) {
      //options = Options
    } else {
      //options = Object.assign(Options, options)
	}

	let currentDate =  new persianDate()
	let currentUnix = currentDate.unix() * 1000
	let todayUnix =  new persianDate().unix() * 1000

    // Public events
    const dispatch = createEventDispatcher()
    const dispatcher = function(input) {
      if (options[input]) {
        return event => options[input](event)
      } else {
        return event => dispatch(input, event)
      }
	}

    const onSelectDate = function (payload) {
		console.log('on select date')
		console.log(payload.detail.payload)
		currentDate = payload.detail.payload
	    currentUnix = currentDate.unix() * 1000
       //dispatcher('onSampleEvent')()
	}

    const onSelectMonth = function (payload) {
		console.log('on select month')
		console.log(payload)
		currentDate = currentDate.month(payload.detail.payload)
	    currentUnix = currentDate.unix() * 1000
       //dispatcher('onSelectYear')()
	}

    const onSelectYear = function (payload) {
		console.log('on select year')
		console.log(payload.detail.payload)
		currentDate = currentDate.year(payload.detail.payload)
	    currentUnix = currentDate.unix() * 1000
       //dispatcher('onSelectYear')()
	}

	let navNext = () => {
		currentDate = currentDate.add('month', 1)
	    currentUnix = currentDate.unix() * 1000
	}

	let today = () => {
	    currentUnix = new persianDate()
	}

	let navPrev = () => {
		currentDate = currentDate.subtract('month', 1)
	    currentUnix = currentDate.unix() * 1000
	 }
</script>

<style>
	body {
        font-size: 12px;
	 }
	*{
   direction: rtl;
	}
	td {
	width: 40px;
	height: 80px;
      padding: 2em;
	}
</style>

