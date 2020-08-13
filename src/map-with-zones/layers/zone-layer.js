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
    update(radius, coor) {
        if (radius > 0) {
            this.addSource(radius, coor);
            this.addLayer();
        } else {
            this.removeLayer();
        }
    }

    /**
     *
     * @param {number} radius
     * @param {mapboxgl.LngLat} coor
     */
    addSource(radius, coor) {
        // const source = this.getSource();
        // const circle = turf.circle(coor.toArray(), radius);
        // const data = turf.featureCollection([circle]);
        // if (source) {
        //     source.setData(data);
        // } else {
        //     this.map.addSource(this.sourceId, { type: "geojson", data });
        // }
    }

    addLayer() {
        if (this.gerLayer()) return;

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
