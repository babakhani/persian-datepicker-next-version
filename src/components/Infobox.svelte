<div class="pwt-date-info">
	<span>{yearPrt}</span>
	{#if visbility}
		<span
			in:slide="{{delay: 10, duration: 400, easing: quintOut }}"
			out:slide="{{delay: 0, duration: 400, easing: quintOut }}">
			{otherPart}
		</span>
	{/if}
	{#if !visbility}
		<span
			out:slide="{{delay: 10, duration: 400, easing: quintOut }}">
			{otherPart}
		</span>
	{/if}
</div>

<script>
	import { slide, fly } from 'svelte/transition'
	import { quintOut } from 'svelte/easing'
	import { config, dateObject } from '../stores.js'

	export let viewUnix
	export let selectedUnix

	let oldotherPart

  $: yearPrt = new $dateObject(selectedUnix).format('YYYY')
  $: otherPart = new $dateObject(selectedUnix).format('dddd DD MMMM')

  let visbility
	$: if (otherPart){
		visbility = false
		setTimeout(() => {
			visbility = true
		}, 10)
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
