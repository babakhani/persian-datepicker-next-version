<div class="pwt-date-month-view">
	{#each monthRange as month, index}
		<span 
	 on:click={ event => select(index + 1)}
		    class:selected={ (currentMonth - 1) === index } > 
			{month} 
		</span> 
	{/each}
</div>

<script>
	import persianDate from 'persian-date'
    import { createEventDispatcher } from 'svelte'
	export let currentUnix
	export let currentViewUnix
    const dispatch = createEventDispatcher()
    function select(payload) {
        dispatch('select', {
      	  payload: payload
        })
    }
    let monthRange = new persianDate().rangeName().months
	$: currentUnixDate =  new persianDate(currentViewUnix).format('MMMM')
	$: currentMonth =  new persianDate(currentUnix).month()

</script>
<style global lang="scss">
	@import './theme.scss';
	.pwt-date-month-view {
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
