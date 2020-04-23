<script>
	import { createEventDispatcher } from 'svelte'
	import persianDate from 'persian-date'
	import { actions, isDirty, selectedUnix, viewUnix, viewMode, config, dateObject } from '../stores.js'

	export let originalContainer
	export let plotarea

	const dispatch = createEventDispatcher()

	let setPlotPostion = function () {
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
		setTimeout(() => {
			set()
		}, 100)
		setTimeout(() => {
			set()
		}, 200)
		setTimeout(() => {
			set()
		}, 300)
		setTimeout(() => {
			set()
		}, 1000)
		setTimeout(() => {
			set()
		}, 1500)
	}

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
				dispatch('setvisibility', true)
				setPlotPostion()
				document.addEventListener('click', bodyListener)
			})
		}
	}

	let updateInputs = function () {
		if ($config.initialValue || $isDirty) {
		  let selected = $config.formatter($selectedUnix, $dateObject)
			originalContainer.value = selected
			if ($config.altField) {
				let altField = document.querySelector($config.altField)
				altField.value = $config.altFieldFormatter($selectedUnix, $dateObject)
			}
		}
	}
	
	let getInputInitialValue = function () {
		let value = originalContainer.value
		setTimeout(() => {
		  dispatch('setinitialvalue', value)
		}, 0)
	}

	$: {
		if ($selectedUnix) {
			updateInputs()
		}
	}

  getInputInitialValue()
	setPlotPostion()
	initInputEvents()
</script>
