<div class="pwt-date-month-view">
  {#each monthRange as month, index}
    <div
      on:click="{event => select(index + 1)}"
      class:selected="{currentMonth - 1 === index && currentViewYear === currentSelectedYear}">
			<span class="pwt-text">
				{month}
			</span>
    </div>
  {/each}
</div>

<script>
  import { createEventDispatcher } from 'svelte'
	import { config, dateObject } from '../stores.js'

  export let selectedUnix
  export let viewUnix

  const dispatch = createEventDispatcher()

  function select(payload) { dispatch('select', payload) }

  $:  monthRange = new $dateObject().rangeName().months
  $: currentMonth = new $dateObject(selectedUnix).month()
  $: currentSelectedYear = new $dateObject(selectedUnix).year()
  $: currentViewYear = new $dateObject(viewUnix).year()
</script>

<style global lang="scss">
  @import './theme.scss';
  .pwt-date-month-view {
    width: 100%;
    height: 100%;
    div {
			margin: auto;
			width: 33.33%;
			height: 25%; 
			vertical-align: middle;
			text-align: center;
			float: right;
			display: block;
			position: relative;
			cursor: pointer;
			&:hover {
				span {
				  background-color: lighten($primarycolor, 30);
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
