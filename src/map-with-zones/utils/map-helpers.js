import { DEFAULT_RADIUS_LAYER_COLOR } from "./constants";

export function enableMapInteraction(map) {
    if (!map) return;
    map.dragPan.enable();
    map.boxZoom.enable();
    map.scrollZoom.enable();
    map.dragRotate.enable();
    map.doubleClickZoom.enable();
    map.touchZoomRotate.enable();
    map.touchPitch.enable();
}

export function disableMapInteraction(map) {
    if (!map) return;
    map.dragPan.disable();
    map.boxZoom.disable();
    map.scrollZoom.disable();
    map.dragRotate.disable();
    map.doubleClickZoom.disable();
    map.touchZoomRotate.disable();
    map.touchPitch.disable();
}

export function setDefaultCursor(map) {
    if (!map) return;
    map.getCanvas().style.cursor = "default";
}

export function resetCursor(map) {
    if (!map) return;
    map.getCanvas().style.cursor = "";
}

export function getZoneLineLayout() {
    return {
        "line-join": "round",
        "line-cap": "round",
    };
}

export function getZoneLinePaint(color) {
    return {
        "line-color": color,
        "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 5, 1, 16, 6],
    };
}

export function getZonePolygonPaint(color) {
    return {
        "fill-color": color,
        "fill-opacity": 0.5,
        "fill-outline-color": "transparent",
    };
}

export function getRadiusPolygonPaint() {
    return {
        "fill-color": DEFAULT_RADIUS_LAYER_COLOR,
        "fill-opacity": 0.4,
    };
}

export function getRadiusLineLayout() {
    return {
        "line-join": "round",
        "line-cap": "round",
    };
}

export function getRadiusLinePaint() {
    return {
        "line-color": DEFAULT_RADIUS_LAYER_COLOR,
        "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 5, 1, 16, 6],
        "line-dasharray": [5, 3],
    };
}
