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
		on:selectmode="{setViewMode}"
		on:today="{today}"
		on:next="{navNext}"
		on:prev="{navPrev}"
		viewMode="{$viewMode}"
		viewUnix="{$viewUnix}"
		selectedUnix="{$selectedUnix}" />
</div>

{#if false}
{#each Object.keys($config) as item, index}
	<pre> {item} </pre>
	<pre> { JSON.stringify($config[item]) } </pre>
	<hr>
{/each}
{/if}
{/if}
<Input 
 on:setvisibility={setvisibility}
 plotarea={plotarea} 
 originalContainer={originalContainer} />

<script>
	import { fly, fade, slide } from 'svelte/transition';
	import { onMount } from 'svelte'
	import { createEventDispatcher } from 'svelte'
	import persianDate from 'persian-date'
	import YearView from './components/YearView.svelte'
	import MonthView from './components/MonthView.svelte'
	import DateView from './components/DateView.svelte'
	import TimeView from './components/TimeView.svelte'
	import Navigator from './components/Navigator.svelte'
	import Infobox from './components/Infobox.svelte'
	import Toolbox from './components/Toolbox.svelte'
	import Input from './components/Input.svelte'
	import defaultconfig from './config.js'
	import { persianDateToUnix } from './helpers.js'
	import { actions, selectedUnix, viewUnix, viewMode, config } from './stores.js'
  

	// Public props
	export let options = {}
	export let originalContainer = null

	const dispatch = createEventDispatcher()
	const dispatcher = function(input) {
		if (options[input]) {
			return event => options[input](event)
		} else {
			return event => {
				actions[input](event)
			}
		}
	}

	if (!options) {
		options = defaultconfig
	} else {
		options = Object.assign(defaultconfig, options)
	}
	dispatcher('setConfig')(options)

	let plotarea
	let isVisbile = false

	const setvisibility = function(payload) {
		isVisbile = payload.detail
		setTimeout(() => {
			if (plotarea) {
			  plotarea.style.display = isVisbile ? 'block' : 'none'
			}
		}, 0)
	}

	const setViewMode = function(event) {
		dispatcher('setViewMode')(event.detail)
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
