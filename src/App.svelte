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
	import { setContext } from 'svelte'
	import { fade } from 'svelte/transition'
	import YearView from './components/YearView.svelte'
	import MonthView from './components/MonthView.svelte'
	import DateView from './components/DateView.svelte'
	import TimeView from './components/TimeView.svelte'
	import Navigator from './components/Navigator.svelte'
	import Infobox from './components/Infobox.svelte'
	import Toolbox from './components/Toolbox.svelte'
	import Input from './components/Input.svelte'
	import Defaultconfig from './config.js'
	import { createEventDispatcher } from 'svelte'
	import lodash from 'lodash'
	import PersianDateParser from './parser'
	import { persianDateToUnix, getHourMinuteSecond } from './helpers.js'
	import { writable, get } from 'svelte/store'
   
	const defaultconfig = Defaultconfig()

	const nowUnix = persianDateToUnix(new persianDate())
	const _config = new writable(defaultconfig)
	const _isDirty = new writable(false)
	const _selectedUnix = new writable(nowUnix)
	const _viewUnix = new writable(nowUnix)
	const _privateViewMode = new writable('day')
	const _dateObject = new writable(persianDate)
	const _actions = {
		setDate (unix) {
			this.updateIsDirty(true)
			_viewUnix.set(unix)
			_selectedUnix.set(unix)
		},
		parsInitialValue (inputString) {
			let pd = get(_dateObject)
			let parse = new PersianDateParser()
			if (parse.parse(inputString) !== undefined) {
				pd.toCalendar(get(_config).initialValueType)
				let unix = new pd(parse.parse(inputString))
				this.updateIsDirty(true)
				_viewUnix.set(unix.valueOf())
				this.setSelectedDate(unix)
				pd.toCalendar(get(_config).calendarType)
			}
		},
		setFromDefaultValue (data) {
			this.parsInitialValue(data)
		},
		onSetCalendar (payload) {
			_config.set({
				...get(_config),
				calendarType: payload
			})
			let currentLocale = get(_config).calendar[payload].locale
			let obj = persianDate
			obj.toCalendar(payload)
			obj.toLocale(currentLocale)
			obj.toLeapYearMode(get(_config).calendar.persian.leapYearMode)
			_dateObject.set( obj )
			_viewUnix.set(get(_selectedUnix))
		},
		setConfig (payload) {
			_config.set(payload)
			this.onSetCalendar(get(_config).calendarType)
			if (payload.onlyTimePicker) {
				this.setViewMode('time')
			} else {
				this.setViewMode(payload.viewMode)
			}
		},
		updateConfig (key) {
			let ob = {}
			ob[key[0]] = key[1] 
			let conf = JSON.stringify(get(_config))
			conf = JSON.parse(conf)
			conf[key[0]] = key[1]
			_config.update(() => {
				return {
					...get(_config),
					...ob
				}
			})
			this.onSetCalendar(get(_config).calendarType)
		},
		onSelectTime (pDate) {
			const pd = get(_dateObject)
			const date = pDate.detail
			const { hour, minute, second } = getHourMinuteSecond(date)
			const calced = new pd(get(_selectedUnix)).hour(hour).minute(minute).second(second)
			this.updateIsDirty(true)
			this.setSelectedDate(calced)
		},
		onSelectDate(pDate) {
			const pd = get(_dateObject)
			const { hour, minute, second } = getHourMinuteSecond(get(_selectedUnix))
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
			const pd = get(_dateObject)
			const unix = new pd(pDate).valueOf()
			_selectedUnix.set(unix)
			this.setViewModeToLowerAvailableLevel()
			get(_config).onSelect(unix)
		},
		onSelectMonth(month) {
			const pd = get(_dateObject)
			_viewUnix.set(
				new pd(get(_viewUnix))
				.month(month)
				.valueOf()
			)
			if (!get(_config).onlySelectOnDate) {
				this.setSelectedDate(
					new pd(get(_viewUnix))
					.month(month)
				)
			} else {
				this.setViewModeToLowerAvailableLevel()
			}
			this.updateIsDirty(true)
		},
		onSelectYear(year) {
			const pd = get(_dateObject)
			_viewUnix.set(
				new pd(get(_selectedUnix))
				.year(year)
				.valueOf()
			)
			if (!get(_config).onlySelectOnDate) {
				this.setSelectedDate(
					new pd(get(_selectedUnix))
					.year(year)
				)
			} else {
				this.setViewModeToLowerAvailableLevel()
			}
			this.updateIsDirty(true)
		},
		onSetHour(hour) {
			const pd = get(_dateObject)
			this.setSelectedDate(
				new pd(get(_selectedUnix))
				.hour(hour)
			)
			this.updateIsDirty(true)
		},
		onSetMinute(minute) {
			const pd = get(_dateObject)
			this.setSelectedDate(
				new pd(get(_selectedUnix))
				.minute(minute)
			)
			this.updateIsDirty(true)
		},
		setSecond(second) {
			const pd = get(_dateObject)
			this.setSelectedDate(
				new pd(get(_selectedUnix))
				.second(second)
			)
		},
		setViewMode(mode) {
			let conf = get(_config)
			_config.set(lodash.merge(conf, {
				viewMode: mode
			}))
			_privateViewMode.set(mode)
		},
		setViewModeToUpperAvailableLevel() {
			let currentViewMode = get(_privateViewMode)
			let $_config = get(_config)
			if (currentViewMode === 'time') {
				if ($_config.dayPicker.enabled) {
					this.setViewMode('day')
				} else if ($_config.monthPicker.enabled) {
					this.setViewMode('month')
				} else if ($_config.yearPicker.enabled) {
					this.setViewMode('year')
				}
			} else if (currentViewMode === 'day') {
				if ($_config.monthPicker.enabled) {
					this.setViewMode('month')
				} else if ($_config.yearPicker.enabled) {
					this.setViewMode('year')
				}
			} else if (currentViewMode === 'month') {
				if ($_config.yearPicker.enabled) {
					this.setViewMode('year')
				}
			}
		},
		setViewModeToLowerAvailableLevel() {
			let currentViewMode = get(_privateViewMode)
			let $_config = get(_config)
			if (currentViewMode === 'year') {
				if ($_config.monthPicker.enabled) {
					this.setViewMode('month')
				} else if ($_config.dayPicker.enabled) {
					this.setViewMode('day')
				} else if ($_config.timePicker.enabled) {
					this.setViewMode('time')
				}
			} else if (currentViewMode === 'month') {
				if ($_config.dayPicker.enabled) {
					this.setViewMode('day')
				} else if ($_config.timePicker.enabled) {
					this.setViewMode('time')
				}
			} else if (currentViewMode === 'day') {
				if ($_config.timePicker.enabled && $_config.timePicker.showAsLastStep) {
					this.setViewMode('time')
				}
			}
		},
		updateIsDirty(value) {
			_isDirty.set(value)
		},
		onSelectNextView() {
			if (get(_privateViewMode) === 'day') {
				_viewUnix.set(persianDateToUnix(new persianDate(get(_viewUnix)).add('month', 1)))
			}
			if (get(_privateViewMode) === 'month') {
				_viewUnix.set(persianDateToUnix(new persianDate(get(_viewUnix)).add('year', 1)))
			}
			if (get(_privateViewMode) === 'year') {
				_viewUnix.set(persianDateToUnix(new persianDate(get(_viewUnix)).add('year', 12)))
			}
		},
		onSelectPrevView() {
			if (get(_privateViewMode) === 'day') {
				_viewUnix.set(persianDateToUnix(new persianDate(get(_viewUnix)).subtract('month', 1)))
			}
			if (get(_privateViewMode) === 'month') {
				_viewUnix.set(persianDateToUnix(new persianDate(get(_viewUnix)).subtract('year', 1)))
			}
			if (get(_privateViewMode) === 'year') {
				_viewUnix.set(persianDateToUnix(new persianDate(get(_viewUnix)).subtract('year', 12)))
			}
		},
		setViewUnix(pDate) {
			_viewUnix.set(persianDateToUnix(pDate))
		},
		onSelectToday() {
			_viewUnix.set(persianDateToUnix(new persianDate().startOf('day')))
		}
	}

  setContext('config',_config) 
  setContext('actions',_actions) 
  setContext('selectedUnix',_selectedUnix) 
  setContext('viewUnix',_viewUnix) 
  setContext('privateViewMode',_privateViewMode) 
  setContext('dateObject',_dateObject) 

  const config = _config
  const actions = _actions
  const selectedUnix = _selectedUnix
  const viewUnix = _viewUnix
  const privateViewMode = _privateViewMode
  const dateObject = _dateObject

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
