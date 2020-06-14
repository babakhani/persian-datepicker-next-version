import SvelteApp from '../src/App.svelte'
export default{
  render(createElement) {
    return createElement('div', {
      ref: "container",
    }, 
      [
        (this.$attrs.options && this.$attrs.options.inline) | this.$attrs.inline ? '' : createElement('input', { 
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
    value: {}
  },
  watch: {
    value (next, old) {
      if (this.comp && next !== old) {
        this.comp.$set({
          model: this.value
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
      this.$emit('change', e.detail)
      this.$emit('input', e.detail)
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
  updated() {
    this.comp.$set(this.$attrs)
  },
  destroyed() {
    this.comp.$destroy()
  }
}
