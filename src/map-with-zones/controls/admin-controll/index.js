export class AdminControll {
    onAdd(map) {
        this.map = map;
        this.container = document.createElement("button");
        this.container.className = "mapboxgl-ctrl";
        this.container.textContent = "Admin";
        return this.container;
    }

    onRemove() {
        this.container.parentNode.removeChild(this.container);
        this.map = undefined;
    }
}
