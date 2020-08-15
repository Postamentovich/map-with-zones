import { getLineByRadius } from "../utils/zone-helpers";
import { DEFAULT_RADIUS_LAYER_COLOR } from "../utils/constants";

export class RadiusStrokeLayer {
    /**
     *
     * @param {mapboxgl.Map} map
     * @param {string} id
     */
    constructor(map) {
        this.map = map;
        this.layerId = `radius-stroke-layer`;
        this.sourceId = `radius-stroke-source`;
    }

    update(radius, coor) {
        this.addSource(radius, coor);
        this.addLayer();
    }

    addSource(radius, coor) {
        const data = getLineByRadius(coor, radius);
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
            type: "line",
            layout: {
                "line-join": "round",
                "line-cap": "round",
            },
            paint: {
                "line-color": DEFAULT_RADIUS_LAYER_COLOR,
                "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 5, 1, 16, 6],
                "line-dasharray": [5, 3],
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
