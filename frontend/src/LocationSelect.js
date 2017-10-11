import React, { Component } from "react";

class LocationSelect extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  // Tell app location has changed.
  handleChange(event) {
    this.props.onLocationChange(event.target.value);
  }

  render() {
    // Create a select with locations as options.
    const locations = this.props.locations.map((location, index) => (
      <option value={location} key={index}>
        {location}
      </option>
    ));

    const locationStyle = {
      display: "inline-block",
      textAlign: "left",
      width: "180px",
      margin: "15px"
    };

    return (
      <div>
        <label style={locationStyle}>Location</label>
        <select value={this.props.location} onChange={this.handleChange}>
          {locations}
        </select>
      </div>
    );
  }
}

export default LocationSelect;
