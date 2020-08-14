import React from "react";
import mapboxgl from "mapbox-gl";
import { UserControll } from "./controls/user-controll";
import { AdminControll } from "./controls/admin-controll";
import "mapbox-gl/dist/mapbox-gl.css";
import "./index.scss";

const mapId = "mapbox-container-element-id";

export const Cities = {
    Bengaluru: new mapboxgl.LngLat(77.59094323372614, 12.975557791300176),
};

/**
 * @typedef {object} Props
 * @prop {string} mapStyle
 * @prop {string} mapToken
 * @prop {boolean} isAdmin
 * @prop {mapboxgl.LngLat} cityCoor
 *
 * @extends {Component<Props>}
 */
export class MapWithZones extends React.Component {
    componentDidMount() {
        const { mapStyle, mapToken, isAdmin, cityCoor } = this.props;

        mapboxgl.accessToken = mapToken;
        const style = mapStyle || "mapbox://styles/mapbox/streets-v11";

        const map = new mapboxgl.Map({
            container: mapId,
            style,
            center: cityCoor,
            zoom: 12,
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
