<div class="pwt-date-view">
	<table 
		class="month-table next" 
		border="0">
    <tr>
      {#if groupedDay[1]}
        {#each groupedDay[1] as day}
          <th>{day.format('ddd')}</th>
        {/each}
      {/if}
    </tr>
    {#each groupedDay as week, i}
			<tr>
				{#if week.length > 1}
        {#each week as day}
          <td
						on:click="{(event) => { if (!isDisable(day) && day.month && currentViewMonth === day.month()) selectDate(day) }}"
						class:othermonth="{!day.month}"
						class:disable="{isDisable(day)}"
            class:selected="{isSameDate(day, selectedDay)}"
            class:today="{isSameDate(day, today)}">
						{#if day && day.month && day.format && currentViewMonth === day.month()}
							<span>
								{day.format('D')}
							</span>
						{/if}
          </td>
        {/each}
				{/if}
      </tr>
    {/each}
  </table>
</div>

<script>
	import { afterUpdate } from 'svelte'
	import { flip } from 'svelte/animate'
  import { time, elapsed, countable } from '../stores.js'
	import { config, dateObject } from '../stores.js'

  const isSameDate = (a, b) => {
    return a.format && a.format('YYYY/MM/DD') === b.format('YYYY/MM/DD')
	}

	const isDisable = (day) => {
		if (day.valueOf) {
			let unixtimespan  = day.valueOf()
			if ($config.minDate && $config.maxDate) {
				if (!(unixtimespan >= $config.minDate && unixtimespan <= $config.maxDate)) {
					return true;
				}
			} else if ($config.minDate) {
				if (unixtimespan <= $config.minDate) {
					return true;
				}
			} else if ($config.maxDate) {
				if (unixtimespan >= $config.maxDate) {
					return true;
				}
			}
		}
	}

  export let viewUnix
  export let selectedUnix
  export let todayUnix

  import { createEventDispatcher } from 'svelte'
  const dispatch = createEventDispatcher()
	
  function selectDate(payload) { dispatch('selectDate', payload) }

  let selectedDay = new $dateObject(selectedUnix).startOf('day');

  afterUpdate(async () => {
    selectedDay = new $dateObject(selectedUnix).startOf('day')
	});

  let today = new $dateObject(todayUnix)
  let groupedDay = []

  $: currentViewMonth = new $dateObject(viewUnix).month()
  $: viewUnixDate = new $dateObject(viewUnix).format('MMMM YYYY')
	$: {
		groupedDay = []
		let days = []
		let dateObj = new $dateObject(viewUnix)
		$dateObject.toCalendar('persian')
		let day = dateObj.startOf('month')
		let daysInMonth = dateObj.daysInMonth()
		let startVisualDelta = dateObj.startOf('month').day()
		if ($config.calendarType === 'persian') {
			startVisualDelta -= 1
		}
		let endVisualDelta = 8 - dateObj.endOf('month').day()
		let visualLenght = daysInMonth + startVisualDelta + endVisualDelta
		let firstVisualDate = day.subtract('day', startVisualDelta)
		let startDateOfView = day.subtract('day', startVisualDelta)
		let j = 0
		while (j < startVisualDelta) {
			days.push({})
			j++
		}
		let i = 0
		while (i < daysInMonth) {
			days.push(new $dateObject([day.year(), day.month(), day.date() + i]))
			i++
		}
		let f = 0
		while (f < endVisualDelta) {
			days.push({})
			f++
		}
		let weekindex = 0
		//let cacheDate = null
		days.forEach((item, index) => {
			// Test rendering
			//if (cacheDate == item.date()) {
			//   console.log('ther is problem')
			//}
			//if (cacheDate && cacheDate > item.date()) {
			//	if(item.date() !== 1) {
			//    console.log('ther is problem')
			//	}
			//}
			//cacheDate = item.date()
			if (index % 7 == 0) {
				groupedDay[weekindex] = []
			}
			groupedDay[weekindex].push(item)
			if (index % 7 == 6) {
				weekindex++
			}
		})
	}
</script>

<style global lang="scss">
  @import './theme.scss';
  .pwt-date-view {
    width: 100%;
    height: 100%;
		position: relative;
		.month-table {
			width: 100%;
			height: 100%;
		}
		tr {
      width: 100%;
			height: calc(100/8%);
		}
		th {
			height: calc(100/8%);
			text-align: center;
		}
		td {
			text-align: center;
			height: calc(100/8%);
			width: 14.2%;
			cursor: pointer;

			&:hover {
				span {
				  background: #ededed;
				}
			}

			&.today {
				span {
					border: 1px solid gray;
				}
			}

			&.othermonth {
			  cursor: default !important;
				span {
					color: #ccc !important;
				}
			}

			&.disable {
				cursor: default !important;
				span {
					background: #ededed;
				}
			}

			&.selected {
				span {
					color: white;
					background: $primarycolor;
				}
			}
		}
	}
</style>
