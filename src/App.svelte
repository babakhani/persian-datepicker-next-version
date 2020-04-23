{#if isVisbile}
	<div 
		bind:this={plotarea}
		on:wheel={handleWheel}
		class="pwt-datepicker">
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
					viewMode="{$viewMode}"
					viewUnix="{$viewUnix}"
					selectedUnix="{$selectedUnix}" />
			{/if}
			<div
				class="pwt-datepicker-picker-section">
				{#if !$config.onlyTimePicker}
					{#if $viewMode === 'year' && $config.yearPicker.enabled}
						<div
							transition:fade={{duration: 0}}>
							<YearView
								on:select="{onSelectYear}"
								viewUnix="{$viewUnix}"
								selectedUnix="{$selectedUnix}" />
						</div>
					{/if}
					{#if $viewMode === 'month' && $config.monthPicker.enabled}
						<div
							transition:fade={{duration: 0}}>
							<MonthView
								on:select="{onSelectMonth}"
								viewUnix="{$viewUnix}"
								selectedUnix="{$selectedUnix}" />
						</div>
					{/if}
					{#if $viewMode === 'date' && $config.dayPicker.enabled}
						<div
							transition:fade={{duration: 0}}>
							<DateView
								on:prev="{navPrev}"
								on:next="{navNext}"
								on:selectDate="{onSelectDate}"
								viewUnix="{$viewUnix}"
								selectedUnix="{$selectedUnix}"/>
						</div>
					{/if}
				{/if}
				{#if ($viewMode === 'time' && $config.timePicker.enabled) || $config.onlyTimePicker}
					<div
						in:fade={{duration: 500}}>
						<TimeView 
							on:selectTime="{onSelectTime}"
							selectedUnix="{$selectedUnix}" />
					</div>
				{/if}
			</div>
			{#if $config.toolbox.enabled}
			<Toolbox 
				on:setcalendar="{setcalendar}"
				on:selectmode="{setViewMode}"
				on:today="{today}"
				on:next="{navNext}"
				on:prev="{navPrev}"
				viewMode="{$viewMode}"
				viewUnix="{$viewUnix}"
				selectedUnix="{$selectedUnix}" />
		{/if}
	</div>
{/if}
	<Input 
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
	import { config, isOpen, actions, selectedUnix, viewUnix, viewMode } from './stores.js'


	// Public props used in adapters
	export let options = {}
	export let originalContainer = null


	// Handle global event and store events
	const dispatcher = function(input) {
		if (options[input]) {
			return event => options[input](event)
		} else {
			return event => {
				actions[input](event)
			}
		}
	}

	// merge user defined config with predefined config and commit to store
	if (!options) {
		options = defaultconfig
	} else {
		options = Object.assign(defaultconfig, options)
	}
	dispatcher('setConfig')(options)

	let plotarea
	let isVisbile = false


	// Methods that would called by component events
	const setvisibility = function(payload) {
		isVisbile = payload.detail
		setTimeout(() => {
			if (plotarea) {
				plotarea.style.display = isVisbile ? 'block' : 'none'
			}
		}, 0)
		if (isVisbile) {
		  $config.onShow()
		} else {
		  $config.onHide()
		}
	}

	// TODO: develop time
	setvisibility({detail: true})

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
	    setvisibility({detail: false})
		}
	}

	const onSelectTime = function(event) {
		dispatcher('onSelectTime')(event)
	}

	const onSelectMonth = function(event) {
		dispatcher('onSelectMonth')(event.detail)
		$config.monthPicker.onSelect(event.detail)
	}

	const onSelectYear = function(event) {
		dispatcher('onSelectYear')(event.detail)
		$config.yearPicker.onSelect(event.detail)
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

<style>
  @import './theme.scss';
</style>
