import { MarkerLayer, MarkerLayerEvents } from "../../layers/marker-layer";

export class UserControll {
    constructor() {
        this.handleMapClick = this.handleMapClick.bind(this);
    }

    onAdd(map) {
        /** @type{mapboxgl.Map} */
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
        // this.addImagesToMap();
        this.markerLayer = new MarkerLayer(this.map);
        this.markerLayer.on(MarkerLayerEvents.dragend, ({ lngLat }) => {
            console.log(lngLat);
        });
        this.map.on("click", this.handleMapClick);
    }

    /**
     *
     * @param {mapboxgl.MapMouseEvent & mapboxgl.EventData} e
     */
    handleMapClick(e) {
        this.markerLayer.update(e.lngLat);
        console.log(e.lngLat);
    }
}
