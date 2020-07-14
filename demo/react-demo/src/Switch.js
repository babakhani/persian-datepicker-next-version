import React from 'react'

export default class ConfigSwitch extends React.Component {

  constructor(props) {
    super(props)
  }

  render () {

    return (
      <div
        className="config-selector-element"
      >
        <label>
          {this.props.label}
        </label>
        <label className="switch">
          <input 
            type="checkbox"
            checked={this.props.selectValue}
            onChange={this.props.onChange}
          />
          <span className="slider" data-toggle="tooltip"
            data-placement="bottom"
            title="right someThings here!">
          </span>
        </label>
        <small
          className="help-description"
        >
          { this.props.help }
        </small>
      </div>
    )
  }
}
