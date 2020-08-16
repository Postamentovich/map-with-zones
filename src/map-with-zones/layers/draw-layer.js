import { DEFAULT_ZONE_LAYER_COLOR } from "../utils/constants";
import { getDrawingLine } from "../utils/zone-helpers";

export class DrawLayer {
    /**
     * @param {mapboxgl.Map} map
     * @param {string} id
     */
    constructor(map, id, options) {
        const color = (options && options.color) || DEFAULT_ZONE_LAYER_COLOR;
        this.map = map;
        this.layerId = `zone-stroke-layer-${id}`;
        this.sourceId = `zone-stroke-source-${id}`;
        this.id = id;
        this.color = color;
    }

    update(coordinates) {
        this.addSource(coordinates);
        this.addLayer();
    }

    addSource(coordinates) {
        const data = getDrawingLine(coordinates, this.id);
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
                "line-color": this.color,
                "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 5, 1, 16, 6],
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
