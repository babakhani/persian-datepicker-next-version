import SvelteApp from '../src/App.svelte'
export default{
  render() {
    return h('div', {
      class: 'pwt-datepicker-container',
      ref: "container",
    }, 
      [
        (this.$attrs.options && this.$attrs.options.inline) | this.$attrs.inline ? '' : h('input', { 
          ref: "inputElement" ,
          props: { value : this.value}
        })
      ]
    )
  },
  data() {
    return {
      comp: null
    }
  },
  props: {
    modelValue: {}
  },
  watch: {
    modelValue (next, old) {
      if (this.comp && next !== old) {
        this.comp.$set({
          model: this.modelValue
        })
      }
    }
  },
  mounted() {
    let props = this.$attrs
    let mainElement = this.$refs.inputElement
    let container = document.body
    if (this.$attrs.options && this.$attrs.options.inline || this.$attrs.inline) {
      mainElement = this.$refs.container
      container = this.$refs.container
    }
    if (this.$attrs.options) {
      props = {
        ...this.$attrs,
        options: {
          ...this.$attrs.options,
          ...this.$attrs,
        },
        originalContainer: mainElement
      }
      props.originalContainer = mainElement

    } else {
      props = {
        options: {
          ...this.$attrs
        },
        originalContainer: mainElement
      }
      container = this.$refs.container
    }
    props.model = this.value
    this.comp = new SvelteApp({
      target: container,
      props: props
    })

    this.comp.$on('onSelect', (e) => {
      this.$emit('update:modelValue', e.detail)
    })

    let watchers = []

    for (const key in this.$listeners) {
      this.comp.$on(key, this.$listeners[key])
      const watchRe = /watch:([^]+)/

      const watchMatch = key.match(watchRe)

      if (watchMatch && typeof this.$listeners[key] === "function") {
        watchers.push([
          `${watchMatch[1][0].toLowerCase()}${watchMatch[1].slice(1)}`,
          this.$listeners[key]
        ])
      }
    }

    if (watchers.length) {
      let comp = this.comp
      const update = this.comp.$$.update
      this.comp.$$.update = function() {
        watchers.forEach(([name, callback]) => {
          const index = comp.$$.props[name]
          callback(comp.$$.ctx[index])
        })
        update.apply(null, arguments)
      }
    }
  },
  onUpdated() {
    this.comp.$set(this.$attrs)
  },
  onUnmounted() {
    this.comp.$destroy()
  }
}
