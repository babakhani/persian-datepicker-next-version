{#if isVisbile}
	<div 
		bind:this={plotarea}
		class="pwt-datepicker">
		<Infobox
			viewUnix="{$viewUnix}"
			selectedUnix="{$selectedUnix}" />
		<Navigator 
			on:selectmode="{setViewMode}"
			on:today="{today}"
			on:next="{navNext}"
			on:prev="{navPrev}"
			viewMode="{$viewMode}"
			viewUnix="{$viewUnix}"
			selectedUnix="{$selectedUnix}" />
		{#if $viewMode === 'year'}
			<div
				transition:fade={{duration: 0}}>
				<YearView
					on:select="{onSelectYear}"
					viewUnix="{$viewUnix}"
					selectedUnix="{$selectedUnix}" />
			</div>
		{/if}
		{#if $viewMode === 'month'}
			<div
				transition:fade={{duration: 0}}>
				<MonthView
					on:select="{onSelectMonth}"
					viewUnix="{$viewUnix}"
					selectedUnix="{$selectedUnix}" />
			</div>
		{/if}
		{#if $viewMode === 'date'}
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
		{#if $viewMode === 'time'}
			<TimeView 
				selectedUnix="{$selectedUnix}" />
		{/if}
		<Toolbox 
			on:setcalendar="{setcalendar}"
			on:selectmode="{setViewMode}"
			on:today="{today}"
			on:next="{navNext}"
			on:prev="{navPrev}"
			viewMode="{$viewMode}"
			viewUnix="{$viewUnix}"
			selectedUnix="{$selectedUnix}" />
	</div>
{/if}
	<Input 
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
	import { actions, selectedUnix, viewUnix, viewMode } from './stores.js'


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
	}

	// TODO: develop time
	setvisibility({detail: true})

	const setViewMode = function(event) {
		dispatcher('setViewMode')(event.detail)
	}

	const setcalendar = function(event) {
		dispatcher('onSetCalendar')(event.detail)
	}

	const onSelectDate = function(event) {
		dispatcher('onSelectDate')(event)
	}

	const onSelectMonth = function(event) {
		dispatcher('onSelectMonth')(event.detail)
	}

	const onSelectYear = function(event) {
		dispatcher('onSelectYear')(event.detail)
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
  @import './theme.scss';
</style>
