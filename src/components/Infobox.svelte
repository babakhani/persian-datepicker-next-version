<div class="pwt-date-info">
	<span>{title}</span>
	{#if visible}
		<span
			out:fadeOut="{{duration: animateSpeed, offset: 10}}" 
			in:fadeIn="{{duration: animateSpeed, offset: 10}}" >
			{selectedDAte}
		</span>
	{/if}
</div>

<script>
	import { slide, fly } from 'svelte/transition'
	import { quintOut } from 'svelte/easing'
	import { config, dateObject } from '../stores.js'

	function fadeOut(node, { duration, delay, offset }) {
		return {
			duration,
			delay,
			css: eased => {
				return `
				transform: translate(0, ${transitionDirectionForward ?  '-' : ''}${offset - (eased * offset)}px);
				`
			}
		}
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
		}
	}


	export let viewUnix
	export let selectedUnix

	let oldotherPart

	$: title = $config.infobox.titleFormatter(selectedUnix, $dateObject)
	$: selectedDAte = $config.infobox.selectedDateFormatter(selectedUnix, $dateObject)

	let visible
	let animateSpeed = 100
	let cachedSelectedUnix = viewUnix
	let transitionDirectionForward = true
	$: if (selectedDAte){
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
				margin-top: .8em;
				font-size: 1.4em;
			}
		}
	}
</style>
