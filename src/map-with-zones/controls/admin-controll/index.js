import { ZoneLayer } from "../../layers/zone-layer";
import { generateUniqueId } from "../../utils/generate-unique-id";

export class AdminControll {
    zones = [];
    layers = new Map();

    onAdd(map) {
        this.map = map;
        this.container = document.createElement("div");
        this.container.className = "mapboxgl-ctrl mapboxgl-ctrl-group";

        const addButton = document.createElement("button");
        addButton.className = "mapboxgl-ctrl";
        addButton.textContent = "Add zone";
        addButton.addEventListener("click", this.onClickAddButton);

        const deleteButton = document.createElement("button");
        deleteButton.className = "mapboxgl-ctrl";
        deleteButton.textContent = "Delete zone";
        deleteButton.addEventListener("click", this.onClickDeleteButton);

        const editButton = document.createElement("button");
        editButton.className = "mapboxgl-ctrl";
        editButton.textContent = "Edit mode";
        editButton.addEventListener("click", this.onClickEditButton);

        this.container.appendChild(addButton);
        this.container.appendChild(deleteButton);
        this.container.appendChild(editButton);

        this.init();
        return this.container;
    }

    onRemove() {
        this.container.parentNode.removeChild(this.container);
        this.map = undefined;
    }

    onClickAddButton = () => {
        const id = generateUniqueId();
        const layer = new ZoneLayer(this.map, id);
        this.layers.set(id, layer);
    };

    onClickDeleteButton = () => {};

    onClickEditButton = () => {};

    init() {}
}
