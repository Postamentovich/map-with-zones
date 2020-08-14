import { getDataByCoordinates } from "../utils/get-data-by-coordinates";
import { DEFAULT_ZONE_LAYER_COLOR } from "../utils/constants";

export class ZoneLayer {
    /**
     * @param {mapboxgl.Map} map
     * @param {string} id
     */
    constructor(map, id, options) {
        const color = (options && options.color) || DEFAULT_ZONE_LAYER_COLOR;
        this.map = map;
        this.layerId = `zone-layer-${id}`;
        this.sourceId = `zone-source-${id}`;
        this.id = id;
        this.color = color;
    }

    /**
     *
     * @param {number} radius
     * @param {mapboxgl.LngLat} coor
     */
    update(coordinates) {
        this.addSource(coordinates);
        this.addLayer();
    }

    setColor(color) {
        this.map.setPaintProperty(this.layerId, "fill-color", color);
    }

    /**
     * @param {number} radius
     * @param {mapboxgl.LngLat} coor
     */
    addSource(coordinates) {
        const data = getDataByCoordinates(coordinates, this.id);
        if (!data) return;

        const source = this.getSource();
        if (source) {
            return source.setData(data);
        }

        this.map.addSource(this.sourceId, { type: "geojson", data });
    }

    addLayer() {
        if (this.gerLayer() || !this.getSource()) return;

        this.map.addLayer({
            id: this.layerId,
            source: this.sourceId,
            type: "fill",
            layout: {},
            paint: {
                "fill-color": this.color,
                "fill-opacity": 0.5,
                "fill-outline-color": "transparent",
            },
        });
    }

    remove() {
        if (this.gerLayer()) this.map.removeLayer(this.layerId);
        if (this.getSource()) this.map.removeSource(this.sourceId);
    }

    getSource() {
        return this.map.getSource(this.sourceId);
    }

    gerLayer() {
        return this.map.getLayer(this.layerId);
    }
}
