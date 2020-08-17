import { DEFAULT_ZONE_LAYER_COLOR } from "../utils/constants";
import { getDrawingLine } from "../utils/zone-helpers";
import { getZoneLineLayout, getZoneLinePaint } from "../utils/map-helpers";

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
            layout: getZoneLineLayout(),
            paint: getZoneLinePaint(this.color),
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
