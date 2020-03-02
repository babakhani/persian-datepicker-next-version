<div class="pwt-date-navigator">{currentUnixDate}</div>

<script>
  import { time, elapsed, countable } from '../stores.js'
  import persianDate from 'persian-date'
  import { afterUpdate } from 'svelte'
  export let selectedUnix

  let currentUnixDate = new persianDate(selectedUnix).format('HH:mm:ss')

  afterUpdate(async () => {
		currentUnixDate = new persianDate(selectedUnix).format('HH:mm:ss')
  })
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
