export class ZoneApi {
    localStoragekey = "mapZones";

    pause = () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 100);
        });
    };

    async getZoneList() {
        await this.pause();
        const zones = localStorage.getItem(this.localStoragekey);
        if (!zones) return;
        return JSON.parse(zones);
    }

    async addZone(zone) {
        await this.pause();
        let newZones = [];
        const zones = await this.getZoneList();
        if (zones) newZones = [...zones];
        newZones.push(zone);
        const string = JSON.stringify(newZones);
        localStorage.setItem(this.localStoragekey, string);
    }

    async updateZone(zone) {
        await this.pause();
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
        const zones = await this.getZoneList();
        if (!zones) return;
        const newZones = zones.filter((el) => el.id !== id);
        const string = JSON.stringify(newZones);
        localStorage.setItem(this.localStoragekey, string);
    }
}
