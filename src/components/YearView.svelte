<div 
  out:fadeOut="{{duration: animateSpeed}}" 
	in:fadeIn="{{duration: animateSpeed}}" 
  class="pwt-date-year-view">
  {#each yearRange as year}
    <div
			on:click="{(event) => { if (!isDisable(year)) select(year) }}"
			class:disable="{isDisable(year)}"
      class:selected="{currentYear === year}">
			<span class="pwt-text">
        {year}
			</span>
    </div>
  {/each}
</div>

<script>
  import { createEventDispatcher } from 'svelte'
	import { config, dateObject } from '../stores.js'

  export let selectedUnix
  export let viewUnix

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

	const isDisable = (y) => {
		let startYear 
		let endYear
		if ($config.checkYear(y)) {
			if ($config.minDate && $config.maxDate) {
				startYear = new $dateObject($config.minDate).year()
				endYear = new $dateObject($config.maxDate).year()
				if (y > endYear || y < startYear) {
					return true;
				}
			} else if ($config.maxDate) {
				endYear = new $dateObject($config.maxDate).year()
				if (y > endYear) {
					return true;
				}
			} else if ($config.minDate) {
				startYear = new $dateObject($config.minDate).year()
				if (y < startYear) {
					return true;
				}
			}
		}
		else {
			return true
		}
	}

  const dispatch = createEventDispatcher()

  function select(payload) { dispatch('select', payload) }

  $: currentYear = new $dateObject(selectedUnix).year()
  $: currentViewYear = new $dateObject(viewUnix).year()

  let yearRange
  let startYear
	let visible = true
	let animateSpeed = 100
	let cachedViewUnix = viewUnix
	let transitionDirectionForward = true
  $: {
    yearRange = []
    startYear = currentViewYear - (currentViewYear % 12)
    let i = 0
    while (i < 12) {
      yearRange.push(startYear + i)
      i++
    }
		if (viewUnix >  cachedViewUnix) {
			transitionDirectionForward = true
		} else {
			transitionDirectionForward = false
		}
		cachedViewUnix = viewUnix
		visible = false
		setTimeout(() => {
			visible = true
		}, 200)
  }
</script>

<style global lang="scss">
  @import './theme.scss';
  .pwt-date-year-view {
    width: 100%;
    height: 100%;
    div {
			margin: auto;
			width: 33.33%;
			height: 25%; 
			vertical-align: middle;
			text-align: center;
			float: left;
			display: block;
			position: relative;
			cursor: pointer;
			&:hover {
				span {
					background-color: lighten($primarycolor, 30);
				}
			}
			&.disable {
				span {
				  background: #ededed;
				}
			}

			&.selected {
				span {
					background-color: $primarycolor;
					color: white;
				}
			}
			span.pwt-text {
				display: block;
				width: 80%;
				padding: 6px;
				border-radius: 20px;
				position: absolute;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%);
			}
    }
  }
</style>
