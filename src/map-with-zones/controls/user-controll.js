import * as turf from "@turf/turf";
import { MarkerLayer, MarkerLayerEvents } from "../layers/marker-layer";
import { RadiusLayer } from "../layers/radius-layer";
import { createUserControllTable, setUserTableTitle } from "../utils/dom-helpers";
import { getCircleByRadius, getZonePolygonByCoordinates } from "../utils/zone-helpers";

export class UserControll {
    data = {
        lngLat: null,
        radius: null,
        zones: [],
    };

    /**
     *
     * @param {import('./zone-controll').ZoneControll} zoneControll
     */
    constructor(zoneControll) {
        this.zoneControll = zoneControll;
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
        this.map = undefined;
    }

    disableUserMode() {
        if (this.markerLayer) this.markerLayer.remove();
        if (this.radiusLayer) this.radiusLayer.remove();
        this.map.off("click", this.onMapClick);
    }

    enableUserMode() {
        this.markerLayer = new MarkerLayer(this.map);
        this.radiusLayer = new RadiusLayer(this.map);
        this.markerLayer.on(MarkerLayerEvents.dragend, this.onDragEndMarker);
        this.markerLayer.on(MarkerLayerEvents.radiusChanged, this.onRadiusChanged);
        this.map.once("click", this.onMapClick);
        createUserControllTable();
        setUserTableTitle("Set point on the map");
    }

    findZonesInRadius() {
        if (!this.data.lngLat || !this.data.radius) return;
        const circle = getCircleByRadius(this.data.lngLat, this.data.radius);
        const zones = this.zoneControll.getZoneList();
        const intersectedZones = zones.filter((zone) => {
            const polygon = getZonePolygonByCoordinates(zone.coordinates, zone.id);
            const intersection = turf.intersect(circle, polygon);
            return !!intersection;
        });
        console.log(intersectedZones);
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
        this.radiusLayer.update(this.data.radius, this.data.lngLat);
    }

    /**
     * @param {mapboxgl.MapMouseEvent & mapboxgl.EventData} e
     */
    onMapClick = (e) => {
        this.markerLayer.update(e.lngLat);
        this.data.lngLat = e.lngLat;
        this.findZonesInRadius();
        setUserTableTitle("You have selected the following zones:");
    };
}
