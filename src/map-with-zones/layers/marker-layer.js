import mapboxgl from "mapbox-gl";

export const MarkerLayerEvents = {
    dragend: "dragend",
};

export class MarkerLayer extends mapboxgl.Evented {
    constructor(map) {
        super();
        /** @type{mapboxgl.Map} */
        this.map = map;
        /** @type{mapboxgl.Marker} */
        this.marker = new mapboxgl.Marker({
            draggable: true,
        });
    }

    /**
     * @param {mapboxgl.LngLat} coor
     */
    update(coor) {
        this.marker.setLngLat(coor.toArray()).addTo(this.map);
        this.marker.on("dragend", this.onDragEnd);
    }

    onDragEnd = () => {
        const lngLat = this.marker.getLngLat();
        this.fire(MarkerLayerEvents.dragend, { lngLat });
    };
}
