import React from 'react'

export default class ConfigText extends React.Component {

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
        <input 
          type="text"
          value={this.props.selectValue}
          onChange={this.props.onChange}
          onKeyUp={this.props.onChange}
        />
        <small
          className="help-description"
        >
          { this.props.help }
        </small>
      </div>
    )
  }
}
