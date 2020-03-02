<div class="pwt-date-view">
  <table class="month-table next" border="1">
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
  import { time, elapsed, countable } from '../stores.js'
  import { afterUpdate } from 'svelte';
  import persianDate from 'persian-date'
  const isSameDate = (a, b) => {
    return a.format('YYYY/MM/DD') === b.format('YYYY/MM/DD')
  }
  export let viewUnix
  export let selectedUnix
  export let todayUnix

  import { createEventDispatcher } from 'svelte'
  const dispatch = createEventDispatcher()
  function selectDate(payload) {
    dispatch('selectDate', {
      payload: payload,
    })
  }
  let selectedDay = new persianDate(selectedUnix).startOf('day');
  afterUpdate(async () => {
    selectedDay = new persianDate(selectedUnix).startOf('day')
	});

  let today = new persianDate(todayUnix)
  let groupedDay = []

  $: viewUnixDate = new persianDate(viewUnix).format('MMMM YYYY')
  $: {
    groupedDay = []
    let days = []
    let dateObj = new persianDate(viewUnix)
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
      days.push(new persianDate([day.year(), day.month(), i]))
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
  table {
    float: right;
  }
  .pwt-date-view {
    width: 600px;
    height: 350px;
    position: relative;
    border: 3px dashed $primarycolor;
  }
  .month-table {
    position: absolute;
    top: 0px;
    right: 0px;
    left: 10%;
    bottom: 0px;
    width: 100%;
    border: 1px solid red;
  }
  .today {
    background: green;
  }
  .selected {
    background: red;
  }
  td {
    height: 20px;
    padding: 1em;
    cursor: pointer;
    &:hover {
      background: #ededed;
    }
  }
</style>
