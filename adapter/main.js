import App from '../src/App.svelte'
const attrs =  document.getElementById('container').attributes

// TODO: clean up this functions
function clearAndUpper(text) {
  return text.replace(/-/, "").toUpperCase();
}

function toCamelCase(text) {
  return text.replace(/-\w/g, clearAndUpper);
}

let options = {}
Object.keys(attrs).forEach((value) => {
  let sanitizedValue = attrs[value].value
  if (/^\d+$/.test(sanitizedValue)) {
    sanitizedValue = parseInt(sanitizedValue)
  }
  if (sanitizedValue === 'true') {
    sanitizedValue = true
  }
  if (sanitizedValue === 'false') {
    sanitizedValue = false
  }
  options[toCamelCase(attrs[value].name)] = sanitizedValue
})

const target = document.getElementById('container')
const app = new App({
  target: target,
  props: {
    originalContainer: target,
    options: options
  },
})

export default app
