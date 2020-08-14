import * as turf from "@turf/turf";
export class ZoneLayer {
    /**
     * @param {mapboxgl.Map} map
     * @param {string} id
     */
    constructor(map, id) {
        this.map = map;
        this.layerId = `zone-${id}-layer`;
        this.sourceId = `zone-${id}-source`;
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

    /**
     *
     * @param {number} radius
     * @param {mapboxgl.LngLat} coor
     */
    addSource(coordinates) {
        const source = this.getSource();
        const line = turf.lineString(coordinates);
        const simlified = turf.simplify(line, { tolerance: 0.00001 });

        if (simlified.geometry.coordinates.length < 4) return;

        const polygon = turf.lineToPolygon(simlified);
        const data = turf.featureCollection([polygon]);

        if (source) {
            source.setData(data);
        } else {
            this.map.addSource(this.sourceId, { type: "geojson", data });
        }
    }

    addLayer() {
        if (this.gerLayer() || !this.getSource()) return;

        this.map.addLayer({
            id: this.layerId,
            source: this.sourceId,
            type: "fill",
            layout: {},
            paint: {
                "fill-color": "#088",
                "fill-opacity": 0.8,
            },
        });
    }

    removeLayer() {
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
