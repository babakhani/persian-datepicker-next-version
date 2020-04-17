<script>
	import { createEventDispatcher } from 'svelte'
	import persianDate from 'persian-date'
	import { actions, isDirty, selectedUnix, viewUnix, viewMode, config } from '../stores.js'

	export let originalContainer
	export let plotarea

	const dispatch = createEventDispatcher()

	let setPlotPostion = function () {
		let set = () => {
			if (plotarea) {
				if (originalContainer && originalContainer.tagName === 'INPUT' ) {
					plotarea.style.position = "absolute"	
					plotarea.style.left = originalContainer.offsetLeft + 'px'
					plotarea.style.top =  (parseInt(originalContainer.offsetTop) +
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
		  let selected = new persianDate($selectedUnix).format($config.format)
			originalContainer.value = selected
			if ($config.altField) {
				let altField = document.querySelector($config.altField)
				let selected
				if ($config.altFormat === 'unix')
					selected = new persianDate($selectedUnix).valueOf()
				else
					selected = new persianDate($selectedUnix).format($config.altField)
				altField.value = selected
			}
		}
	}

	$: {
		if ($selectedUnix) {
			updateInputs()
		}
	}

	setPlotPostion()
	initInputEvents()
</script>
