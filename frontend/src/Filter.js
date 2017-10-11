import React, { Component } from "react";
import FilterInput from "./FilterInput.js";

class Filter extends Component {
  constructor(props) {
    super(props);
    const columns = this.props.columns;
    this.state = {
      values: columns.map(column => {
        return "";
      }),
      suggestions: columns.map(column => {
        return [];
      })
    };

    this.handleInputChangeOrFocus = this.handleInputChangeOrFocus.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  getSuggestions(values, index) {
    fetch(
      `http://${process.env.HOST}:${process.env.APP_PORT}/suggestions/` +
        this.props.location,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          columns: this.props.columns,
          values: values,
          index: index
        })
      }
    )
      .then(res => res.json())
      .then(data => {
        const suggestions = this.state.suggestions;
        suggestions[index] = data["suggestions"];
        this.setState({ suggestions });
      });
  }

  // Change the old value of the input into the new value and get new
  // suggestions from app.
  handleInputChangeOrFocus(value, index) {
    const values = this.state.values;
    values[index] = value;
    this.setState({ values });

    // No suggestions will be retrieved if the value is blanco.
    if (value !== "")
      // Don't use state.values in getSuggestions as values is updated
      // asynchronously.
      this.getSuggestions(values, index);
  }

  handleSubmit(event) {
    event.preventDefault();
    this.props.onFilterClick(this.state.values);
  }

  render() {
    const inputs = this.props.columns.map((column, index) => {
      return (
        <FilterInput
          value={this.state.values[index]}
          key={index}
          index={index}
          column={column}
          onInputChangeOrFocus={this.handleInputChangeOrFocus}
          suggestions={this.state.suggestions[index]}
        />
      );
    });

    const submitStyle = {
      margin: "auto",
      display: "block"
    };

    return (
      <form onSubmit={this.handleSubmit} className="FilerForm">
        {inputs}
        <input style={submitStyle} type="submit" value="Filter" />
      </form>
    );
  }
}

export default Filter;
