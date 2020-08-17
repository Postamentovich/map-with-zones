import React from "react";
import ReactDOM from "react-dom";
import { MarkerLayer, MarkerLayerEvents } from "../layers/marker-layer";
import { RadiusLayer } from "../layers/radius-layer";
import { getDefaultUserData, isZoneIntersectedRadius, isZoneIntersectedTime } from "../utils/zone-helpers";
import { UserApi } from "../api/user-api";
import { MAP_ID, RadiusModes } from "../utils/constants";
import { ZoneTable } from "../componets/zone-table";
import { IsochroneLayer } from "../layers/isochrone-layer";

export class UserControll {
    data = getDefaultUserData();
    radiusMode = RadiusModes.time;
    itHasPoint = false;

    /**
     * @param {import('./zone-controll').ZoneControll} zoneControll
     */
    constructor(zoneControll) {
        this.zoneControll = zoneControll;
        this.userApi = new UserApi();
    }

    /**
     * @param {mapboxgl.Map} map
     */
    onAdd(map) {
        this.map = map;
        this.container = document.createElement("div");
        this.container.className = "mapboxgl-ctrl";
        this.table = document.createElement("div");
        const mapElement = document.getElementById(MAP_ID);
        if (mapElement) mapElement.appendChild(this.table);
        this.enableUserMode();
        return this.container;
    }

    onRemove() {
        this.disableUserMode();
        if (this.table) this.table.parentNode.removeChild(this.table);
        if (this.container) this.container.parentNode.removeChild(this.container);
        this.data = getDefaultUserData();
        this.itHasPoint = false;
        this.map = undefined;
    }

    disableUserMode() {
        if (this.markerLayer) this.markerLayer.remove();
        if (this.radiusLayer) this.radiusLayer.remove();
        if (this.isochroneLayer) this.isochroneLayer.remove();
        if (this.map) this.map.off("click", this.onMapClick);
        this.removeUserTable();
    }

    updateUserTable() {
        ReactDOM.render(<ZoneTable itHasPoint={this.itHasPoint} zones={this.data.zones} />, this.table);
    }

    removeUserTable() {
        if (this.table) ReactDOM.unmountComponentAtNode(this.table);
    }

    enableUserMode() {
        this.markerLayer = new MarkerLayer(this.map);
        this.radiusLayer = new RadiusLayer(this.map);
        this.isochroneLayer = new IsochroneLayer(this.map);
        this.markerLayer.on(MarkerLayerEvents.dragend, this.onDragEndMarker);
        this.markerLayer.on(MarkerLayerEvents.radiusChanged, this.onRadiusChanged);
        this.markerLayer.on(MarkerLayerEvents.buttonClick, this.onButtonClick);
        this.markerLayer.on(MarkerLayerEvents.modeChanged, this.onModeChanged);
        this.markerLayer.on(MarkerLayerEvents.timeChanged, this.onTimeChanged);
        this.map.once("click", this.onMapClick);
        this.updateUserTable();
    }

    onTimeChanged = ({ time }) => {
        this.data.time = time;
        this.updateRadiusLayer();
    };

    onModeChanged = ({ mode }) => {
        this.data.mode = mode;
        this.updateRadiusLayer();
    };

    onButtonClick = async () => {
        await this.userApi.sendInfoAboutIncludedZones(this.data);
    };

    onRadiusChanged = ({ radius }) => {
        this.data.radius = radius;
        this.updateRadiusLayer();
    };

    onDragEndMarker = ({ lngLat }) => {
        this.data.lngLat = lngLat;
        this.updateRadiusLayer();
    };

    findZonesInRadius() {
        const isTimeMode = this.data.mode === RadiusModes.time;
        const isDistanceMode = this.data.mode === RadiusModes.distance;
        const hasRadius = isDistanceMode && this.data.radius > 0;
        const hasTime = isTimeMode && this.data.time > 0;

        if (!this.data.lngLat || (!hasRadius && !hasTime)) {
            this.data.zones = [];
            this.updateUserTable();
            return;
        }

        const zones = this.zoneControll.getZoneList();
        const polygonData = this.isochroneLayer.getFeatureCollection();

        const intersectedZones = zones.filter((zone) => {
            if (isDistanceMode) return isZoneIntersectedRadius(this.data.radius, this.data.lngLat, zone.coordinates);
            return isZoneIntersectedTime(polygonData, zone.coordinates);
        });

        this.data.zones = intersectedZones.map((el) => ({ name: el.name, id: el.id }));

        this.updateUserTable();
    }

    async updateRadiusLayer() {
        if (!this.data.lngLat) return;

        if (this.data.mode === RadiusModes.time) {
            if (this.radiusLayer) this.radiusLayer.remove();
            await this.isochroneLayer.update(this.data.time, this.data.lngLat);
        } else {
            if (this.isochroneLayer) this.isochroneLayer.remove();
            this.radiusLayer.update(this.data.radius, this.data.lngLat);
        }

        this.findZonesInRadius();
    }

    onMapClick = (e) => {
        this.markerLayer.init(e.lngLat, this.data);
        this.data.lngLat = e.lngLat;
        this.itHasPoint = true;
        this.updateRadiusLayer();
        this.updateUserTable();
    };
}
