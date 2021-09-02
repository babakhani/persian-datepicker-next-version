<div class="pwt-date-info">
	<span class="pwt-date-info--title">{title}</span>
	<span class="pwt-date-info--sub-title">
		{selectedDate}
	</span>
	{#if $config.timePicker.hour.enabled}
		<span class="pwt-date-info--time">
			{selectedTime}
		</span>
	{/if}
</div>

<script>
	import { getContext } from 'svelte'

	const dateObject = getContext('dateObject')
	const config = getContext('config')

	export let viewUnix
	export let selectedUnix

	$: title = $config.infobox.titleFormatter(selectedUnix, $dateObject)
	$: selectedDate = $config.infobox.selectedDateFormatter(selectedUnix, $dateObject)
	$: selectedTime = $config.infobox.selectedTimeFormatter(selectedUnix, $dateObject)

</script>

<style global lang="scss">
	@import './theme.scss';
	.pwt-date-info {
		position: relative;
		height: 40px;
		border: 0;
		background: $primarycolor;
		color: white;
		span {
			position: absolute;
			width: 100%;
			float: right;
			&.pwt-date-info--title {
				top: 0;
				margin-top: 1em;
				font-size: .8em;
			}
			&.pwt-date-info--sub-title {
				top: 25px;
				position: absolute;
				margin-top: .5em;
				font-size: 1.4em;
			}
			&.pwt-date-info--time {
				top: 70px;
				margin-top: .1em;
				font-size: 1em;
			}
		}
	}
</style>
