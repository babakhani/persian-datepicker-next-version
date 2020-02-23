import persianDate from "persian-date";
import { writable, readable, derived, get } from "svelte/store";
export const isDirty = writable(false);
export const selectedDate = writable(null);
export const selectedViewMode = writable("month"); // [date, month, year]
export const selectedViewDate = writable(new Date());
export const isOpen = writable(false);
export const minDate = writable(null);
export const maxDate = writable(null);
export const selectedCalendar = writable("persian"); // [perisna, gregorian]

export class Store {
  onSelectDate(date) {
    this.setSelectedDate(date);
    this.updateIsDirty(true);
  }
  setSelectedDate(date) {
    selectedDate.set(date);
  }
  onSelectMonth(month) {
    console.log("onSelectMonth...", month);
    // this.setMonth(month);
    // this.setViewMode("day");
    this.updateIsDirty(true);
  }
  onSelectYear(year) {
    this.setYear(year);
    this.setViewMode("month");
    this.updateIsDirty(true);
  }
  onSetHour(hour) {
    this.setHour(hour);
    this.updateIsDirty(true);
  }
  onSetMinute(minute) {
    this.setMinute(minute);
    this.updateIsDirty(true);
  }
  setYear(year) {
    // currentDate.year(year)
    selectedDate.set(
      new Date(
        new persianDate(get(selectedDate))
          .toCalendar(get(selectedCalendar))
          .year(year)
          .unix() * 1000
      )
    );
  }
  setMonth(month) {
    selectedDate.set(
      new Date(
        new persianDate(get(selectedDate))
          .toCalendar(get(selectedCalendar))
          .month(month)
          .unix() * 1000
      )
    );
  }
  setDate(dayOfMonth) {
    selectedDate.set(
      new Date(
        new persianDate(get(selectedDate))
          .toCalendar(get(selectedCalendar))
          .date(dayOfMonth)
          .unix() * 1000
      )
    );
  }
  setHour(hour) {
    selectedDate.set(
      new Date(
        new persianDate(get(selectedDate))
          .toCalendar(get(selectedCalendar))
          .hour(hour)
          .unix() * 1000
      )
    );
  }
  setMinute(minute) {
    selectedDate.set(
      new Date(
        new persianDate(get(selectedDate))
          .toCalendar(get(selectedCalendar))
          .minute(minute)
          .unix() * 1000
      )
    );
  }
  setSecond(second) {
    selectedDate.set(
      new Date(
        new persianDate(get(selectedDate))
          .toCalendar(get(selectedCalendar))
          .second(second)
          .unix() * 1000
      )
    );
  }
  onChangeViewMode() {
    // setViewMode(...)
    console.log("onChangeViewMode...");
  }
  setViewMode(viewMode) {
    viewMode.set(viewMode);
  }
  updateIsDirty(value) {
    isDirty.set(value);
  }
  setMinDate(date) {
    minDate.set(date);
    this.setSelectedDate(Math.max(get(selectedDate), get(minDate)));
  }
  setMaxDate(date) {
    maxDate.set(date);
    this.setSelectedDate(Math.min(get(selectedDate), get(maxDate)));
  }
  onSelectCalendar(calendar) {
    this.setCalendar(calendar);
  }
  setCalendar(calendar) {
    selectedCalendar.set(calendar);
  }
  onSelectNextView() {
    console.log("on next view");
    // this.setViewDate(this.selectedViewDate + n * this.selectedViewMode)
  }
  onSelectPreviousView() {
    console.log("on previous view");
    // this.setViewDate(this.selectedViewDate - n * this.selectedViewMode)
  }
  setViewDate(date) {
    selectedViewDate.set(date);
  }
  goToday(date) {
    const now = new persianDate(new Date())
      .toCalendar(get(selectedCalendar))
      .hour(0)
      .minute(0)
      .second(0)
      .millisecond(0);
    selectedViewDate.set(new Date(now));
  }
  onClickInput() {
    this.setOpen(!isOpen);
  }
  setOpen(value) {
    isOpen.set(value);
  }
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