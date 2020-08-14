export function enableMapInteraction(map) {
    map.dragPan.enable();
    map.boxZoom.enable();
    map.scrollZoom.enable();
    map.dragRotate.enable();
    map.doubleClickZoom.enable();
    map.touchZoomRotate.enable();
    map.touchPitch.enable();
}
