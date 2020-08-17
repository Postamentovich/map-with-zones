import localForage from "localforage";

export class ZoneApi {
    localStoragekey = "mapZones";

    constructor() {
        localForage.config({
            driver: localForage.INDEXEDDB,
            name: "mapZones",
            version: 1.0,
            storeName: this.localStoragekey,
        });
    }

    async getZoneList() {
        try {
            const zones = await localForage.getItem(this.localStoragekey);
            return zones;
        } catch (error) {
            console.error(error);
        }
    }

    async addZone(zone) {
        try {
            let newZones = [];
            const zones = await this.getZoneList();
            if (zones) newZones = [...zones];
            newZones.push(zone);
            await localForage.setItem(this.localStoragekey, newZones);
        } catch (error) {
            console.error(error);
        }
    }

    async updateZone(zone) {
        try {
            const zones = await this.getZoneList();
            if (!zones) return;
            const newZones = zones.map((el) => {
                if (el.id === zone.id) return zone;
                return el;
            });
            await localForage.setItem(this.localStoragekey, newZones);
        } catch (error) {
            console.error(error);
        }
    }

    async deleteZone(id) {
        try {
            const zones = await this.getZoneList();
            if (!zones) return;
            const newZones = zones.filter((el) => el.id !== id);
            await localForage.setItem(this.localStoragekey, newZones);
        } catch (error) {
            console.error(error);
        }
    }
}
