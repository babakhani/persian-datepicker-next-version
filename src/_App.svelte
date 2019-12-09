<!-- 
UNIP_NOTE: this is just an example to start writing your own amazing plugin,
none of this codes are necessary
-->
<div class="plugvelte-container">
  <h1 class="center"> ZeroUnip Project </h1>
  <div class="container">
    <h2>Store Readable demo</h2>
    <p>{dateFormatter.format($time)}</p>
    <h2>Store Derived demo</h2>
    <h3>{$elapsed}</h3>
    <h5>Elapsed time after page loading:</h5>
    <h2>Store Derived demo</h2>
    <h3>{$countable}</h3>
    <button on:click="{countable.decrement}">-</button>
    <input type="number" bind:value="{$countable}" />
    <button on:click="{countable.increment}">+</button>
    <div class="spacer"></div>
    <input type="range" min="0" max="1000" bind:value="{$countable}" />
    <div class="spacer"></div>
    <h2>Plugin Event Example</h2>
    <div class="section">
      <button on:mouseover="{onSampleEventOver}" on:click="{onSampleEvent}">
        Add Count
      </button>
    </div>
  </div>
</div>

<script>

import { createEventDispatcher } from 'svelte'

// UNIP_NOTE: Place your plugin configuration in this file
import Options from './options'

// UNIP_NOTE: States that imported from store
import { time, elapsed, countable } from './stores'

// UNIP_NOTE: Public props
export let options

// UNIP_NOTE: Merge default options with given options
if (!options) {
  options = Options
} else {
  options = Object.assign(Options, options)
}

// UNIP_NOTE: Public events
const dispatch = createEventDispatcher()
const dispatcher = function (input) {
  if (options[input]) {
    return event => options[input](event)
  } else {
    return event => dispatch(input, event)
  }
}

// UNIP_NOTE: Formatter
const dateFormatter = new Intl.DateTimeFormat('en', {
  hour12: true,
  hour: 'numeric',
  minute: '2-digit',
  second: '2-digit'
})

// UNIP_NOTE: Private event
const onSampleEventOver = function () {
  dispatcher('onSampleEventOver')()
}
const onSampleEvent = function () {
  countable.increment(n => n + 1)
  dispatcher('onSampleEvent')()
}
</script>

<style global lang="scss">
  /*
   UNIP_NOTE: You can write your styles either in  each component file or in
   seperated files
  */
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
      background: $globalBackgroundColor;
    }

    h3,
    h2 {
      margin-bottom: 10px;
      margin-top: 0;
      padding-top: 0;
    }
  }
</style>
