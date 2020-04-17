import App from '../src/app.svelte'
const Plugin = function(container, config) {
  console.log(container.tagName)
  let softContainer = container
  if (container.tagName === 'INPUT') {
    softContainer = document.body;
  }
  return new App({
    target: softContainer,
    props: {
      originalContainer: container,
      options: config,
    },
  })
}
export default Plugin
