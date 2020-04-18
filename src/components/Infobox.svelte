<div class="pwt-date-info">
	<span>{yearPrt}</span>
	{#if visible}
		<span
			out:fadeOut="{{duration: animateSpeed, offset: 10}}" 
			in:fadeIn="{{duration: animateSpeed, offset: 10}}" >
			{otherPart}
		</span>
	{/if}
</div>

<script>
	import { slide, fly } from 'svelte/transition'
	import { quintOut } from 'svelte/easing'
	import { config, dateObject } from '../stores.js'
	import { fade } from 'svelte/transition'

	function fadeOut(node, { duration, delay, offset }) {
		return {
			duration,
			delay,
			css: eased => {
				return `
				transform: translate(0, ${transitionDirectionForward ?  '-' : ''}${offset - (eased * offset)}px);
				`
			}
		};
	}
	function fadeIn(node, { duration, delay, offset }) {
		return {
			duration,
			delay,
			css: eased => {
				return `
				transform: translate(0, ${!transitionDirectionForward ?  '-' : ''}${offset - (eased * offset)}px);
				`
			}
		};
	}


	export let viewUnix
	export let selectedUnix

	let oldotherPart

	$: yearPrt = new $dateObject(selectedUnix).format('YYYY')
	$: otherPart = new $dateObject(selectedUnix).format('dddd DD MMMM')

	let visible
	let animateSpeed = 100
	let cachedSelectedUnix = viewUnix
	let transitionDirectionForward = true
	$: if (otherPart){
		if (selectedUnix >  cachedSelectedUnix) {
			transitionDirectionForward = true
		} else {
			transitionDirectionForward = false
		}
		cachedSelectedUnix = selectedUnix
		visible = false
		setTimeout(() => {
			visible = true
		}, 200)
	}
</script>

<style global lang="scss">
	@import './theme.scss';
	.pwt-date-info {
		height: 40px;
		border: 0;
		width: auto;
		padding-right: 10px;
		padding-left: 10px;
		background: $primarycolor;
		color: white;
		span {
			width: 100%;
			float: right;
			&:first-child {
				margin-top: 1em;
				font-size: .8em;
			}
			&:nth-child(2) {
				font-size: 1.1em;
			}
		}
	}
</style>
