import React, { Component } from "react";

function convertDictToString(dict) {
  let contentString = ``;
  Object.keys(dict).forEach(col => {
    if (dict[col] != null && col !== "Geocode") {
      contentString += `<div><b>${col}:</b> ${dict[col]}</div>`;
    }
  });
  return contentString;
}

class MovieMap extends Component {
  constructor(props) {
    super(props);
    this.zoom = 13;
  }

  componentDidUpdate(prevProps, prevState) {
    // Check if we need to update the center of the map.
    if (prevProps.center !== this.props.center) {
      this.map = this.loadMap();
    }
  }

  componentWillReceiveProps(nextProps) {
    // Only update the markers if there were changes to the movies.
    const areNotTheSame =
      nextProps.movies !== this.props.movies &&
      JSON.stringify(nextProps.movies) !== JSON.stringify(this.props.movies);

    if (areNotTheSame) {
      // Remove last markers from the map
      this.props.markers.forEach(marker => {
        marker.setMap(null);
      });
      // Add the new ones on the map
      nextProps.markers.forEach((marker, index) => {
        const contentString = convertDictToString(nextProps.movies[index]);
        const infoWindow = new window.google.maps.InfoWindow({
          content: contentString
        });
        marker.setMap(this.map);
        marker.addListener("click", () => {
          infoWindow.open(this.map, marker);
        });
      });
    }
  }

  loadMap() {
    return new window.google.maps.Map(this.refs.mapCanvas, {
      center: this.props.center,
      zoom: this.zoom
    });
  }

  render() {
    const divStyle = {
      height: "91%",
      width: "100%"
    };

    return (
      <div ref="mapCanvas" style={divStyle}>
        Loading map...
      </div>
    );
  }
}

export default MovieMap;
