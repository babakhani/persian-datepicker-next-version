<svelte:options accessors={true} immutable={true} />
{#if isVisible}
	{#if $config.overlay}
		<div class="pwt-datepicker-overlay-bg"></div>
	{/if}
	<div 
		bind:this={plotarea}
		on:wheel={handleWheel}
		class="{ $config.overlay ? 'pwt-datepicker pwt-datepicker--overlay' :
		'pwt-datepicker' }">
		{#if $config.infobox.enabled}
			<Infobox
				viewUnix="{$viewUnix}"
				selectedUnix="{$selectedUnix}" />
		{/if}
		{#if $config.navigator.enabled}
			<Navigator 
				on:selectmode="{setViewModeToUpperAvailableLevel}"
				on:today="{today}"
				on:next="{navNext}"
				on:prev="{navPrev}"
				viewMode="{$privateViewMode}"
				viewUnix="{$viewUnix}"
				selectedUnix="{$selectedUnix}" />
		{/if}
		<div
			class="pwt-datepicker-picker-section">
			{#if !$config.onlyTimePicker}
				{#if $privateViewMode === 'year' && $config.yearPicker.enabled}
					<div
						transition:fade={{duration: animateSpeed}}>
						<YearView
							on:select="{onSelectYear}"
							viewUnix="{$viewUnix}"
							selectedUnix="{$selectedUnix}" />
					</div>
				{/if}
				{#if $privateViewMode === 'month' && $config.monthPicker.enabled}
					<div
						transition:fade={{duration: animateSpeed}}>
						<MonthView
							on:select="{onSelectMonth}"
							viewUnix="{$viewUnix}"
							selectedUnix="{$selectedUnix}" />
					</div>
				{/if}
				{#if $privateViewMode === 'day' && $config.dayPicker.enabled}
					<div
						transition:fade={{duration: animateSpeed}}>
						<DateView
							on:prev="{navPrev}"
							on:next="{navNext}"
							on:selectDate="{onSelectDate}"
							viewUnix="{$viewUnix}"
							selectedUnix="{$selectedUnix}"/>
					</div>
				{/if}
				{#if $privateViewMode === 'time'}
					<TimeView 
						on:selectTime="{onSelectTime}"
						selectedUnix="{$selectedUnix}" />
				{/if}
			{/if}
			{#if $config.onlyTimePicker}
				<TimeView 
					on:selectTime="{onSelectTime}"
					selectedUnix="{$selectedUnix}" />
			{/if}
		</div>
		{#if $config.toolbox.enabled}
			<Toolbox 
				on:setcalendar="{setcalendar}"
				on:selectmode="{setViewMode}"
				on:today="{today}"
				on:next="{navNext}"
				on:prev="{navPrev}"
				viewMode="{$privateViewMode}"
				viewUnix="{$viewUnix}"
				selectedUnix="{$selectedUnix}" />
		{/if}
	</div>
{/if}
<Input 
bind:this={inputComp}
on:setinitialvalue="{setInitialValue}"
on:setvisibility={setvisibility}
plotarea={plotarea} 
originalContainer={originalContainer} />

<script>
	import { fade } from 'svelte/transition';
	import YearView from './components/YearView.svelte'
	import MonthView from './components/MonthView.svelte'
	import DateView from './components/DateView.svelte'
	import TimeView from './components/TimeView.svelte'
	import Navigator from './components/Navigator.svelte'
	import Infobox from './components/Infobox.svelte'
	import Toolbox from './components/Toolbox.svelte'
	import Input from './components/Input.svelte'
	import defaultconfig from './config.js'
	import { config, actions, selectedUnix, viewUnix, privateViewMode, dateObject } from './stores.js'
	import { createEventDispatcher } from 'svelte'
	import lodash from 'lodash'

	let plotarea
	let inputComp
	let isVisible = false
	let animateSpeed = $config.animate ? $config.animateSpeed : 0

	// Public props used in adapters
	export let options = {}
	export let originalContainer = null
	export let model = null
	export const setDate = function(unix) {
		dispatcher('setDate')(unix)
  }	
	export const show = function() {
		setvisibility(true)
  }	
	export const hide = function() {
		setvisibility(false)
  }	
	export const toggle = function() {
		setvisibility(!isVisible)
  }	
	export const destroy = function() {
		if(plotarea.parentNode && plotarea.parentNode.removeChild) {
      plotarea.parentNode.removeChild(plotarea)
		}
	}	
	export const getState = function() {
		return {
			selected: $selectedUnix,
			view: $viewUnix,
      // Added In v2.0.0
			config: $config,
      // Added In v2.0.0
			dateObject: $dateObject
		}
	}
  // Added In v2.0.0
	export const setOptions = function (newOptions) {
	  dispatcher('setConfig')(lodash.merge($config, newOptions))
	}
  // Added In v2.0.0
	export const getOptions = function () {
	  return $config
	}

	const dispatch = createEventDispatcher()
	// Handle global event and store events
	const dispatcher = function(input) {
		return event => {
			dispatch(input, event)
			if (options[input]) {
				return event => options[input](event)
			} 
			if (actions[input]) {
				actions[input](event)
			}
		}
	}

  let cashedoptions = options
	if (!options) {
		options = defaultconfig
	} else {
		options = lodash.merge(defaultconfig, options)
	}
	dispatcher('setConfig')(options)
	$: {
		if (JSON.stringify(cashedoptions) !== JSON.stringify(options)) {
			if (!options) {
				options = defaultconfig
			} else {
				options = lodash.merge(defaultconfig, options)
			}
			dispatcher('setConfig')(options)
			cashedoptions = options
		}
	}
 
	// Update DAtepicker Via from reactivity models, like v-model
	let cashedSelectedDate = $selectedUnix
	if (model) {
		dispatcher('setDate')(parseInt(model))
		cashedSelectedDate = parseInt(model)
	}
	$: {
		if (model && model !== cashedSelectedDate) {
			dispatcher('setDate')(parseInt(model))
	    cashedSelectedDate = $selectedUnix
		}
	}

	const bodyListener = (e) => {
		if (
			plotarea && plotarea.contains(e.target) 
			|| 
			e.target == originalContainer 
			|| 
			e.target.className === 'pwt-date-navigator-button'
			|| 
			e.target.className === 'pwt-date-toolbox-button'
		) {

		} else {
			document.removeEventListener('click', bodyListener)
			setvisibility(false)
		}
	}

	// Methods that would called by component events
	const setvisibility = function(payload) {
		isVisible = payload
		if (inputComp) {
      inputComp.setPlotPostion()
		}
		document.removeEventListener('mousedown', bodyListener)
		setTimeout(() => {
			if (isVisible) {
				setTimeout(() => {
					document.addEventListener('mousedown', bodyListener)
				}, 100)
			}
			if (isVisible) {
				$config.onShow()
			} else {
				$config.onHide()
			}
		}, 150)
	}

	if ($config.inline) {
	  setvisibility(true)
	}

	const setInitialValue = function (event) {
		dispatcher('setFromDefaultValue')(event.detail)
	}

	const setViewMode = function(event) {
		dispatcher('setViewMode')(event.detail)
	}

	const setcalendar = function(event) {
		dispatcher('onSetCalendar')(event.detail)
		$config.toolbox.calendarSwitch.onSwitch(event)
	}

	const onSelectDate = function(event) {
		dispatcher('onSelectDate')(event.detail)
		$config.dayPicker.onSelect(event.detail)
		if ($config.autoClose)  {
	    setvisibility(false)
		}
		dispatcher('onSelect')($config.altFieldFormatter($selectedUnix, $dateObject))
	}

	const onSelectTime = function(event) {
		dispatcher('onSelectTime')(event)
		dispatcher('onSelect')($selectedUnix)
	}

	const onSelectMonth = function(event) {
		dispatcher('onSelectMonth')(event.detail)
		$config.monthPicker.onSelect(event.detail)
		dispatcher('onSelect')($selectedUnix)
	}

	const onSelectYear = function(event) {
		dispatcher('onSelectYear')(event.detail)
		$config.yearPicker.onSelect(event.detail)
		dispatcher('onSelect')($selectedUnix)
	}

	const today = event => {
		dispatcher('onSelectToday')(event)
		$config.toolbox.todayButton.onToday(event)
	}

	const navNext = event => {
		dispatcher('onSelectNextView')(event)
		$config.navigator.onNext(event)
	}

	const navPrev = event => {
		dispatcher('onSelectPrevView')(event)
		$config.navigator.onPrev(event)
	}

	const setViewModeToUpperAvailableLevel = event => {
		dispatcher('setViewModeToUpperAvailableLevel')()
		$config.navigator.onSwitch(event)
	}

 
	const handleWheel = (e) => {
		if ($config.navigator.scroll.enabled) {
			setTimeout(() => {
				if (e.deltaY > 0 || e.deltaX > 0) {
					navNext()
				}
				if (e.deltaY < 0 || e.deltaX < 0) {
					navPrev()
				}
			}, 1)
		}
	}
  

</script>

<style global lang="scss">
@import './theme.scss';
@import './layout.scss';
</style>
