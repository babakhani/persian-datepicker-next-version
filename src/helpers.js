import Defaultconfig from './config.js'
import lodash from 'lodash'

export function mergeOptionsWithDefaultConfig(options) {
  let defaultConfig = Defaultconfig()
  let out = null
  if (!options) {
    out = { ...defaultConfig }
  } else {
    out = lodash.merge(defaultConfig, options)
  }
  return out
}

export function persianDateToUnix(pDate) {
  return pDate.unix() * 1000
}

export function getInitialValue(target) {
  let out = persianDateToUnix(new persianDate())
  console.log(target)
  if (target && target.tagName === 'INPUT') {
    out = parseInt(target.value)
  } else {
    out = target.getAttribute("data-date")
  }
  return out
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
