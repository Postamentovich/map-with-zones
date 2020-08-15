import { getCenterZoneByCoordinates } from "../utils/zone-helpers";

export class ZoneNameLayer {
    /**
     * @param {mapboxgl.Map} map
     * @param {string} id
     */
    constructor(map, id, options) {
        this.name = options && options.name ? options.name : " ";
        this.map = map;
        this.layerId = `zone-name-layer-${id}`;
        this.sourceId = `zone-name-source-${id}`;
        this.id = id;
    }

    updateName(name) {
        this.name = name;
        this.map.setLayoutProperty(this.layerId, "text-field", name);
    }

    update(coordinates) {
        this.addSource(coordinates);
        this.addLayer();
    }

    addSource(coordinates) {
        const data = getCenterZoneByCoordinates(coordinates);
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
            minzoom: 12,
            type: "symbol",
            layout: {
                "text-field": this.name,
                "text-size": ["interpolate", ["exponential", 1.5], ["zoom"], 12, 12, 18, 46],
            },
            paint: {
                "text-color": "white",
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
