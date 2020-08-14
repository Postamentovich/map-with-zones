import * as turf from "@turf/turf";

export function getDataByCoordinates(coordinates, id) {
    const line = turf.lineString(coordinates, { id });
    const simlified = turf.simplify(line, { tolerance: 0.00001 });

    if (simlified.geometry.coordinates.length < 4) return;

    const polygon = turf.lineToPolygon(simlified);
    const data = turf.featureCollection([polygon]);

    return data;
}
