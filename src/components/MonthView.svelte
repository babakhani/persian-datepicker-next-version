{#if visible}
	<div 
		out:fadeOut="{{duration: animateSpeed}}" 
		in:fadeIn="{{duration: animateSpeed}}" 
		class="pwt-date-month-view">
		{#each monthRange as month, index}
			<div
				on:click="{event => select(index + 1)}"
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

	const dispatch = createEventDispatcher()

	function select(payload) { dispatch('select', payload) }

	$:  monthRange = new $dateObject().rangeName().months
	$: currentMonth = new $dateObject(selectedUnix).month()
	$: currentSelectedYear = new $dateObject(selectedUnix).year()
	$: currentViewYear = new $dateObject(viewUnix).year()

	let visible = true
	let animateSpeed = 100
	let cachedViewUnix = viewUnix
	let transitionDirectionForward = true
	$: {
		if (viewUnix >  cachedViewUnix) {
			transitionDirectionForward = true
		} else {
			transitionDirectionForward = false
		}
		cachedViewUnix = viewUnix
		visible = false
		setTimeout(() => {
			visible = true
		}, 200)
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
