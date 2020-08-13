export class AdminControll {
    onAdd(map) {
        this._map = map;
        this._container = document.createElement("button");
        this._container.className = "mapboxgl-ctrl";
        this._container.textContent = "Admin";
        return this._container;
    }

    onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
    }
}
