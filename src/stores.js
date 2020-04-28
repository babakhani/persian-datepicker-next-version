// TODO get default value from config by more priority
import PersianDateParser from './parser'
import { persianDateToUnix, getHourMinuteSecond } from './helpers.js'
import { writable, derived, get } from 'svelte/store'
import Config from './config.js'
import lodash from 'lodash'

const nowUnix = persianDateToUnix(new persianDate())

export const config = writable(Config)
export const isDirty = writable(false)
export const selectedUnix = writable(nowUnix)
export const viewUnix = writable(nowUnix)
export const privateViewModeDerived = writable('day')
export const piiirivateViewModeDerived = derived(config, ($config) => {
   return ($config && $config.viewMode) ? $config.viewMode : 'day'
}) // [date, month, year]
export const dateObject = writable(persianDate)
export const currentCalendar = writable('persian') // [persian, gregorian]


export const actions = {
  setDate (unix) {
    this.updateIsDirty(true)
    viewUnix.set(unix)
    selectedUnix.set(unix)
  },
  parsInitialValue (inputString) {
    let pd = get(dateObject)
    let parse = new PersianDateParser()
    if (parse.parse(inputString) !== undefined) {
        pd.toCalendar(get(config).initialValueType)
        let unix = new pd(parse.parse(inputString))
        this.updateIsDirty(true)
        viewUnix.set(unix.valueOf())
        this.setSelectedDate(unix)
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
    obj.toCalendar(payload)
    obj.toLocale(currentLocale)
    obj.toLeapYearMode(get(config).calendar.persian.leapYearMode)
    dateObject.set( obj )
    viewUnix.set(get(selectedUnix))
  },
  setConfig (payload) {
    config.set(payload)
    this.onSetCalendar(get(config).calendarType)
    if (payload.onlyTimePicker) {
      this.setViewMode('time')
    } else {
      this.setViewMode(payload.viewMode)
    }
  },
  updateConfig (key) {
    let ob = {}
    ob[key[0]] = key[1] 
    let conf = JSON.stringify(get(config))
    conf = JSON.parse(conf)
    conf[key[0]] = key[1]
    config.update(() => {
      return {
        ...get(config),
        ...ob
      }
    })
    this.onSetCalendar(get(config).calendarType)
  },
  onSelectTime (pDate) {
    const pd = get(dateObject)
    const date = pDate.detail
    const { hour, minute, second } = getHourMinuteSecond(date)
    const calced = new pd(get(selectedUnix)).hour(hour).minute(minute).second(second)
    this.updateIsDirty(true)
    this.setSelectedDate(calced)
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
    this.updateIsDirty(true)
  },
  setSelectedDate(pDate) {
    const pd = get(dateObject)
    const unix = new pd(pDate).valueOf()
    selectedUnix.set(unix)
    this.setViewModeToLowerAvailableLevel()
    get(config).onSelect(unix)
  },
  onSelectMonth(month) {
    const pd = get(dateObject)
    viewUnix.set(
      new pd(get(viewUnix))
      .month(month)
      .valueOf()
    )
    if (!get(config).onlySelectOnDate) {
      this.setSelectedDate(
        new pd(get(viewUnix))
        .month(month)
      )
    } else {
      this.setViewModeToLowerAvailableLevel()
    }
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
      this.setSelectedDate(
        new pd(get(selectedUnix))
        .year(year)
      )
    } else {
      this.setViewModeToLowerAvailableLevel()
    }
    this.updateIsDirty(true)
  },
  onSetHour(hour) {
    const pd = get(dateObject)
    this.setSelectedDate(
      new pd(get(selectedUnix))
      .hour(hour)
    )
    this.updateIsDirty(true)
  },
  onSetMinute(minute) {
    const pd = get(dateObject)
    this.setSelectedDate(
      new pd(get(selectedUnix))
      .minute(minute)
    )
    this.updateIsDirty(true)
  },
  setSecond(second) {
    const pd = get(dateObject)
    this.setSelectedDate(
      new pd(get(selectedUnix))
      .second(second)
    )
  },
  setViewMode(mode) {
    let conf = get(config)
    config.set(lodash.merge(conf, {
      viewMode: mode
    }))
    privateViewModeDerived.set(mode)
  },
  setViewModeToUpperAvailableLevel() {
    let currentViewMode = get(privateViewModeDerived)
    let $config = get(config)
    if (currentViewMode === 'time') {
       if ($config.dayPicker.enabled) {
         this.setViewMode('day')
       } else if ($config.monthPicker.enabled) {
         this.setViewMode('month')
       } else if ($config.yearPicker.enabled) {
         this.setViewMode('year')
       }
    } else if (currentViewMode === 'day') {
       if ($config.monthPicker.enabled) {
         this.setViewMode('month')
       } else if ($config.yearPicker.enabled) {
         this.setViewMode('year')
       }
    } else if (currentViewMode === 'month') {
       if ($config.yearPicker.enabled) {
         this.setViewMode('year')
       }
    }
  },
  setViewModeToLowerAvailableLevel() {
    let currentViewMode = get(privateViewModeDerived)
    let $config = get(config)
    if (currentViewMode === 'year') {
       if ($config.monthPicker.enabled) {
         this.setViewMode('month')
       } else if ($config.dayPicker.enabled) {
         this.setViewMode('day')
       } else if ($config.timePicker.enabled) {
         this.setViewMode('time')
       }
    } else if (currentViewMode === 'month') {
       if ($config.dayPicker.enabled) {
         this.setViewMode('day')
       } else if ($config.timePicker.enabled) {
         this.setViewMode('time')
       }
    } else if (currentViewMode === 'day') {
       if ($config.timePicker.enabled && $config.timePicker.showAsLastStep) {
         this.setViewMode('time')
       }
    }
  },
  updateIsDirty(value) {
    isDirty.set(value)
  },
  onSelectNextView() {
    if (get(privateViewModeDerived) === 'day') {
      viewUnix.set(persianDateToUnix(new persianDate(get(viewUnix)).add('month', 1)))
    }
    if (get(privateViewModeDerived) === 'month') {
      viewUnix.set(persianDateToUnix(new persianDate(get(viewUnix)).add('year', 1)))
    }
    if (get(privateViewModeDerived) === 'year') {
      viewUnix.set(persianDateToUnix(new persianDate(get(viewUnix)).add('year', 12)))
    }
  },
  onSelectPrevView() {
    if (get(privateViewModeDerived) === 'day') {
      viewUnix.set(persianDateToUnix(new persianDate(get(viewUnix)).subtract('month', 1)))
    }
    if (get(privateViewModeDerived) === 'month') {
      viewUnix.set(persianDateToUnix(new persianDate(get(viewUnix)).subtract('year', 1)))
    }
    if (get(privateViewModeDerived) === 'year') {
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
