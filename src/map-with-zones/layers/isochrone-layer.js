import { MapboxApi } from "../api/mapbox-api";
import { IsochroneStrokeLayer } from "./isochrone-stroke-layer";
import { getRadiusPolygonPaint } from "../utils/map-helpers";

export class IsochroneLayer {
    layerId = "isochrone-layer";
    sourceId = "isochrone-source";

    /**
     * @param {mapboxgl.Map} map
     */
    constructor(map) {
        this.map = map;
        this.strokeLayer = new IsochroneStrokeLayer(map);
        this.mapboxApi = new MapboxApi();
    }

    async update(time, coor) {
        if (time > 0) {
            await this.addSource(time, coor);
            this.addLayer();
            this.strokeLayer.update(this.data);
        } else {
            this.remove();
        }
    }

    async addSource(time, coor) {
        const source = this.getSource();
        try {
            this.data = await this.mapboxApi.getIsochrone(coor, time);
            if (source) {
                source.setData(this.data);
            } else {
                this.map.addSource(this.sourceId, { type: "geojson", data: this.data });
            }
        } catch (error) {
            console.error(error);
        }
    }

    getFeatureCollection() {
        return this.data;
    }

    addLayer() {
        if (this.gerLayer()) return;

        this.map.addLayer({
            id: this.layerId,
            source: this.sourceId,
            type: "fill",
            paint: getRadiusPolygonPaint(),
        });
    }

    remove() {
        this.mapboxApi.cancelIsochroneFetch();
        this.data = null;
        if (this.gerLayer()) this.map.removeLayer(this.layerId);
        if (this.getSource()) this.map.removeSource(this.sourceId);
        if (this.strokeLayer) this.strokeLayer.remove();
    }

    getSource() {
        return this.map.getSource(this.sourceId);
    }

    gerLayer() {
        return this.map.getLayer(this.layerId);
    }
}
