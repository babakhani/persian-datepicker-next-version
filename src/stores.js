import persianDate from 'persian-date'
import { persianDateToUnix, getHourMinuteSecond } from './helpers.js'
import { writable, get } from 'svelte/store'

const nowUnix = persianDateToUnix(new persianDate())
export const isDirty = writable(false)
// TODO get default value from config by more priority
export const selectedUnix = writable(nowUnix)
export const viewUnix = writable(nowUnix)
export const viewMode = writable('month') // [date, month, year]
export const isOpen = writable(false)
export const minUnix = writable(null)
export const maxUnix = writable(null)
export const currentCalendar = writable('persian') // [persian, gregorian]

export const actions = {
  onSelectDate(pDate) {
    const { hour, minute, second } = getHourMinuteSecond(get(selectedUnix))
    pDate
      .hour(hour)
      .minute(minute)
      .second(second)
    this.setSelectedDate(pDate)
    this.updateIsDirty(true)
  },
  setSelectedDate(pDate) {
    const unix = persianDateToUnix(pDate)
    selectedUnix.set(unix)
  },
  onSelectMonth(month) {
    this.setMonth(month)
    this.setViewMode('day')
    this.updateIsDirty(true)
  },
  onSelectYear(year) {
    this.setYear(year)
    this.setViewMode('month')
    this.updateIsDirty(true)
  },
  onSetHour(hour) {
    this.setHour(hour)
    this.updateIsDirty(true)
  },
  onSetMinute(minute) {
    this.setMinute(minute)
    this.updateIsDirty(true)
  },
  setYear(year) {
    selectedUnix.set(
      persianDateToUnix(
        new persianDate(get(selectedUnix))
          .toCalendar(get(currentCalendar))
          .year(year)
      )
    )
  },
  setMonth(month) {
    selectedUnix.set(
      persianDateToUnix(
        new persianDate(get(selectedUnix))
          .toCalendar(get(currentCalendar))
          .month(month)
      )
    )
  },
  /* @param {number} date - day of month */
  setDate(date) {
    selectedUnix.set(
      persianDateToUnix(
        new persianDate(get(selectedUnix))
          .toCalendar(get(currentCalendar))
          .date(date)
      )
    )
  },
  setHour(hour) {
    selectedUnix.set(
      persianDateToUnix(
        new persianDate(get(selectedUnix))
          .toCalendar(get(currentCalendar))
          .hour(hour)
      )
    )
  },
  setMinute(minute) {
    selectedUnix.set(
      persianDateToUnix(
        new persianDate(get(selectedUnix))
          .toCalendar(get(currentCalendar))
          .minute(minute)
      )
    )
  },
  setSecond(second) {
    selectedUnix.set(
      persianDateToUnix(
        new persianDate(get(selectedUnix))
          .toCalendar(get(currentCalendar))
          .second(second)
      )
    )
  },
  onChangeViewMode(viewMode) {
    // click on center of toolbar
    this.setViewMode(viewMode)
  },
  setViewMode(mode) {
    viewMode.set(mode)
  },
  updateIsDirty(value) {
    isDirty.set(value)
  },
  setMinUnix(date) {
    minUnix.set(date)
    this.setSelectedDate(Math.max(get(selectedUnix), get(minUnix)))
  },
  setMaxUnix(date) {
    maxUnix.set(date)
    this.setSelectedDate(Math.min(get(selectedUnix), get(maxUnix)))
  },
  onSelectCalendar(calendar) {
    this.setCalendar(calendar)
  },
  setCalendar(calendar) {
    currentCalendar.set(calendar)
  },
  onSelectNextView() {
    console.log('on next view')
    // this.setViewUnix(this.viewUnix + n * this.viewMode)
  },
  onSelectPreviousView() {
    console.log('on previous view')
    // this.setViewUnix(this.viewUnix - n * this.viewMode)
  },
  setViewUnix(pDate) {
    viewUnix.set(persianDateToUnix(pDate))
  },
  onSelectToday() {
    viewUnix.set(persianDateToUnix(new persianDate()))
  },
  onClickInput() {
    this.setOpen(!isOpen)
  },
  setOpen(value) {
    isOpen.set(value)
  },
}

/*

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


*/
