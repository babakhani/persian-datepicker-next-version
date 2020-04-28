<!-- Used only in demo -->
<template>
  <div class="config-selector-element">
  <label>{{ label }}</label>
  <select 
    @input="onChange"
    v-model="selected">
    <option 
    v-for="(op, index) in inneroptions"
    :key="index"
    :value="op.value">
    {{ op.label }}
    </option>
  </select>
  <span style="color: gray; margin-top: 20px;margin-left: 20px;position: relative;top: 15px;
    font-size: .8em;">
    {{ help }}
  </span>
  </div>
</template>

<script>
export default {
  name: 'ConfigSelect',
  data () {
    return {
      inneroptions: this.options,
      selected: this.value 
    }
  },
  props: {
    help: {},
    label: {},
    value: { },
    options: {},
  },
  methods: {
    onChange (value) {
      setTimeout(() => {
        this.$emit('change', this.selected)
        this.$emit('input', this.selected)
      }, 0)
    }
  }
}

</script>
