import { DEFAULT_ZONE_LAYER_COLOR } from "./constants";

export function getDefaultZone() {
    return {
        name: "",
        color: DEFAULT_ZONE_LAYER_COLOR,
        id: null,
        coordinates: [],
    };
}
