import mapboxgl from "mapbox-gl";
import axios from "axios";

const CancelToken = axios.CancelToken;
let cancelFetch = null;

export class MapboxApi {
    cancelIsochroneFetch() {
        if (cancelFetch) cancelFetch();
    }

    /**
     * @param {mapboxgl.LngLat} coor
     * @param {number} minutes
     */
    async getIsochrone(coor, minutes) {
        this.cancelIsochroneFetch();
        const url = `https://api.mapbox.com/isochrone/v1/mapbox/driving/${coor.lng},${coor.lat}?contours_minutes=${minutes}&polygons=true&access_token=${mapboxgl.accessToken}`;
        try {
            const { data } = await axios.get(url, {
                cancelToken: new CancelToken((c) => {
                    cancelFetch = c;
                }),
            });
            return data;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}
