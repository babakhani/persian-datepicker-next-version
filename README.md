zerounip v0.0.1
==============

My Awesome unip plugin, created with unip

- [Documents]()
- [Example/Demo]()
- [Playground]()

## Install

```
npm install zerounip --save

yarn add zerounip -S
```

## Usage

#### Pure javascript

```
<div id="container" />
<script>
  var container = document.getElementById('container')
  var options = {
    sampleConfig: 'Overwrite by plugin user',
    onSampleEvent: function (args) {
      console.log('onSampleEvent passed from applicaiton')
    }
  }
  zerounip(container, options)
</script>
```

#### Vue

```
<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <SveltePlugin 
    @onSampleEvent="handleClick" 
    @onSampleEventOver="handleOver" 
    :options="{
       sampleConfig: 'passed from vue js'
    }" />
  </div>
</template>
<script>
import SveltePlugin from '../../../public/zerounip-vue.js'
export default {
  name: 'app',
  components: { SveltePlugin},
  methods: {
    handleOver () {
      console.log('Vue handle mouse over vue js')
    },
    handleClick () {
      alert('alert from vue js')
    }
  }
}
</script>
```

#### React 

```
import React from 'react';
import logo from './logo.svg';
import './App.css';
import SveltePlugin from './zerounip-react.js'
function App() {
  const handleClick = () => alert('alert from react')
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <SveltePlugin onSvelteclick={handleClick} name="(attr passed from react js to svlete)" />
      </header>
    </div>
  );
}

export default App;
```

