import persianDate from 'persian-date'

export function persianDateToUnix(pDate) {
  return pDate.unix() * 1000
}

export function getHourMinuteSecond(unix) {
  const pDate = new persianDate(unix)
  const result = {
    hour: pDate.hour(),
    minute: pDate.minute(),
    second: pDate.second(),
  }
  return result
}
