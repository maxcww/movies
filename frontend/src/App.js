import React, { Component } from "react";
import LocationSelect from "./LocationSelect.js";
import Filter from "./Filter.js";
import MovieMap from "./MovieMap.js";
console.log(process.env);
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      movies: [],
      locations: [],
      location: "",
      columns: [],
      options: false,
      center: null
    };

    this.handleLocationChange = this.handleLocationChange.bind(this);
    this.handleOptionsClick = this.handleOptionsClick.bind(this);
    this.handleFilterClick = this.handleFilterClick.bind(this);
    this.onResult = this.onResult.bind(this);

    const platform = new window.H.service.Platform({
      app_id: process.env.APP_ID,
      app_code: process.env.APP_CODE
    });
    this.geocoder = platform.getGeocodingService();
  }

  setLocationAndColumns(location) {
    fetch(
      `http://${process.env.HOST}:${process.env.APP_PORT}/columns/` + location
    )
      .then(res => res.json())
      .then(columns => {
        this.setState({
          location: location,
          columns: columns
        });
        // We also need the geocode of the location for the map.
        this.geocodeAddress(location);
      });
  }

  getLocationsAndColumns() {
    fetch(`http://${process.env.HOST}:${process.env.APP_PORT}/locations`)
      .then(res => res.json())
      .then(locations => {
        const locs = locations.map(location => {
          return location["name"];
        });
        this.setState({ locations: locs });
        this.setLocationAndColumns(locs[0]);
      });
  }

  postMovies(values) {
    fetch(
      `http://${process.env.HOST}:${process.env.APP_PORT}/movies/` +
        this.state.location,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          columns: this.state.columns,
          values: values
        })
      }
    )
      .then(res => res.json())
      .then(data => {
        this.setState({ movies: data });
      });
  }

  onResult(result) {
    const locations = result.Response.View[0].Result;
    this.setState({
      center: {
        lat: locations[0].Location.DisplayPosition.Latitude,
        lng: locations[0].Location.DisplayPosition.Longitude
      }
    });
  }

  geocodeAddress(address) {
    this.geocoder.geocode({ searchText: address }, this.onResult, function(e) {
      console.log(e);
    });
  }

  componentDidMount() {
    this.getLocationsAndColumns();
  }

  handleLocationChange(location) {
    this.setLocationAndColumns(location);
  }

  handleOptionsClick() {
    this.setState({ options: !this.state.options });
  }

  handleFilterClick(values) {
    this.postMovies(values);
  }

  render() {
    const locations = this.state.locations;
    const location = this.state.location;
    const movies = this.state.movies;
    const columns = this.state.columns;
    const center = this.state.center;
    let filter = null;
    let markers = [];

    if (columns.length !== 0) {
      filter = (
        <Filter
          columns={columns}
          location={location}
          onFilterClick={this.handleFilterClick}
        />
      );
    }

    if (movies.length !== 0) {
      markers = movies.map(movie => {
        return new window.google.maps.Marker({
          position: movie["Geocode"],
          map: null
        });
      });
    }

    const moviemap =
      location === "" ? null : (
        <MovieMap center={center} movies={movies} markers={markers} />
      );

    const appHeader = {
      backgroundColor: "#222",
      height: "7%",
      padding: "1%",
      color: "white",
      textAlign: "center"
    };

    const optionsStyle = {
      display: "block",
      cursor: "pointer",
      float: "left"
    };

    let navbarStyle = {
      width: "360px",
      zIndex: "1000",
      overflowX: "hidden",
      height: "100%",
      position: "fixed",
      paddingLeft: "20px",
      color: "white",
      backgroundColor: "#222"
    };

    const divStyle = {
      height: "100%",
      width: "100%",
      overflowY: "hidden"
    };

    // Hides/shows the navigation side bar.
    if (!this.state.options) {
      navbarStyle.width = "0px";
      navbarStyle.paddingLeft = "0px";
    }

    return (
      <div style={divStyle}>
        <header style={appHeader}>
          <h2 style={optionsStyle} onClick={this.handleOptionsClick}>
            &#9776; Options
          </h2>
          <h2>Welcome to San Francisco Movies</h2>
        </header>

        <div style={navbarStyle}>
          <LocationSelect
            locations={locations}
            location={location}
            onLocationChange={this.handleLocationChange}
          />

          {filter}
        </div>

        {moviemap}
      </div>
    );
  }
}

export default App;
