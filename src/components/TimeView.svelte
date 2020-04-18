<div class="pwt-date-time">
	<div class="pwt-date-time-hour">
		<button 
      on:click={() => updateTime('hour', 'up')}
			class="pwt-date-time-arrow" >
      Up
		</button>
		{ currentHour }
		<button 
      on:click={() => updateTime('hour', 'down')}
			class="pwt-date-time-arrow" >
      Down
		</button>
  </div>
	<div class="pwt-date-time-minute">
		<button 
			on:click={() => updateTime('minute', 'up')}
			class="pwt-date-time-arrow" >
      Up
		</button>
		{ currentMinute }
		<button 
      on:click={() => updateTime('minute', 'down')}
			class="pwt-date-time-arrow" >
      Down
		</button>
  </div>
	<div class="pwt-date-time-second">
		<button 
      on:click={() => updateTime('second', 'up')}
			class="pwt-date-time-arrow" >
      Up
		</button>
		{ currentSecond }
		<button 
      on:click={() => updateTime('second', 'down')}
			class="pwt-date-time-arrow" >
      Down
		</button>
  </div>
	<div class="pwt-date-time-meridian">
		<button class="pwt-date-time-arrow" >
      Up
		</button>
		  Meridian
		<button class="pwt-date-time-arrow" >
      Down
		</button>
  </div>
</div>

<script>
  import { time, elapsed, countable } from '../stores.js'
  import { afterUpdate } from 'svelte'
	import { config, dateObject } from '../stores.js'
	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()
  export let selectedUnix

	$: currentHour = new $dateObject(selectedUnix).hour()
	$: currentMinute = new $dateObject(selectedUnix).minute()
	$: currentSecond = new $dateObject(selectedUnix).second()

	const updateTime = function (mode, direction) {
		let selectedObj = new $dateObject(selectedUnix)
		if (direction === 'up') {
       selectedObj = selectedObj.add(mode, 1).clone()
		} else {
       selectedObj = selectedObj.subtract(mode, 1).clone()
		}
		selectDate(selectedObj)
	}
    
	function selectDate(payload) { dispatch('selectTime', payload) }

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
