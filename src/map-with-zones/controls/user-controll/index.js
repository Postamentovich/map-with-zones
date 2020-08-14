import { MarkerLayer, MarkerLayerEvents } from "../../layers/marker-layer";
import { RadiusLayer } from "../../layers/radius-layer";

export class UserControll {
    data = {
        lngLat: null,
        radius: null,
        zones: [],
    };

    /**
     *
     * @param {mapboxgl.Map} map
     */
    onAdd(map) {
        this.map = map;
        this.container = document.createElement("div");
        this.container.className = "mapboxgl-ctrl";
        this.init();
        return this.container;
    }

    onRemove() {
        this.container.parentNode.removeChild(this.container);
        this.map = undefined;
    }

    init() {
        this.markerLayer = new MarkerLayer(this.map);
        this.radiusLayer = new RadiusLayer(this.map);
        this.markerLayer.on(MarkerLayerEvents.dragend, this.onDragEndMarker);
        this.markerLayer.on(MarkerLayerEvents.radiusChanged, this.onRadiusChanged);
        this.map.once("click", this.onMapClick);
    }

    onRadiusChanged = ({ radius }) => {
        this.data.radius = radius;
        this.updateRadiusLayer();
    };

    onDragEndMarker = ({ lngLat }) => {
        this.data.lngLat = lngLat;
        this.updateRadiusLayer();
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
    };
}
