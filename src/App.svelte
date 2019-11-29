<div class="plugvelte-container">
  <div class="container">
    <h3>Store Readable demo</h3>
    <p>{dateFormatter.format($time)}</p>
    <h3>Store Drived demo</h3>
    <h5>Elapsed time after page loading:</h5>
    <h2>{$elapsed}</h2>
    <h3>Store Drived demo</h3>
    <h2>{$countable}</h2>
    <button on:click="{countable.decrement}">-</button>
    <input type="number" bind:value="{$countable}" />
    <button on:click="{countable.increment}">+</button>
    <div class="spacer"></div>
    <input type="range" min="0" max="1000" bind:value="{$countable}" />
    <div class="spacer"></div>
    <div class="section">
      <button on:mouseover="{onSampleEventOver}" on:click="{onSampleEvent}">
        Event Example
      </button>
    </div>
  </div>
</div>

<script>
  import { createEventDispatcher, onDestroy } from 'svelte'
  import Options from './options.js'
  import { time, elapsed, countable } from './stores.js'

  // Public props
  export let options

  // Merge default options with given options
  if (!options) {
    options = Options
  } else {
    options = Object.assign(Options, options)
  }

  // Public events
  const dispatch = createEventDispatcher()
  const dispatcher = function(input) {
    if (options[input]) {
      return event => options[input](event)
    } else {
      return event => dispatch(input, event)
    }
  }

  // Formatter
  const dateFormatter = new Intl.DateTimeFormat('en', {
    hour12: true,
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  })

  // Private event
  let onSampleEventOver = function() {
    dispatcher('onSampleEventOver')()
  }
  let onSampleEvent = function() {
    countable.increment(n => n + 1)
    dispatcher('onSampleEvent')()
  }
</script>

<style lang="scss">
  @import './theme.scss';
  .plugvelte-container {
    color: $primarycolor;
    .center {
      text-align: center;
    }
    .spacer {
      display: block;
      width: 100%;
      height: 20px;
    }
    .container {
      width: 450px;
      margin: auto;
      border-radius: 8px;
      padding: 2rem;
      background: #f1f1f1;
    }

    h3,
    h2 {
      margin-bottom: 10px;
      margin-top: 0;
      padding-top: 0;
    }

    h3 {
      border-bottom: 1px solid #e9e9e9;
      padding-bottom: 20px;
    }
  }
</style>
