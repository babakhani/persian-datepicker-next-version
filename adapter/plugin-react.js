/* eslint-disable */
import SvelteApp from '../src/app.svelte'
import toReact from 'svelte-adapter/react'
export default toReact(SvelteApp, {}, 'div')
