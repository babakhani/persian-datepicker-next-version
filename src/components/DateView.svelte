<div class="pwt-date-view">
	<table 
		class="pwt-month-table next" 
		border="0">
		<thead>
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
		</thead>
		{#if visible}
			<tbody
				out:fadeOut="{{duration: animateSpeed}}" 
				in:fadeIn="{{duration: animateSpeed}}" >
				{#each groupedDay as week, i}
					<tr>
						{#if week.length > 1}
							{#each week as day}
								<td
									on:click="{(event) => { if (!isDisable(day) && day.month &&
									currentViewMonth === day.month()) selectDate(day.valueOf()) }}"
									class:othermonth="{!day.month}"
									class:disable="{isDisable(day) || !checkDate(day)}"
									class:selected="{day && day.isPersianDate && isSameDate(day.valueOf(), selectedDay)}"
									class:today="{day && day.isPersianDate && isSameDate(day.valueOf(), today)}">
									{#if day && day.month && day.format && currentViewMonth === day.month()}
										<span class="pwt-date-view-text">
											{day.format('D')}
										</span>
										{#if $config.calendar[$config.calendarType].showHint}
											<span class="pwt-date-view-hint">
												{getHintText(day)}
											</span>
										{/if}
									{/if}
								</td>
							{/each}
						{/if}
					</tr>
				{/each}
			</tbody>
		{/if}
	</table>
</div>

<script>
	import { config, dateObject  } from '../stores.js'

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
		return new $dateObject(a).isSameDay(b)
	}

	const checkDate = (day) => {
		return day.valueOf && $config.checkDate(day.valueOf())
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

	$: selectedDay = new $dateObject(selectedUnix).startOf('day');
  

	const getHintText = function (day) {
		let out
		if ($config.calendarType === 'persian') {
		  $dateObject.toCalendar('gregorian')
		  out = new $dateObject(day.valueOf()).format('D')
			$dateObject.toCalendar('persian')
		}
		if ($config.calendarType === 'gregorian') {
			$dateObject.toCalendar('persian')
		  out = new $dateObject(day.valueOf()).format('D')
			$dateObject.toCalendar('gregorian')
		}
		return out
	}

	let groupedDay = []

	$: today = new $dateObject(todayUnix)
	$: currentViewMonth = new $dateObject(viewUnix).month()
	let visible = true
	let animateSpeed = 200
	let cachedViewUnix = viewUnix
	let transitionDirectionForward = true
	let animateTimer = null
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
		if (startVisualDelta < 7) {
			while (j < startVisualDelta) {
				days.push({})
				j++
			}
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
		days.forEach((item, index) => {
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
		if (new $dateObject(viewUnix).month() !== new $dateObject(cachedViewUnix).month()) {
			visible = false
			clearTimeout(animateTimer)
			animateTimer = setTimeout(() => {
				visible = true 
			}, 250)
		}
		cachedViewUnix = viewUnix
	}
</script>

<style global lang="scss">
	@import './theme.scss';
	.pwt-date-view {
		width: 100%;
		height: 100%;
		position: relative;
		.pwt-month-table {
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
			position: relative;

			&:hover {
				span.pwt-date-view-text {
					background: #ededed;
				}
			}

			&.today {
				span.pwt-date-view-text {
					border: 1px solid darken($primarycolor, 20) !important;
				}
			}

			&.othermonth {
				cursor: default !important;
				span.pwt-date-view-text {
					color: #ccc !important;
				}
			}

			&.disable {
				cursor: default !important;
				span.pwt-date-view-text {
					background: #ededed;
				}
			}

			&.selected {
				span.pwt-date-view-text {
					color: white;
					background: $primarycolor;
				}
			}

			.pwt-date-view-hint {
				display: block;
				width: auto;
				height: auto;
				position: absolute;
				font-size: 9px;
				bottom: 0;
				right: 5px;
				height: 12px;
				line-height: 12px;
				color: #cccccc;
			}
		}
	}
</style>
