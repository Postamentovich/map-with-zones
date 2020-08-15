import React from "react";
import mapboxgl from "mapbox-gl";
import { UserControll } from "./controls/user-controll";
import { AdminControll } from "./controls/admin-controll";
import "mapbox-gl/dist/mapbox-gl.css";
import "./index.scss";
import { ZoneControll } from "./controls/zone-controll";
import { MAP_ID } from "./utils/constants";

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
 * @extends {React.Component<Props>}
 */
export class MapWithZones extends React.Component {
    componentDidMount() {
        const { mapStyle, mapToken, isAdmin, cityCoor } = this.props;

        mapboxgl.accessToken = mapToken;
        const style = mapStyle || "mapbox://styles/mapbox/streets-v11";

        this.map = new mapboxgl.Map({
            container: MAP_ID,
            style,
            center: cityCoor,
            zoom: 12,
        });

        this.zoneControll = new ZoneControll();
        this.map.addControl(this.zoneControll);
        this.userControll = new UserControll(this.zoneControll);
        this.adminControll = new AdminControll(this.zoneControll);

        if (isAdmin) {
            this.map.addControl(this.adminControll);
        } else {
            this.map.addControl(this.userControll);
        }
    }

    componentDidUpdate(prevProps) {
        const { isAdmin } = this.props;

        if (isAdmin !== prevProps.isAdmin) {
            if (!this.map) return;
            if (isAdmin) {
                this.map.removeControl(this.userControll);
                this.map.addControl(this.adminControll);
            } else {
                this.map.removeControl(this.adminControll);
                this.map.addControl(this.userControll);
            }
        }
    }

    render() {
        return <div id={MAP_ID} />;
    }
}
