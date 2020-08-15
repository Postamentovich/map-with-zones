import * as turf from "@turf/turf";
import { MarkerLayer, MarkerLayerEvents } from "../layers/marker-layer";
import { RadiusLayer } from "../layers/radius-layer";
import { createUserControllTable, setUserTableTitle, setUserTableZones, removeUserTable } from "../utils/dom-helpers";
import { getCircleByRadius, getZonePolygonByCoordinates, getDefaultUserData } from "../utils/zone-helpers";
import { UserApi } from "../api/user-api";

export class UserControll {
    data = getDefaultUserData();

    /**
     * @param {import('./zone-controll').ZoneControll} zoneControll
     */
    constructor(zoneControll) {
        this.zoneControll = zoneControll;
        this.userApi = new UserApi();
    }

    /**
     *
     * @param {mapboxgl.Map} map
     */
    onAdd(map) {
        this.map = map;
        this.container = document.createElement("div");
        this.container.className = "mapboxgl-ctrl";
        this.enableUserMode();
        return this.container;
    }

    onRemove() {
        this.disableUserMode();
        this.container.parentNode.removeChild(this.container);
        this.data = getDefaultUserData();
        this.map = undefined;
    }

    disableUserMode() {
        if (this.markerLayer) this.markerLayer.remove();
        if (this.radiusLayer) this.radiusLayer.remove();
        this.map.off("click", this.onMapClick);
        removeUserTable();
    }

    enableUserMode() {
        this.markerLayer = new MarkerLayer(this.map);
        this.radiusLayer = new RadiusLayer(this.map);
        this.markerLayer.on(MarkerLayerEvents.dragend, this.onDragEndMarker);
        this.markerLayer.on(MarkerLayerEvents.radiusChanged, this.onRadiusChanged);
        this.markerLayer.on(MarkerLayerEvents.buttonClick, this.onButtonClick);
        this.map.once("click", this.onMapClick);
        createUserControllTable();
        setUserTableTitle("Set point on the map");
    }

    onButtonClick = async () => {
        await this.userApi.sendInfoAboutIncludedZones(this.data);
    };

    findZonesInRadius() {
        if (!this.data.lngLat || !this.data.radius) {
            return setUserTableZones([]);
        }
        const circle = getCircleByRadius(this.data.lngLat, this.data.radius);
        const zones = this.zoneControll.getZoneList();
        const intersectedZones = zones.filter((zone) => {
            const polygon = getZonePolygonByCoordinates(zone.coordinates, zone.id);
            const intersection = turf.intersect(circle, polygon);
            return !!intersection;
        });
        this.data.zones = intersectedZones.map((el) => ({ name: el.name, id: el.id }));
        setUserTableZones(intersectedZones);
    }

    onRadiusChanged = ({ radius }) => {
        this.data.radius = radius;
        this.updateRadiusLayer();
        this.findZonesInRadius();
    };

    onDragEndMarker = ({ lngLat }) => {
        this.data.lngLat = lngLat;
        this.updateRadiusLayer();
        this.findZonesInRadius();
    };

    updateRadiusLayer() {
        if (!this.data.lngLat) return;
        this.radiusLayer.update(this.data.radius, this.data.lngLat);
    }

    /**
     * @param {mapboxgl.MapMouseEvent & mapboxgl.EventData} e
     */
    onMapClick = (e) => {
        this.markerLayer.update(e.lngLat);
        this.data.lngLat = e.lngLat;
        this.findZonesInRadius();
        this.updateRadiusLayer();
        setUserTableTitle("You have selected the following zones:");
    };
}
