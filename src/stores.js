// TODO get default value from config by more priority
import persianDate from 'persian-date'
import { persianDateToUnix, getHourMinuteSecond } from './helpers.js'
import { writable, get } from 'svelte/store'
import Config from './config.js'

const nowUnix = persianDateToUnix(new persianDate())

export const config = writable(Config)
export const isDirty = writable(false)
export const selectedUnix = writable(nowUnix)
export const viewUnix = writable(nowUnix)
export const viewMode = writable('date') // [date, month, year]
export const isOpen = writable(false)
export const minUnix = writable(null)
export const maxUnix = writable(null)
export const currentCalendar = writable('persian') // [persian, gregorian]


export const actions = {
  setConfig (payload) {
    config.set(payload)
  },
  onSelectDate(pDate) {
    const date = pDate.detail
    const { hour, minute, second } = getHourMinuteSecond(get(selectedUnix))
    date
      .hour(hour)
      .minute(minute)
      .second(second)
    this.setSelectedDate(date)
    this.updateIsDirty(true)
  },
  setSelectedDate(pDate) {
    const unix = persianDateToUnix(pDate)
    selectedUnix.set(unix)
  },
  onSelectMonth(month) {
    viewUnix.set(
      persianDateToUnix(
        new persianDate(get(viewUnix))
          .toCalendar(get(currentCalendar))
          .month(month)
      )
    )
    selectedUnix.set(
      persianDateToUnix(
        new persianDate(get(viewUnix))
          .toCalendar(get(currentCalendar))
          .month(month)
      )
    )
    this.setViewMode('date')
    this.updateIsDirty(true)
  },
  onSelectYear(year) {
    viewUnix.set(
      persianDateToUnix(
        new persianDate(get(selectedUnix))
          .toCalendar(get(currentCalendar))
          .year(year)
      )
    )
    selectedUnix.set(
      persianDateToUnix(
        new persianDate(get(selectedUnix))
          .toCalendar(get(currentCalendar))
          .year(year)
      )
    )
    this.setViewMode('month')
    this.updateIsDirty(true)
  },
  onSetHour(hour) {
    selectedUnix.set(
      persianDateToUnix(
        new persianDate(get(selectedUnix))
          .toCalendar(get(currentCalendar))
          .hour(hour)
      )
    )
    this.updateIsDirty(true)
  },
  onSetMinute(minute) {
    selectedUnix.set(
      persianDateToUnix(
        new persianDate(get(selectedUnix))
          .toCalendar(get(currentCalendar))
          .minute(minute)
      )
    )
    this.updateIsDirty(true)
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
    console.log('onSelectNextView -----------------------')
    if (get(viewMode) === 'date') {
      viewUnix.set(persianDateToUnix(new persianDate(get(viewUnix)).add('month', 1)))
    }
    if (get(viewMode) === 'month') {
      viewUnix.set(persianDateToUnix(new persianDate(get(viewUnix)).add('year', 1)))
    }
    if (get(viewMode) === 'year') {
      viewUnix.set(persianDateToUnix(new persianDate(get(viewUnix)).add('year', 12)))
    }
  },
  onSelectPrevView() {
    console.log('onSelectPrevView -----------------------')
    if (get(viewMode) === 'date') {
      viewUnix.set(persianDateToUnix(new persianDate(get(viewUnix)).subtract('month', 1)))
    }
    if (get(viewMode) === 'month') {
      viewUnix.set(persianDateToUnix(new persianDate(get(viewUnix)).subtract('year', 1)))
    }
    if (get(viewMode) === 'year') {
      viewUnix.set(persianDateToUnix(new persianDate(get(viewUnix)).subtract('year', 12)))
    }
  },
  setViewUnix(pDate) {
    viewUnix.set(persianDateToUnix(pDate))
  },
  onSelectToday() {
    viewUnix.set(persianDateToUnix(new persianDate().startOf('day')))
  },
  onClickInput() {
    this.setOpen(!isOpen)
  },
  setOpen(value) {
    isOpen.set(value)
  }
}
