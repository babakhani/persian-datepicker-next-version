import { writable, readable, derived } from 'svelte/store'

// Readable Example
export const time = readable(new Date(), function start (set) {
  const interval = setInterval(() => {
    set(new Date())
  }, 1000)

  return function stop () {
    clearInterval(interval)
  }
})

// Writable Example
export const count = writable(0)
// Derived Example
const start = new Date()
export const elapsed = derived(time, $time =>
  Math.round(($time - start) / 1000)
)

// Custom Store
export const countable = (function () {
  const { subscribe, set, update } = writable(0)
  return {
    set: input => update(() => input),
    subscribe,
    increment: () => update(n => n + 1),
    decrement: () => update(n => n - 1),
    reset: () => set(0)
  }
})()
