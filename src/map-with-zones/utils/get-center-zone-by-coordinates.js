import * as turf from "@turf/turf";

export function getCenterZoneByCoordinates(coordinates) {
    if (coordinates.length < 2) return;
    const line = turf.lineString(coordinates);
    const polygon = turf.lineToPolygon(line);
    const center = turf.centerOfMass(polygon);
    const coor = turf.getCoord(center);
    return coor;
}
