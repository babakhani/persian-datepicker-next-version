<svelte:options accessors={true} immutable={true} />

{#if isVisible && $config.overlay}
	<div class="pwt-datepicker-overlay-bg"></div>
{/if}

{#if isVisible}
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
					<div>
						<YearView
							on:select="{onSelectYear}"
							viewUnix="{$viewUnix}"
							selectedUnix="{$selectedUnix}" />
					</div>
				{/if}
				{#if $privateViewMode === 'month' && $config.monthPicker.enabled}
					<div>
						<MonthView
							on:select="{onSelectMonth}"
							viewUnix="{$viewUnix}"
							selectedUnix="{$selectedUnix}" />
					</div>
				{/if}
				{#if $privateViewMode === 'day' && $config.dayPicker.enabled}
					<div>
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
				viewMode="{$privateViewMode}"/>
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
	import { createEventDispatcher, setContext } from 'svelte'
	import { writable, get } from 'svelte/store'
	import lodash from 'lodash'

	import PersianDateParser from './parser'
	import {mergeOptionsWithDefaultConfig, getInitialValue, persianDateToUnix, getHourMinuteSecond } from './helpers.js'

	import YearView from './components/YearView.svelte'
	import MonthView from './components/MonthView.svelte'
	import DateView from './components/DateView.svelte'
	import TimeView from './components/TimeView.svelte'
	import Navigator from './components/Navigator.svelte'
	import Infobox from './components/Infobox.svelte'
	import Toolbox from './components/Toolbox.svelte'
	import Input from './components/Input.svelte'

	// Plugin Options
	export let options = {}
	export let model = null
	export let originalContainer = null

	// Merge config
	options = mergeOptionsWithDefaultConfig(options)

	// Get Initial Value
	let initialDate = getInitialValue(originalContainer)
  
	// Reactive Context
	const privateViewMode = new writable(options.viewMode)
	const config = new writable(options)
	const isDirty = new writable(null)
	const selectedUnix = new writable(initialDate)
	const viewUnix = new writable(initialDate)
	const dateObject = new writable(persianDate)
	const actions = {
		setDate (unix) {
			this.updateIsDirty(true)
			viewUnix.set(unix)
			selectedUnix.set(unix)
		},
		parsInitialValue (inputString) {
			let pd = get(dateObject)
			let parse = new PersianDateParser()
			if (parse.parse(inputString) !== undefined) {
				pd.toCalendar(get(config).initialValueType)
				let unix = new pd(parse.parse(inputString))
				this.updateIsDirty(true)
				viewUnix.set(unix.valueOf())
				this.setSelectedDate(unix)
				pd.toCalendar(get(config).calendarType)
			}
		},
		setFromDefaultValue (data) {
			this.parsInitialValue(data)
		},
		onSetCalendar (payload) {
			config.set({
				...get(config),
				calendarType: payload
			})
			let currentLocale = get(config).calendar[payload].locale
			let obj = persianDate
			obj.toCalendar(payload)
			obj.toLocale(currentLocale)
			obj.toLeapYearMode(get(config).calendar.persian.leapYearMode)
			dateObject.set( obj )
			viewUnix.set(get(selectedUnix))
		},
		setConfig (payload) {
			config.set(payload)
			this.onSetCalendar(get(config).calendarType)
			if (payload.onlyTimePicker) {
				this.setViewMode('time')
			} else {
				this.setViewMode(payload.viewMode)
			}
		},
		onSelectTime (pDate) {
			const pd = get(dateObject)
			const date = pDate.detail
			const { hour, minute, second } = getHourMinuteSecond(date)
			const calced = new pd(get(selectedUnix)).hour(hour).minute(minute).second(second)
			this.updateIsDirty(true)
			this.setSelectedDate(calced)
		},
		onSelectDate(pDate) {
			const pd = get(dateObject)
			const { hour, minute, second } = getHourMinuteSecond(get(selectedUnix))
			const date = new pd(pDate)
			const cashedDate = date.date()
			const cashedMonth = date.month()
			const cashedYear = date.year()
			date
				.hour(hour)
				.minute(minute)
				.second(second)
				.date(cashedDate)
				.month(cashedMonth)
				.year(cashedYear)
			this.setSelectedDate(date)
			this.updateIsDirty(true)
		},
		setSelectedDate(pDate) {
			const pd = get(dateObject)
			const unix = new pd(pDate).valueOf()
			selectedUnix.set(unix)
			this.setViewModeToLowerAvailableLevel()
			get(config).onSelect(unix)
		},
		onSelectMonth(month) {
			const pd = get(dateObject)
			viewUnix.set(
				new pd(get(viewUnix))
				.month(month)
				.valueOf()
			)
			if (!get(config).onlySelectOnDate) {
				this.setSelectedDate(
					new pd(get(viewUnix))
					.month(month)
				)
			} else {
				this.setViewModeToLowerAvailableLevel()
			}
			this.updateIsDirty(true)
		},
		onSelectYear(year) {
			const pd = get(dateObject)
			viewUnix.set(
				new pd(get(selectedUnix))
				.year(year)
				.valueOf()
			)
			if (!get(config).onlySelectOnDate) {
				this.setSelectedDate(
					new pd(get(selectedUnix))
					.year(year)
				)
			} else {
				this.setViewModeToLowerAvailableLevel()
			}
			this.updateIsDirty(true)
		},
		onSetHour(hour) {
			const pd = get(dateObject)
			this.setSelectedDate(
				new pd(get(selectedUnix))
				.hour(hour)
			)
			this.updateIsDirty(true)
		},
		onSetMinute(minute) {
			const pd = get(dateObject)
			this.setSelectedDate(
				new pd(get(selectedUnix))
				.minute(minute)
			)
			this.updateIsDirty(true)
		},
		setSecond(second) {
			const pd = get(dateObject)
			this.setSelectedDate(
				new pd(get(selectedUnix))
				.second(second)
			)
		},
		setViewMode(mode) {
			let conf = get(config)
			config.set(lodash.merge(conf, {
				viewMode: mode
			}))
			privateViewMode.set(mode)
		},
		setViewModeToUpperAvailableLevel() {
			let currentViewMode = get(privateViewMode)
			let $config = get(config)
			if (currentViewMode === 'time') {
				if ($config.dayPicker.enabled) {
					this.setViewMode('day')
				} else if ($config.monthPicker.enabled) {
					this.setViewMode('month')
				} else if ($config.yearPicker.enabled) {
					this.setViewMode('year')
				}
			} else if (currentViewMode === 'day') {
				if ($config.monthPicker.enabled) {
					this.setViewMode('month')
				} else if ($config.yearPicker.enabled) {
					this.setViewMode('year')
				}
			} else if (currentViewMode === 'month') {
				if ($config.yearPicker.enabled) {
					this.setViewMode('year')
				}
			}
		},
		setViewModeToLowerAvailableLevel() {
			let currentViewMode = get(privateViewMode)
			let $config = get(config)
			if (currentViewMode === 'year') {
				if ($config.monthPicker.enabled) {
					this.setViewMode('month')
				} else if ($config.dayPicker.enabled) {
					this.setViewMode('day')
				} else if ($config.timePicker.enabled) {
					this.setViewMode('time')
				}
			} else if (currentViewMode === 'month') {
				if ($config.dayPicker.enabled) {
					this.setViewMode('day')
				} else if ($config.timePicker.enabled) {
					this.setViewMode('time')
				}
			} else if (currentViewMode === 'day') {
				if ($config.timePicker.enabled && $config.timePicker.showAsLastStep) {
					this.setViewMode('time')
				}
			}
		},
		updateIsDirty(value) {
			isDirty.set(value)
		},
		onSelectNextView() {
			if (get(privateViewMode) === 'day') {
				viewUnix.set(persianDateToUnix(new persianDate(get(viewUnix)).add('month', 1)))
			}
			if (get(privateViewMode) === 'month') {
				viewUnix.set(persianDateToUnix(new persianDate(get(viewUnix)).add('year', 1)))
			}
			if (get(privateViewMode) === 'year') {
				viewUnix.set(persianDateToUnix(new persianDate(get(viewUnix)).add('year', 12)))
			}
		},
		onSelectPrevView() {
			if (get(privateViewMode) === 'day') {
				viewUnix.set(persianDateToUnix(new persianDate(get(viewUnix)).subtract('month', 1)))
			}
			if (get(privateViewMode) === 'month') {
				viewUnix.set(persianDateToUnix(new persianDate(get(viewUnix)).subtract('year', 1)))
			}
			if (get(privateViewMode) === 'year') {
				viewUnix.set(persianDateToUnix(new persianDate(get(viewUnix)).subtract('year', 12)))
			}
		},
		onSelectToday() {
			viewUnix.set(persianDateToUnix(new persianDate().startOf('day')))
		}
	}

  setContext('privateViewMode',privateViewMode) 
  setContext('config',config) 
  setContext('selectedUnix',selectedUnix) 
  setContext('viewUnix',viewUnix) 
  setContext('dateObject',dateObject) 
  setContext('actions',actions) 

	actions.setConfig(options)

	let plotarea
	let inputComp
	let isVisible = false

	// Public props used in adapters
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
			!(plotarea && plotarea.contains(e.target) 
			|| 
			e.target == originalContainer 
			|| 
			e.target.className === 'pwt-date-navigator-button'
			|| 
			e.target.className === 'pwt-date-toolbox-button'
			)) {
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
			if (!$config.inline && isVisible) {
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
