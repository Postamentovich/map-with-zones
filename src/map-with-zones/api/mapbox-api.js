import mapboxgl from "mapbox-gl";
import axios from "axios";

export class MapboxApi {
    /**
     *
     * @param {mapboxgl.LngLat} coor
     * @param {number} minutes
     */
    async getIsochrone(coor, minutes) {
        const url = `https://api.mapbox.com/isochrone/v1/mapbox/driving/${coor.lng},${coor.lat}?contours_minutes=${minutes}&polygons=true&access_token=${mapboxgl.accessToken}`;
        try {
            const { data } = await axios.get(url);
            return data;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}
