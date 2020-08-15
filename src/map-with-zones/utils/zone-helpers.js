import * as turf from "@turf/turf";
import { DEFAULT_ZONE_LAYER_COLOR } from "./constants";

export function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function getDefaultZone() {
    return {
        name: "",
        color: DEFAULT_ZONE_LAYER_COLOR,
        id: null,
        coordinates: [],
    };
}

export function getCenterZoneByCoordinates(coordinates) {
    if (coordinates.length < 2) return;
    const line = turf.lineString(coordinates);
    const polygon = turf.lineToPolygon(line);
    const center = turf.centerOfMass(polygon);
    return center;
}

export function getCenterZoneCoorByCoordinates(coordinates) {
    const center = getCenterZoneByCoordinates(coordinates);
    if (!center) return;
    const coor = turf.getCoord(center);
    return coor;
}

export function getZonePolygonByCoordinates(coordinates, id) {
    const line = getZoneLineByCoordinates(coordinates, id);
    if (!line || line.geometry.coordinates.length < 4) return;
    return turf.lineToPolygon(line);
}

export function getZoneLineByCoordinates(coordinates, id) {
    const line = turf.lineString(coordinates, { id });
    const simlified = turf.simplify(line, { tolerance: 0.00001 });
    if (simlified.geometry.coordinates.length < 4) return;
    const polygon = turf.lineToPolygon(simlified);
    const polygonedLine = turf.polygonToLine(polygon);
    return polygonedLine;
}

export function getCircleByRadius(center, radius) {
    return turf.circle(center.toArray(), radius);
}
