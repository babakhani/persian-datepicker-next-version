<div class="pwt-date-navigator">{selectedUnixDate}</div>

<script>
  import persianDate from 'persian-date'
  export let selectedUnix
  $: selectedUnixDate = new persianDate(selectedUnix).format('MMMM YYYY DD')
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
