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
