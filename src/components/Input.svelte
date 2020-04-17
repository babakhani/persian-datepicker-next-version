<script>
	import { createEventDispatcher } from 'svelte'
	import persianDate from 'persian-date'
	import { actions, selectedUnix, viewUnix, viewMode, config } from '../stores.js'

	export let originalContainer
	export let plotarea

	$: {
		if (selectedUnix) {
			let currentYear = new persianDate($selectedUnix).format($config.format)
			originalContainer.value = currentYear
			if ($config.altField) {
				let altField = document.querySelector($config.altField)
				let currentYear
				if ($config.altFormat === 'unix')
					currentYear = new persianDate($selectedUnix).valueOf()
				else
					currentYear = new persianDate($selectedUnix).format($config.altField)
				altField.value = currentYear
			}
		}
	}

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

	setPlotPostion()
	initInputEvents()
</script>
