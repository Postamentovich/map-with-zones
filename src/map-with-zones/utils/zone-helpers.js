import * as turf from "@turf/turf";
import { DEFAULT_ZONE_LAYER_COLOR, DEFAULT_RADIUS, DEFAULT_TIME, DEFAULT_MODE } from "./constants";

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

export function getDefaultUserData() {
    return {
        lngLat: null,
        radius: DEFAULT_RADIUS,
        time: DEFAULT_TIME,
        mode: DEFAULT_MODE,
        zones: [],
    };
}

export function getCenterZoneByCoordinates(coordinates) {
    const simlified = getDrawingLine(coordinates);
    if (!simlified) return;
    const center = turf.center(simlified);
    return center;
}

export function getCenterZoneCoorByCoordinates(coordinates) {
    const center = getCenterZoneByCoordinates(coordinates);
    if (!center) return;
    const coor = turf.getCoord(center);
    return coor;
}

export function getZonePolygonByCoordinates(coordinates, id) {
    const line = getDrawingLine(coordinates, id);
    if (!line || line.geometry.coordinates.length < 4) return;
    let polygon = turf.lineToPolygon(line);
    const kinks = turf.kinks(polygon);
    if (kinks.features.length) {
        polygon = turf.unkinkPolygon(polygon);
    }
    return polygon;
}

export function getZoneLineByCoordinates(coordinates, id) {
    const simlified = getDrawingLine(coordinates, id);
    if (!simlified || simlified.geometry.coordinates.length < 4) return;
    const polygon = turf.lineToPolygon(simlified);
    const polygonedLine = turf.polygonToLine(polygon);
    return polygonedLine;
}

export function getDrawingLine(coordinates, id) {
    if (coordinates.length < 2) return;
    const line = turf.lineString(coordinates, { id });
    const simlified = turf.cleanCoords(turf.simplify(line, { tolerance: 0.00001, highQuality: true }));
    return simlified;
}

export function getCircleByRadius(center, radius) {
    return turf.circle(center.toArray(), radius);
}

export function getLineByRadius(center, radius) {
    if (!center || !radius) return;
    const circle = turf.circle(center.toArray(), radius);
    return turf.polygonToLine(circle);
}

export function getLineByPolygonData(polygonData) {
    const coords = turf.coordAll(polygonData);
    return turf.lineString(coords);
}

export function isZoneIntersectedRadius(radius, center, zoneCoordinates) {
    if (zoneCoordinates.length < 2) return;
    const line = turf.lineString(zoneCoordinates);
    const point = turf.point(center.toArray());
    const distance = turf.pointToLineDistance(point, line);
    return distance <= radius;
}

export function isZoneIntersectedTime(timePolygon, zoneCoordinates, center) {
    if (!timePolygon || !zoneCoordinates) return;
    const line = turf.lineString(zoneCoordinates);
    const timeFeature = timePolygon.features[0];
    const point = turf.point(center.toArray());
    const nearestPoint = turf.nearestPointOnLine(line, point);
    const pointsInPolygon = turf.pointsWithinPolygon(nearestPoint, timeFeature);
    const intersectedPoints = pointsInPolygon && pointsInPolygon.features.length;
    return !!intersectedPoints;
}
