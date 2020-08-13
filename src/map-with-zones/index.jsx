import React from "react";
import mapboxgl from "mapbox-gl";
import "./index.scss";

const mapId = "mapbox-container-element-id";

/**
 * @typedef {object} Props
 * @prop {string} mapStyle
 * @prop {string} mapToken
 *
 * @extends {Component<Props>}
 */
export class MapWithZones extends React.Component {
    componentDidMount() {
        const { mapStyle, mapToken } = this.props;
        if (!mapToken) {
            console.error("Please provide mapbox token, in mapToken prop");
        }
        mapboxgl.accessToken = `${process.env.REACT_APP_MAPBOX_TOKEN}`;
        const style = mapStyle || "mapbox://styles/mapbox/streets-v11";
        new mapboxgl.Map({
            container: mapId,
            style,
        });
    }

    render() {
        return <div id={mapId} />;
    }
}
