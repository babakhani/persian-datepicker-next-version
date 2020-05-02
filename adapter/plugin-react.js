/* eslint-disable */
import SvelteApp from '../src/App.svelte'
import toReact from 'svelte-adapter/react'
export default toReact(SvelteApp, {}, 'div')
