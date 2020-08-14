export function disableMapInteraction(map) {
    map.dragPan.disable();
    map.boxZoom.disable();
    map.scrollZoom.disable();
    map.dragRotate.disable();
    map.doubleClickZoom.disable();
    map.touchZoomRotate.disable();
    map.touchPitch.disable();
}
