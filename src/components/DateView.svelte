<div class="pwt-date-view">
	<table 
		class="month-table next" 
		border="0">
		<tr>
			{#if groupedDay[1]}
				{#each groupedDay[1] as day}
					<th>
						<span>
							{day.format('ddd')}
						</span>
					</th>
				{/each}
			{/if}
		</tr>
		{#if visible}
			{#each groupedDay as week, i}
				<tr
					out:fadeOut="{{duration: animateSpeed}}" 
					in:fadeIn="{{duration: animateSpeed}}" >
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
		{/if}
	</table>
</div>

<script>
	import { afterUpdate } from 'svelte'
	import { flip } from 'svelte/animate'
	import { time, elapsed, countable } from '../stores.js'
	import { config, dateObject } from '../stores.js'
	import { fade, slide } from 'svelte/transition'
	import { elasticOut } from 'svelte/easing'

	function fadeOut(node, { duration, delay }) {
		return {
			duration,
			delay,
			css: t => {
				//console.log(t)
				return `
				transform: translate(${transitionDirectionForward ?  '-' : ''}${20 - (t * 20)}px, 0);
				opacity: ${t};
				`
			}
		};
	}
	function fadeIn(node, { duration, delay }) {
		return {
			duration,
			delay,
			css: t => {
				return `
				transform: translate(${!transitionDirectionForward ?  '-' : ''}${20 - (t * 20)}px, 0);
				opacity: ${t};
				`
			}
		};
	}

	const isSameDate = (a, b) => {
		return a.isSameDay && a.isSameDay(b)
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

	let groupedDay = []

	$: today = new $dateObject(todayUnix)
	$: currentViewMonth = new $dateObject(viewUnix).month()
	$: viewUnixDate = new $dateObject(viewUnix).format('MMMM YYYY')
	let visible = true
	let animateSpeed = 100
	let cachedViewUnix = viewUnix
	let transitionDirectionForward = true
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
		if (viewUnix >  cachedViewUnix) {
			transitionDirectionForward = true
		} else {
			transitionDirectionForward = false
		}
		cachedViewUnix = viewUnix
		if (viewUnix) {
			visible = false
			setTimeout(() => {
				visible = true 
			}, 200)
		}
	}
</script>

<style global lang="scss">
	@import './theme.scss';
	.pwt-animated {
		width: 100%;
		height: 100%;
	}
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
			max-height: 48px;
		}
		th {
			height: calc(100/8%);
			text-align: center;
			vertical-align: top;
			span {
				max-height: 48px;
				height: 48px;
			}
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
