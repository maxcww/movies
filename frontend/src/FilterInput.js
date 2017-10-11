import React, { Component } from "react";

class FilterInput extends Component {
  constructor(props) {
    super(props);
    this.handleChangeOrFocus = this.handleChangeOrFocus.bind(this);
  }

  // Tell filter an input value has changed.
  handleChangeOrFocus(event) {
    this.props.onInputChangeOrFocus(event.target.value, this.props.index);
  }

  render() {
    const column = this.props.column;
    const index = this.props.index;
    const value = this.props.value;
    const suggestions =
      value === ""
        ? null
        : this.props.suggestions.map((suggestion, index) => {
            return <option value={suggestion} key={index} />;
          });

    const labelStyle = {
      display: "inline-block",
      textAlign: "left",
      width: "180px",
      marginBottom: "15px"
    };

    return (
      <div>
        <label style={labelStyle}>{column}</label>
        <input
          type="text"
          onChange={this.handleChangeOrFocus}
          value={value}
          list={"list" + index}
        />
        <datalist id={"list" + index}>{suggestions}</datalist>
      </div>
    );
  }
}

export default FilterInput;
