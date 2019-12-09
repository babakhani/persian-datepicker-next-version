<div class="pwt-date-year-view">
	{#each yearRange as year}
		<span 
	 on:click={event => select(year)}
		    class:selected={ currentYear === year } > {year} </span> 
	{/each}
</div>

<script>
	import { time, elapsed, countable } from '../stores.js'
	import persianDate from 'persian-date'
	export let currentUnix
    import { createEventDispatcher } from 'svelte'
    const dispatch = createEventDispatcher()
    function select(payload) {
        dispatch('select', {
      	  payload: payload
        })
    }
	$: currentUnixDate =  new persianDate(currentUnix).format('MMMM')
	$: currentYear =  new persianDate(currentUnix).year()
	let yearRange
	let startYear
	$: {
	  yearRange =  []
		startYear =  currentYear - (currentYear % 12)
        let i = 0;
		while (i < 12) {
          yearRange.push(startYear + i)
          i++;
		}
	}

</script>
<style global lang="scss">
	@import './theme.scss';
	.pwt-date-year-view {
		border: 1px solid red;
		width: 300px;
		height: 100px;
		span {
		    outline: 1px solid red;
			display: block;
			width: 33.33%;
			float: right;
			&.selected {
               background-color: red;
			}
		}
	}
</style>
