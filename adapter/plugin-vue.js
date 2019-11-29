import SvelteApp from '../src/app.svelte'
import toVue from 'svelte-adapter/vue'
export default toVue(SvelteApp, {}, 'div')
