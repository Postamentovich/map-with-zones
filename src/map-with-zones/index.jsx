import React from "react";
import mapboxgl from "mapbox-gl";
import { UserControll } from "./controls/user-controll";
import { AdminControll } from "./controls/admin-controll";
import "mapbox-gl/dist/mapbox-gl.css";
import "./index.scss";

const mapId = "mapbox-container-element-id";

/**
 * @typedef {object} Props
 * @prop {string} mapStyle
 * @prop {string} mapToken
 * @prop {boolean} isAdmin
 *
 * @extends {Component<Props>}
 */
export class MapWithZones extends React.Component {
    componentDidMount() {
        const { mapStyle, mapToken, isAdmin } = this.props;

        mapboxgl.accessToken = mapToken;
        const style = mapStyle || "mapbox://styles/mapbox/streets-v11";

        const map = new mapboxgl.Map({
            container: mapId,
            style,
        });

        const userControll = new UserControll();
        const adminControll = new AdminControll();

        if (isAdmin) {
            map.addControl(adminControll);
        } else {
            map.addControl(userControll);
        }
    }

    render() {
        return <div id={mapId} />;
    }
}
