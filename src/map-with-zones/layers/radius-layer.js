import { getCircleByRadius } from "../utils/zone-helpers";
import { DEFAULT_RADIUS_LAYER_COLOR } from "../utils/constants";
import { RadiusStrokeLayer } from "./radius-stroke-layer";

export class RadiusLayer {
    layerId = "radius-layer";
    sourceId = "radius-source";

    /**
     *
     * @param {mapboxgl.Map} map
     */
    constructor(map) {
        this.map = map;
        this.strokeLayer = new RadiusStrokeLayer(map);
    }

    update(radius, coor) {
        if (radius > 0) {
            this.addSource(radius, coor);
            this.addLayer();
            this.strokeLayer.update(radius, coor);
        } else {
            this.remove();
        }
    }

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
                "fill-color": DEFAULT_RADIUS_LAYER_COLOR,
                "fill-opacity": 0.4,
            },
        });
    }

    remove() {
        if (this.gerLayer()) this.map.removeLayer(this.layerId);
        if (this.getSource()) this.map.removeSource(this.sourceId);
        this.strokeLayer.remove();
    }

    getSource() {
        return this.map.getSource(this.sourceId);
    }

    gerLayer() {
        return this.map.getLayer(this.layerId);
    }
}
