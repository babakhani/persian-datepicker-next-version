import React from 'react'
import logo from './logo.svg'
import './App.css'
import SveltePlugin from './zerounip-react.js'
import Styles from './zerounip.css'
export default class TodoApp extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      calendarType: 'persian',
      viewMode: 'day',
      navigatorEnabled: true
    }
  }
  handleChange (key, event) {
    console.log(event.target.value)
    this.setState({
      [key]: event.target.value
    })
  }
  render() {
    return (
      <div className="App">
      <header>
      <img 
      className="platform-logo" 
      src={logo}/>
      <h1>
      Persian Datepicker, React Demo
      </h1>
      </header>
      <div
      className="demo-box" >
      <SveltePlugin
      options={{
        calendarType: this.state.calendarType,
          viewMode: this.state.viewMode,
          navigator: {
            enabled: this.state.navigatorEnabled === 'true',
              scroll:{
                enabled: this.state.navigatorEnabled === 'true'
              }
          }
      }}
      />
      </div>
      <div
      className="config-area" >
      <h3>Settings</h3>
      <label>View Mode </label>
      <select value={this.state.viewMode} onChange={(e) => this.handleChange('viewMode',e)}>
      <option value="day">day</option>
      <option value="month">month</option>
      <option value="year">year</option>
      </select>
      <label>Calendar Type </label>
      <select value={this.state.calendarType} onChange={(e) => this.handleChange('calendarType',e)}>
      <option value="persian">persian</option>
      <option value="gregorian">gregorian</option>
      </select>
      <label>Navigator Enabled </label>
      <select value={this.state.navigatorEnabled} onChange={(e) => this.handleChange('navigatorEnabled',e)}>
      <option value={true}>true</option>
      <option value={false}>false</option>
      </select>
      </div>

      </div>
    )
  }
}
