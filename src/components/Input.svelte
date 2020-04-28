<svelte:options accessors={true} />
<script>
	import { createEventDispatcher } from 'svelte'
	import { isDirty, selectedUnix, config, dateObject } from '../stores.js'

	export let originalContainer
	export let plotarea
	export let setPlotPostion = function () {
		let configLeft = $config.position !== 'auto' ? $config.position[0] : 0
		let configTop = $config.position !== 'auto' ? $config.position[1] : 0
		let set = () => {
			if (plotarea) {
				if (originalContainer && originalContainer.tagName === 'INPUT' ) {
					plotarea.style.position = "absolute"	
					plotarea.style.left = originalContainer.offsetLeft + configLeft + 'px'
					plotarea.style.top =  (parseInt(originalContainer.offsetTop) +
						configTop + 
						parseInt(originalContainer.clientHeight) + document.body.scrollTop) + 'px'
				}
			}
		}
	  set()
		setTimeout(() => {
			set()
		}, 0)
	}

	const dispatch = createEventDispatcher()

	let initInputEvents = function () {
		let bodyListener = (e) => {
			if (
				plotarea && plotarea.contains(e.target) 
				|| 
				e.target == originalContainer 
				|| 
				e.target.className === 'pwt-date-navigator-button'
				|| 
				e.target.className === 'pwt-date-toolbox-button'
			) {

			} else {
				dispatch('setvisibility', false)
				document.removeEventListener('click', bodyListener)
			}
		}
		if (originalContainer && originalContainer.tagName === 'INPUT') {
			originalContainer.addEventListener('focus', () => {
				setPlotPostion()
				dispatch('setvisibility', true)
				document.addEventListener('click', bodyListener)
			})
		}
	}

	let initInputObserver = function () {
		if (originalContainer && originalContainer.tagName === 'INPUT') {
			originalContainer.addEventListener('paste', (e) => {
				setTimeout(() => {
				  getInputInitialValue()
				}, 0)
			})
			originalContainer.addEventListener('keyup', (e) => {
				setTimeout(() => {
				  getInputInitialValue()
				}, 0)
			})
		}
	}

	let updateInputs = function () {
		if (originalContainer && originalContainer.tagName === 'INPUT' && $config.initialValue || $isDirty) {
		  let selected = $config.formatter($selectedUnix, $dateObject)
			if (originalContainer && originalContainer.tagName === 'INPUT') {
			  originalContainer.value = selected
			}
			if ($config.altField) {
				let altField = document.querySelector($config.altField)
				if (altField && originalContainer.altField === 'INPUT') {
				  altField.value = $config.altFieldFormatter($selectedUnix, $dateObject)
				}
			}
		}
	}
	
	let getInputInitialValue = function () {
		if (originalContainer) {
			let value = originalContainer.value
			setTimeout(() => {
				dispatch('setinitialvalue', value)
			}, 0)
		}
	}

	$: {
		if ($selectedUnix) {
			updateInputs()
		}
	}

  getInputInitialValue()
	setPlotPostion()
	initInputEvents()
	if ($config.observer) {
	  initInputObserver()
	}
</script>
