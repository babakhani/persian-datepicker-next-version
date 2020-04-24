<div class="pwt-date-time">
	{#if $config.timePicker.hour.enabled}
		<div class="pwt-date-time-section pwt-date-time-hour">
			<button 
				on:click={() => updateTime('hour', 'up')}
				class="pwt-date-time-arrow" >
				<svg 
					width="12"
					height="12"
					viewBox="0 0 240.811 240.811" >
					<path d="M129.007,57.819c-4.68-4.68-12.499-4.68-17.191,0L3.555,165.803c-4.74,4.74-4.74,12.427,0,17.155
						c4.74,4.74,12.439,4.74,17.179,0l99.683-99.406l99.671,99.418c4.752,4.74,12.439,4.74,17.191,0c4.74-4.74,4.74-12.427,0-17.155
						L129.007,57.819z"/>
				</svg>
			</button>
			<span>
				{ currentHour }
			</span>
			<button 
				on:click={() => updateTime('hour', 'down')}
				class="pwt-date-time-arrow" >
				<svg 
					width="12"
					height="12"
					viewBox="0 0 240.811 240.811">
					<path d="M220.088,57.667l-99.671,99.695L20.746,57.655c-4.752-4.752-12.439-4.752-17.191,0
						c-4.74,4.752-4.74,12.451,0,17.203l108.261,108.297l0,0l0,0c4.74,4.752,12.439,4.752,17.179,0L237.256,74.859
						c4.74-4.752,4.74-12.463,0-17.215C232.528,52.915,224.828,52.915,220.088,57.667z"/>
				</svg>
			</button>
		</div>
	{/if}
	{#if $config.timePicker.minute.enabled}
	<div class="pwt-date-time-section pwt-date-time-minute">
		<button 
			on:click={() => updateTime('minute', 'up')}
			class="pwt-date-time-arrow" >
			<svg 
				width="12"
				height="12"
				viewBox="0 0 240.811 240.811" >
				<path d="M129.007,57.819c-4.68-4.68-12.499-4.68-17.191,0L3.555,165.803c-4.74,4.74-4.74,12.427,0,17.155
					c4.74,4.74,12.439,4.74,17.179,0l99.683-99.406l99.671,99.418c4.752,4.74,12.439,4.74,17.191,0c4.74-4.74,4.74-12.427,0-17.155
					L129.007,57.819z"/>
			</svg>
		</button>
		<span>
			{ currentMinute }
		</span>
		<button 
			on:click={() => updateTime('minute', 'down')}
			class="pwt-date-time-arrow" >
			<svg 
				width="12"
				height="12"
				viewBox="0 0 240.811 240.811">
				<path d="M220.088,57.667l-99.671,99.695L20.746,57.655c-4.752-4.752-12.439-4.752-17.191,0
					c-4.74,4.752-4.74,12.451,0,17.203l108.261,108.297l0,0l0,0c4.74,4.752,12.439,4.752,17.179,0L237.256,74.859
					c4.74-4.752,4.74-12.463,0-17.215C232.528,52.915,224.828,52.915,220.088,57.667z"/>
			</svg>
		</button>
	</div>
	{/if}
	{#if $config.timePicker.second.enabled}
	<div class="pwt-date-time-section pwt-date-time-second">
		<button 
			on:click={() => updateTime('second', 'up')}
			class="pwt-date-time-arrow" >
			<svg 
				width="12"
				height="12"
				viewBox="0 0 240.811 240.811" >
				<path d="M129.007,57.819c-4.68-4.68-12.499-4.68-17.191,0L3.555,165.803c-4.74,4.74-4.74,12.427,0,17.155
					c4.74,4.74,12.439,4.74,17.179,0l99.683-99.406l99.671,99.418c4.752,4.74,12.439,4.74,17.191,0c4.74-4.74,4.74-12.427,0-17.155
					L129.007,57.819z"/>
			</svg>
		</button>
		<span>
			{ currentSecond }
		</span>
		<button 
			on:click={() => updateTime('second', 'down')}
			class="pwt-date-time-arrow" >
			<svg 
				width="12"
				height="12"
				viewBox="0 0 240.811 240.811">
				<path d="M220.088,57.667l-99.671,99.695L20.746,57.655c-4.752-4.752-12.439-4.752-17.191,0
					c-4.74,4.752-4.74,12.451,0,17.203l108.261,108.297l0,0l0,0c4.74,4.752,12.439,4.752,17.179,0L237.256,74.859
					c4.74-4.752,4.74-12.463,0-17.215C232.528,52.915,224.828,52.915,220.088,57.667z"/>
			</svg>
		</button>
	</div>
	{/if}
	{#if $config.timePicker.meridian.enabled}
	<div class="pwt-date-time-section pwt-date-time-meridian">
		<button
			on:click={() => updateTime('meridian', 'up')}
			class="pwt-date-time-arrow" >
			<svg 
				width="12"
				height="12"
				viewBox="0 0 240.811 240.811" >
				<path d="M129.007,57.819c-4.68-4.68-12.499-4.68-17.191,0L3.555,165.803c-4.74,4.74-4.74,12.427,0,17.155
					c4.74,4.74,12.439,4.74,17.179,0l99.683-99.406l99.671,99.418c4.752,4.74,12.439,4.74,17.191,0c4.74-4.74,4.74-12.427,0-17.155
					L129.007,57.819z"/>
			</svg>
		</button>
		<span>
			{ currentMeridian }
		</span>
		<button 
			on:click={() => updateTime('meridian', 'down')}
			class="pwt-date-time-arrow" >
			<svg 
				width="12"
				height="12"
				viewBox="0 0 240.811 240.811">
				<path d="M220.088,57.667l-99.671,99.695L20.746,57.655c-4.752-4.752-12.439-4.752-17.191,0
					c-4.74,4.752-4.74,12.451,0,17.203l108.261,108.297l0,0l0,0c4.74,4.752,12.439,4.752,17.179,0L237.256,74.859
					c4.74-4.752,4.74-12.463,0-17.215C232.528,52.915,224.828,52.915,220.088,57.667z"/>
			</svg>
		</button>
	</div>
	{/if}
</div>

<script>
	import { afterUpdate } from 'svelte'
	import { config, dateObject } from '../stores.js'
	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()
	export let selectedUnix

	$: currentHour = new $dateObject(selectedUnix).format('hh')
	$: currentMinute = new $dateObject(selectedUnix).format('mm')
	$: currentSecond = new $dateObject(selectedUnix).format('ss')
	$: currentMeridian = new $dateObject(selectedUnix).format('a')

	let tempDate = $dateObject
	$: currentGregorianMeridian = new tempDate(selectedUnix).toLocale('en').format('a')

	const updateTime = function (mode, direction) {
		let selectedObj = new $dateObject(selectedUnix)
		if (mode === 'meridian') {
			if (currentGregorianMeridian === 'PM') {
				selectedObj = selectedObj.add('hour', 12).clone()
			} else {
				selectedObj = selectedObj.subtract('hour', 12).clone()
			}
		} else {
			let step = $config.timePicker[mode].step ? $config.timePicker[mode].step
			: $config.timePicker.step
			if (direction === 'up') {
				selectedObj = selectedObj.add(mode, step).clone()
			} else {
				selectedObj = selectedObj.subtract(mode, step).clone()
			}
		}
		selectDate(selectedObj)
	}

	function selectDate(payload) { dispatch('selectTime', payload) }

</script>

<style global lang="scss">
	@import './theme.scss';
	.pwt-date-time {
		width: 100%;
		height: 100%;
		.pwt-date-time-section {
			display: block;
			height: 100%;
			width: 25%;
			float: left;
			// outline: 1px solid red !important;
			position: relative;
			> span {
				font-size: 2em;
				display: block;
				width: 100%;
				height: 40%;
				text-align: center;
				line-height: 110px;
			}
			.pwt-date-time-arrow {
				display: block;
				width: 100%;
				height: 30%;
				min-height: 48px;
				position: static;
				top: 0;
				right: 0;
				left: 0;
				background: transparent;
				border: 0;
				cursor: pointer;
				&:hover {
					background-color: #f1f1f1;
				}
			}
		}
	}
</style>
