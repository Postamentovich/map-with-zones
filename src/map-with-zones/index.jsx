import React from "react";
import PropTypes from "prop-types";
import mapboxgl from "mapbox-gl";
import { UserControll } from "./controls/user-controll";
import { AdminControll } from "./controls/admin-controll";
import { ZoneControll } from "./controls/zone-controll";
import { MAP_ID } from "./utils/constants";
import "mapbox-gl/dist/mapbox-gl.css";
import "./index.scss";

/** Collection of cities coordinates */
export const Cities = {
    Bengaluru: new mapboxgl.LngLat(77.59094323372614, 12.975557791300176),
};

/**
 * Map with Zones Component
 *
 * @typedef {object} Props
 * @prop {string} mapToken - Mapbox token (https://docs.mapbox.com/help/how-mapbox-works/access-tokens/)
 * @prop {string} mapStyle - Mapbox map style (https://docs.mapbox.com/vector-tiles/reference/)
 * @prop {boolean} isAdmin - Selecting the use mode Admin or User
 * @prop {mapboxgl.LngLat} cityCoor - Сity coordinates
 *
 * @extends {React.Component<Props>}
 */
export class MapWithZones extends React.Component {
    componentDidMount() {
        const { mapStyle, mapToken, isAdmin, cityCoor } = this.props;

        mapboxgl.accessToken = mapToken;

        this.map = new mapboxgl.Map({
            container: MAP_ID,
            style: mapStyle,
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

MapWithZones.defaultProps = {
    mapStyle: "mapbox://styles/mapbox/streets-v11",
    isAdmin: false,
    cityCoor: Cities.Bengaluru,
};

MapWithZones.propTypes = {
    mapToken: PropTypes.string.isRequired,
    mapStyle: PropTypes.string,
    isAdmin: PropTypes.bool,
    cityCoor: PropTypes.instanceOf(mapboxgl.LngLat),
};
