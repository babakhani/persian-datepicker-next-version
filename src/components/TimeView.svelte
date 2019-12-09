<div class="pwt-date-navigator">
	{ currentUnixDate }
</div>

<script>
	import { time, elapsed, countable } from '../stores.js'
	import persianDate from 'persian-date'
	export let currentUnix
	$: currentUnixDate =  new persianDate(currentUnix).format('HH:mm:ss')
</script>
<style global lang="scss">
	@import './theme.scss';
	.pwt-date-navigator {
		width: 600px;
		height: 30px;
		line-height: 30px;
		position: relative;
		border: 3px dashed $primarycolor;
	}
</style>
