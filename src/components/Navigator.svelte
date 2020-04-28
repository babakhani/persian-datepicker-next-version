<div class="pwt-date-navigator">
	{#if viewMode !== 'time'}
		<button 
			class="pwt-date-navigator-prev"
			on:click={next}>
			<svg 
				width="12"
				height="12"
				viewBox="0 0 24 24">
				<path d="M5.649,24c-0.143,0-0.279-0.061-0.374-0.168c-0.183-0.207-0.163-0.524,0.043-0.706L17.893,12L5.318,0.875
					C5.111,0.692,5.092,0.375,5.274,0.169C5.37,0.062,5.506,0,5.649,0c0.122,0,0.24,0.045,0.331,0.125l12.576,11.126
					c0.029,0.026,0.056,0.052,0.081,0.08c0.369,0.416,0.332,1.051-0.08,1.416L5.98,23.875C5.888,23.956,5.771,24,5.649,24z"/>
			</svg>
		</button>
		<button 
			class="pwt-date-navigator-next"
			on:click="{prev}">
			<svg 
				width="12"
				height="12"
				viewBox="0 0 24 24">
				<path d="M18.401,24c-0.122,0-0.24-0.044-0.331-0.125L5.495,12.748c-0.03-0.027-0.058-0.055-0.084-0.084
					c-0.366-0.413-0.329-1.047,0.083-1.412L18.069,0.125C18.161,0.044,18.279,0,18.401,0c0.143,0,0.28,0.062,0.375,0.169
					c0.182,0.206,0.163,0.523-0.043,0.705L6.157,12l12.575,11.125c0.206,0.183,0.226,0.5,0.043,0.706C18.68,23.939,18.544,24,18.401,24
					z"/>
			</svg>
		</button>
	{/if}
	<div
		class="pwt-date-navigator-center">
		{#if viewMode === 'year' && visible}
			<button 
				out:fadeOut="{{duration: animateSpeed}}" 
				in:fadeIn="{{duration: animateSpeed}}" 
				class="pwt-date-navigator-button">
				{startYear} - {startYear + 11}
			</button>
    {/if}
		{#if viewMode === 'month' && visible}
			<button 
				out:fadeOut="{{duration: animateSpeed}}" 
				in:fadeIn="{{duration: animateSpeed}}" 
				class="pwt-date-navigator-button"
				on:click={() => setViewMode("year")}>
				{monthViewText}
			</button>
		{/if}
		{#if viewMode === 'day' && visible}
			<button 
				out:fadeOut="{{duration: animateSpeed}}" 
				in:fadeIn="{{duration: animateSpeed, delay: 10}}" 
				class="pwt-date-navigator-button"
				on:click={() => setViewMode("month")}>
				{dateViewText}
			</button>
    {/if}
	  {#if viewMode === 'time' && visible}
			<button 
				out:fadeOut="{{duration: animateSpeed}}" 
				in:fadeIn="{{duration: animateSpeed, delay: 10}}" 
				class="pwt-date-navigator-button"
				on:click={() => setViewMode("date")}>
				{selectedMonth}
				{selectedDate}
			</button>
		{/if}
	</div>
</div>

<script>
	import { createEventDispatcher } from 'svelte'
	import { config, dateObject } from '../stores.js'

	function fadeOut(node, { duration, delay }) {
		return {
			duration,
			delay,
			css: t => {
				return `
				transform: translate(${transitionDirectionForward ?  '-' : ''}${20 - (t * 20)}px, 0);
				opacity: ${t};
				`
			}
		};
	}
	function fadeIn(node, { duration, delay }) {
		return {
			duration,
			delay,
			css: t => {
				return `
				transform: translate(${!transitionDirectionForward ?  '-' : ''}${20 - (t * 20)}px, 0);
				opacity: ${t};
				`
			}
		};
	}

	export let viewUnix
	export let viewMode

	const dispatch = createEventDispatcher()

	function setViewMode(payload) { dispatch('selectmode', payload) }
	function today(payload) { dispatch('today', payload) }
	function next(payload) { dispatch('next', payload) }
	function prev(payload) { dispatch('prev', payload) }

	$: selectedYear = new $dateObject(viewUnix).year()
	$: visualYear = new $dateObject(viewUnix).format('YYYY')
	$: selectedMonth = new $dateObject(viewUnix).format('MMMM')
	$: selectedDate = new $dateObject(viewUnix).format('DD')
	$: dateViewText = $config.dayPicker.titleFormatter(viewUnix, $dateObject)
	$: monthViewText = $config.monthPicker.titleFormatter(viewUnix, $dateObject)
	$: yearViewText = $config.yearPicker.titleFormatter(viewUnix, $dateObject)

	let startYear
	let visible = true
	let animateSpeed = 200
	let cachedViewUnix = viewUnix
	let transitionDirectionForward = true
	$: {
		if (viewUnix) {
			startYear = selectedYear - (selectedYear % 12)
			if (viewUnix >  cachedViewUnix) {
				transitionDirectionForward = true
			} else {
				transitionDirectionForward = false
			}
			cachedViewUnix = viewUnix
			visible = false
			setTimeout(() => {
				visible = true 
			}, 400)
		}
	}
</script>

<style global lang="scss">
	@import './theme.scss';
	.pwt-date-navigator {
		height: 60px;
		line-height: 60px;
		border: 0;
		marign: -9px;

		.pwt-date-navigator-center {
			position: absolute;
			top: 0;
			bottom: 0;
			left: 0;
			width: 60%;
			text-align: left;
			.pwt-date-navigator-button {
				font-size: .9em;
				cursor: pointer;
				position: absolute;
				border: 0;
				background: transparent;
				width: 80%;
				margin: 0;
				right: auto;
				left: 10px;
				top: 5px;
				bottom: 5px;
				height: 32px;
				text-align: left;
				border-radius: 6px;
				&:hover {
					background: #f1f1f1;
				}
			}
			.pwt-date-navigator-year {
				left: auto;
				right: 10%;
			}
		}

		.pwt-date-navigator-prev,
		.pwt-date-navigator-next {
			cursor: pointer;
			position: absolute;
			top: 5px;
			bottom: 5px;
			height: 32px;
			right: 10px;
			width: calc(20% - 10px);
			border: 0;
			outline: 0;
			border-radius: 6px;

			&:hover {
				background: #f1f1f1;
			}

			svg {
				position: absolute;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%);
				fill: gray;
			}
		}
		.pwt-date-navigator-next {
			right: auto;
			left: 60%;
		}
	}
</style>
