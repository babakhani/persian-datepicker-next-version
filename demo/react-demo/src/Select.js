import React from 'react'

export default class ConfigSelect extends React.Component {

  constructor(props) {
    super(props)
  }

  render () {

    let options = ( 
      this.props.options.map((option, index) => {
      return <option
        value={option.value}
        key={index}>{option.label}</option>
      })
    )

    return (
      <div
        className="config-selector-element"
      >
        <label>
          {this.props.label}
        </label>
        <select
          value={this.props.selectValue}
          onChange={this.props.onChange}
        >
          {options}
        </select>
        <small
          className="help-description"
        >
          { this.props.help }
        </small>
      </div>
    )
  }
}
