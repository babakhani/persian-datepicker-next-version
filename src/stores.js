// TODO get default value from config by more priority
import PersianDateParser from './parser'
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
export const dateObject = writable(persianDate)
export const currentCalendar = writable('persian') // [persian, gregorian]


export const actions = {
  parsInitialValue (inputString) {
    let pd = get(dateObject)
    let parse = new PersianDateParser()
    if (parse.parse(inputString) !== undefined) {
        pd.toCalendar(get(config).initialValueType)
        let unix = new pd(parse.parse(inputString)).valueOf()
        this.updateIsDirty(true)
        viewUnix.set(unix)
        selectedUnix.set(unix)
        pd.toCalendar(get(config).calendarType)
    }
  },
  setFromDefaultValue (data) {
    this.parsInitialValue(data)
  },
  onSetCalendar (payload) {
    config.set({
      ...get(config),
      calendarType: payload
    })
    let currentLocale = get(config).calendar[payload].locale
    let obj = persianDate
    currentCalendar.set(payload)
    obj.toCalendar(payload)
    obj.toLocale(currentLocale)
    obj.toLeapYearMode(get(config).calendar.persian.leapYearMode)
    dateObject.set( obj )
    viewUnix.set(get(selectedUnix))
  },
  setConfig (payload) {
    config.set(payload)
    viewMode.set(payload.viewMode)
    this.onSetCalendar(get(config).calendarType)
  },
  onSelectTime (pDate) {
    const pd = get(dateObject)
    const date = pDate.detail
    const { hour, minute, second } = getHourMinuteSecond(date)
    const calced = new pd(get(selectedUnix)).hour(hour).minute(minute).second(second)
    this.updateIsDirty(true)
    selectedUnix.set(calced.valueOf())
  },
  onSelectDate(pDate) {
    const pd = get(dateObject)
    const { hour, minute, second } = getHourMinuteSecond(get(selectedUnix))
    const date = new pd(pDate)
    const cashedDate = date.date()
    const cashedMonth = date.month()
    const cashedYear = date.year()
    date
      .hour(hour)
      .minute(minute)
      .second(second)
      .date(cashedDate)
      .month(cashedMonth)
      .year(cashedYear)
    this.setSelectedDate(date)
    this.setSelectedDate(date)
    this.updateIsDirty(true)
  },
  setSelectedDate(pDate) {
    const pd = get(dateObject)
    selectedUnix.set(new pd(pDate).valueOf())
    this.setViewModeToLowerAvailableLevel()
  },
  onSelectMonth(month) {
    const pd = get(dateObject)
    viewUnix.set(
      new pd(get(viewUnix))
      .month(month)
      .valueOf()
    )
    if (!get(config).onlySelectOnDate) {
      selectedUnix.set(
        new pd(get(viewUnix))
        .month(month)
        .valueOf()
      )
    }
    this.setViewModeToLowerAvailableLevel()
    this.updateIsDirty(true)
  },
  onSelectYear(year) {
    const pd = get(dateObject)
    viewUnix.set(
      new pd(get(selectedUnix))
      .year(year)
      .valueOf()
    )
    if (!get(config).onlySelectOnDate) {
      selectedUnix.set(
        new pd(get(selectedUnix))
        .year(year)
        .valueOf()
      )
    }
    this.setViewModeToLowerAvailableLevel()
    this.updateIsDirty(true)
  },
  onSetHour(hour) {
    const pd = get(dateObject)
    selectedUnix.set(
      new pd(get(selectedUnix))
      .hour(hour)
      .valueOf()
    )
    this.updateIsDirty(true)
  },
  onSetMinute(minute) {
    const pd = get(dateObject)
    selectedUnix.set(
      new pd(get(selectedUnix))
      .minute(minute)
      .valueOf()
    )
    this.updateIsDirty(true)
  },
  setSecond(second) {
    const pd = get(dateObject)
    selectedUnix.set(
      new pd(get(selectedUnix))
      .second(second)
      .valueOf()
    )
  },
  setViewMode(mode) {
    viewMode.set(mode)
  },
  setViewModeToUpperAvailableLevel() {
    let currentViewMode = get(viewMode)
    let $config = get(config)
    if (currentViewMode === 'time') {
       if ($config.dayPicker.enabled) {
         viewMode.set('date')
       } else if ($config.monthPicker.enabled) {
         viewMode.set('month')
       } else if ($config.yearPicker.enabled) {
         viewMode.set('year')
       }
    } else if (currentViewMode === 'date') {
       if ($config.monthPicker.enabled) {
         viewMode.set('month')
       } else if ($config.yearPicker.enabled) {
         viewMode.set('year')
       }
    } else if (currentViewMode === 'month') {
       if ($config.yearPicker.enabled) {
         viewMode.set('year')
       }
    }
  },
  setViewModeToLowerAvailableLevel() {
    let currentViewMode = get(viewMode)
    let $config = get(config)
    if (currentViewMode === 'year') {
       if ($config.monthPicker.enabled) {
         viewMode.set('month')
       } else if ($config.dayPicker.enabled) {
         viewMode.set('date')
       } else if ($config.timePicker.enabled) {
         viewMode.set('time')
       }
    } else if (currentViewMode === 'month') {
       if ($config.dayPicker.enabled) {
         viewMode.set('date')
       } else if ($config.timePicker.enabled) {
         viewMode.set('time')
       }
    } else if (currentViewMode === 'date') {
       if ($config.timePicker.enabled && $config.timePicker.showAsLastStep) {
         viewMode.set('time')
       }
    }
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
  onSelectNextView() {
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
  }
}
