import React from 'react'
import logo from './logo.svg'
import './App.css'
import SveltePlugin from './zerounip-react.js'
import Styles from './zerounip.css'
function App() {
  const handleClick = () => alert('alert from react')
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <SveltePlugin
          onSvelteclick={handleClick}
          name="(attr passed from react js to svlete)"
        />
      </header>
    </div>
  )
}

export default App
