{#if visible}
	<div 
		out:fadeOut="{{duration: animateSpeed}}" 
		in:fadeIn="{{duration: animateSpeed}}" 
		class="pwt-date-month-view">
		{#each monthRange as month, index}
			<div
				on:click="{(event) => { if (!isDisable(currentViewYear, index + 1)) select(index + 1) }}"
			  class:disable="{isDisable(currentViewYear, index + 1)}"
				class:selected="{currentMonth - 1 === index && currentViewYear === currentSelectedYear}">
				<span class="pwt-text">
					{month}
				</span>
			</div>
		{/each}
	</div>
{/if}
<script>
	import { createEventDispatcher } from 'svelte'
	import { config, dateObject } from '../stores.js'

	export let selectedUnix
	export let viewUnix


	function fadeOut(node, { duration, delay }) {
		return {
			duration,
			delay,
			css: t => {
				//console.log(t)
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

	const isDisable = (y, month) => {
		let startYear 
		let startMonth
		let endYear
		let endMonth
		if ($config.checkMonth(y, month)) {
			if ($config.minDate && $config.maxDate) {
				startYear = new $dateObject($config.minDate).year()
				startMonth = new $dateObject($config.minDate).month()
				endYear = new $dateObject($config.maxDate).year()
				endMonth = new $dateObject($config.maxDate).month()
				if (((y == endYear && month > endMonth) || y > endYear) || ((y == startYear && month < startMonth) || y < startYear)) {
					return true;
				}
			} else if ($config.maxDate) {
				endYear = new $dateObject($config.maxDate).year()
				endMonth = new $dateObject($config.maxDate).month()
				if ((y == endYear && month > endMonth) || y > endYear) {
					return true;
				}
			} else if ($config.minDate) {
				startYear = new $dateObject($config.minDate).year()
				startMonth = new $dateObject($config.minDate).month()
				if ((y == startYear && month < startMonth) || y < startYear) {
					return true;
				}
			}
		}
		else {
      return true
		}
	}

	const dispatch = createEventDispatcher()

	function select(payload) { dispatch('select', payload) }

	$:  monthRange = new $dateObject().rangeName().months
	$: currentMonth = new $dateObject(selectedUnix).month()
	$: currentSelectedYear = new $dateObject(selectedUnix).year()
	$: currentViewYear = new $dateObject(viewUnix).year()

	let visible = true
	let animateSpeed = $config.animateSpeed
	let cachedViewUnix = viewUnix
	let transitionDirectionForward = true
	$: {
		if (viewUnix >  cachedViewUnix) {
			transitionDirectionForward = true
		} else {
			transitionDirectionForward = false
		}
		cachedViewUnix = viewUnix
		if ($config.animate) {
			visible = false
			setTimeout(() => {
				visible = true
			}, animateSpeed * 2)
		}
	}
</script>

<style global lang="scss">
	@import './theme.scss';
	.pwt-date-month-view {
		width: 100%;
		height: 100%;
		div {
			margin: auto;
			width: 33.33%;
			height: 25%; 
			vertical-align: middle;
			text-align: center;
			float: left;
			display: block;
			position: relative;
			cursor: pointer;

			&.disable {
				span {
				  background: #ededed;
				}
			}

			&:hover {
				span {
					background-color: lighten($primarycolor, 30);
				}
			}
			&.selected {
				span {
					background-color: $primarycolor;
					color: white;
				}
			}
			span.pwt-text {
				display: block;
				font-size: .8em;
				width: 80%;
				padding: 6px;
				border-radius: 20px;
				position: absolute;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%);
			}
		}
	}
</style>
