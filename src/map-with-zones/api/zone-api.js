import { pause } from "../utils/api-helpers";

export class ZoneApi {
    localStoragekey = "mapZones";

    async getZoneList() {
        await pause();
        const zones = localStorage.getItem(this.localStoragekey);
        if (!zones) return;
        return JSON.parse(zones);
    }

    async addZone(zone) {
        await pause();
        let newZones = [];
        const zones = await this.getZoneList();
        if (zones) newZones = [...zones];
        newZones.push(zone);
        const string = JSON.stringify(newZones);
        localStorage.setItem(this.localStoragekey, string);
    }

    async updateZone(zone) {
        await pause();
        const zones = await this.getZoneList();
        if (!zones) return;
        const newZones = zones.map((el) => {
            if (el.id === zone.id) return zone;
            return el;
        });
        const string = JSON.stringify(newZones);
        localStorage.setItem(this.localStoragekey, string);
    }

    async deleteZone(id) {
        await pause();
        const zones = await this.getZoneList();
        if (!zones) return;
        const newZones = zones.filter((el) => el.id !== id);
        const string = JSON.stringify(newZones);
        localStorage.setItem(this.localStoragekey, string);
    }
}
