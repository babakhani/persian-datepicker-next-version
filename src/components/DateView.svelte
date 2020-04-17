<div class="pwt-date-view">
	<table 
		class="month-table next" 
		border="0">
    <tr>
      {#if groupedDay[0]}
        {#each groupedDay[0] as day}
          <th>{day.format('ddd')}</th>
        {/each}
      {/if}
    </tr>
    {#each groupedDay as week, i}
      <tr>
        {#each week as day}
          <td
            on:click="{event => selectDate(day)}"
            class:selected="{isSameDate(day, selectedDay)}"
            class:today="{isSameDate(day, today)}">
            {day.format('D')}
          </td>
        {/each}
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
    return a.format('YYYY/MM/DD') === b.format('YYYY/MM/DD')
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

  $: viewUnixDate = new $dateObject(viewUnix).format('MMMM YYYY')
  $: {
    groupedDay = []
    let days = []
    let dateObj = new $dateObject(viewUnix)
    let day = dateObj.startOf('month')
    let daysInMonth = dateObj.daysInMonth()
    let monthFirstDate = dateObj.startOf('month')
    let monthLastDate = dateObj.endOf('month')
    let monthVisualBeforeSpan = day.day()
    let monthVisualAfterSpan =
      8 -
      monthLastDate
        .clone()
        .add('m', 1)
        .startOf('month')
        .day()
    let i = 0
    while (i < daysInMonth) {
      i++
      // days.push(day.add('day', i))
      days.push(new $dateObject([day.year(), day.month(), i]))
    }
    let j = 1
    while (j < monthVisualBeforeSpan) {
      days.unshift(monthFirstDate.subtract('day', j))
      j++
    }
    let f = 1
    while (f <= monthVisualAfterSpan) {
      days.push(monthLastDate.add('day', f))
      f++
    }
    let weekindex = 0
    days.forEach((item, index) => {
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
			height: calc(100/7%);
		}
		th {
      height: 42px;
			text-align: center;
		}
		td {
			text-align: center;
			height: calc(100/7%);
			width: 14.2%;
			cursor: pointer;
      outline: 1px solid $borderscolor;

			&:hover {
				background: #ededed;
			}

			&.today {
				background: lighten($primarycolor, 40);
			}

			&.selected {
				color: white;
				background: $primarycolor;
			}
		}
	}
</style>
