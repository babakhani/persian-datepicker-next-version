<!-- Used only in demo -->
<template>
  <div class="config-selector-element">
    <label>{{ label }}</label>
    <label class="switch">
      <input 
        type="checkbox"
        @change="onChange"     
        v-model="selected">
      <span class="slider" data-toggle="tooltip"
        data-placement="bottom"
        title="right someThings here!">
      </span>
    </label>
    <span style="color: gray; margin-top: 20px;margin-left: 20px;position: relative;top: 15px;
                    font-size: .8em;">
      {{ help }}
    </span>
  </div>
</template>

<script>
export default {
  name: 'ConfigSwitch',
  data () {
    return {
      selected: this.value 
    }
  },
  props: {
    help: {},
    label: {},
    value: {},
    options: {},
  },
  methods: {
    onChange (value) {
      console.log( this.selected)
      this.$emit('change', this.selected)
      this.$emit('input', this.selected)
    }
  }
}

</script>
