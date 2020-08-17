import { getLineByPolygonData } from "../utils/zone-helpers";
import { getRadiusLineLayout, getRadiusLinePaint } from "../utils/map-helpers";

export class IsochroneStrokeLayer {
    /**
     * @param {mapboxgl.Map} map
     * @param {string} id
     */
    constructor(map) {
        this.map = map;
        this.layerId = `isochrone-stroke-layer`;
        this.sourceId = `isochrone-stroke-source`;
    }

    update(polygonData) {
        this.addSource(polygonData);
        this.addLayer();
    }

    addSource(polygonData) {
        if (!polygonData) return;
        const data = getLineByPolygonData(polygonData);
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
            layout: getRadiusLineLayout(),
            paint: getRadiusLinePaint(),
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
