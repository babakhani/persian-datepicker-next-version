<div class="pwt-date-toolbox">
	{#if $config.timePicker.enabled && !$config.onlyTimePicker}
		{#if viewMode !== 'time'}
			<button 
				class="pwt-date-toolbox-button"
				on:click={() => setViewMode("time")}>
				Time
			</button>
		{/if}
		{#if viewMode === 'time'}
			<button 
				class="pwt-date-toolbox-button"
				on:click={() => setViewMode("day")}>
				Date
			</button>
		{/if}
	{/if}
	{#if $config.toolbox.todayButton.enabled}
	<button 
	  class="pwt-date-toolbox-button"
		on:click="{today}">
		Today
	</button>
	{/if}
	{#if $config.toolbox.calendarSwitch.enabled}
		{#if $config.calendarType === 'persian'}
			<button 
				class="pwt-date-toolbox-button"
				on:click="{() => setcalendar('gregorian')}">
				gregorian
			</button>
		{/if}
		{#if $config.calendarType === 'gregorian'}
			<button 
				class="pwt-date-toolbox-button"
				on:click="{() => setcalendar('persian')}">
				Jalali
			</button>
		{/if}
	{/if}
	{#if $config.toolbox.submitButton.enabled}
	<button 
	  class="pwt-date-toolbox-button"
		on:click="{() => {alert('Please implement submit button')}}">
	   Submit	
	</button>
	{/if}
</div>

<script>
  import { createEventDispatcher } from 'svelte'
	import { config  } from '../stores.js'

	export let viewUnix
	export let viewMode

  const dispatch = createEventDispatcher()

	function setViewMode(payload) { dispatch('selectmode', payload) }
	function setcalendar(payload) { dispatch('setcalendar', payload) }
  function today(payload) { dispatch('today', payload) }
  function next(payload) { dispatch('next', payload) }
  function prev(payload) { dispatch('prev', payload) }

  $: selectedYear = new persianDate(viewUnix).year()
  $: selectedMonth = new persianDate(viewUnix).format('MMMM')

  let yearRange
  let startYear
  $: {
    yearRange = []
    startYear = selectedYear - (selectedYear % 12)
    let i = 0
    while (i < 12) {
      yearRange.push(startYear + i)
      i++
    }
  }
</script>

<style global lang="scss">
  @import './theme.scss';
  .pwt-date-toolbox {
		height: 40px;
    line-height: 40px;
		border: 0;
		marign: -9px;
		button {
			display: block;
			width: 25%;
			float: left;
			padding: 0;
			margin: 0;
			background: transparent;
			border: 0;
			height: 100%;
			cursor: pointer;
			&:hover {
        background: #f1f1f1;
			}
		}
	}
</style>
