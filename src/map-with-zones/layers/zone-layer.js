import { getZonePolygonByCoordinates } from "../utils/zone-helpers";
import { DEFAULT_ZONE_LAYER_COLOR } from "../utils/constants";
import { ZoneStrokeLayer } from "./zone-stroke-layer";
import { ZoneNameLayer } from "./zone-name-layer";

export class ZoneLayer {
    /**
     * @param {mapboxgl.Map} map
     * @param {string} id
     */
    constructor(map, id, options) {
        this.map = map;
        this.layerId = `zone-layer-${id}`;
        this.sourceId = `zone-source-${id}`;
        this.id = id;
        this.color = (options && options.color) || DEFAULT_ZONE_LAYER_COLOR;
        this.name = options && options.name;
        this.strokeLayer = new ZoneStrokeLayer(map, id, options);
        this.nameLayer = new ZoneNameLayer(map, id, options);
    }

    /**
     *
     * @param {number} radius
     * @param {mapboxgl.LngLat} coor
     */
    update(coordinates, isEdit = false) {
        this.addSource(coordinates);
        this.addLayer();
        this.strokeLayer.update(coordinates);
        if (!isEdit) this.nameLayer.update(coordinates);
    }

    setColor(color) {
        this.color = color;
        this.map.setPaintProperty(this.layerId, "fill-color", color);
        this.strokeLayer.setColor(color);
    }

    /**
     * @param {number} radius
     * @param {mapboxgl.LngLat} coor
     */
    addSource(coordinates) {
        const data = getZonePolygonByCoordinates(coordinates, this.id);
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
        this.strokeLayer.remove();
        this.nameLayer.remove();
    }

    getSource() {
        return this.map.getSource(this.sourceId);
    }

    gerLayer() {
        return this.map.getLayer(this.layerId);
    }
}
