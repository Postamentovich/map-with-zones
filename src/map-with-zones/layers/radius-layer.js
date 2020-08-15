import { getCircleByRadius } from "../utils/zone-helpers";

export class RadiusLayer {
    layerId = "radius-layer";
    sourceId = "radius-source";

    /**
     *
     * @param {mapboxgl.Map} map
     */
    constructor(map) {
        this.map = map;
    }

    /**
     *
     * @param {number} radius
     * @param {mapboxgl.LngLat} coor
     */
    update(radius, coor) {
        if (radius > 0) {
            this.addSource(radius, coor);
            this.addLayer();
        } else {
            this.remove();
        }
    }

    /**
     *
     * @param {number} radius
     * @param {mapboxgl.LngLat} coor
     */
    addSource(radius, coor) {
        const source = this.getSource();
        const data = getCircleByRadius(coor, radius);
        if (source) {
            source.setData(data);
        } else {
            this.map.addSource(this.sourceId, { type: "geojson", data });
        }
    }

    addLayer() {
        if (this.gerLayer()) return;

        this.map.addLayer({
            id: this.layerId,
            source: this.sourceId,
            type: "fill",
            paint: {
                "fill-color": "#088",
                "fill-opacity": 0.8,
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
