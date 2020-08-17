import React, { useState, useEffect } from "react";
import { ZoneApi } from "../api/zone-api";

export const ZonesList = ({ selectedZones, setSelectedZones }) => {
    const [zones, setZones] = useState([]);

    useEffect(() => {
        const zoneApi = new ZoneApi();
        const getZones = async () => {
            const zones = await zoneApi.getZoneList();
            if (zones) setZones(zones);
        };
        getZones();
    }, []);

    const onChange = (e) => {
        const id = e.target.value;
        let newSelected = [];
        if (selectedZones.includes(id)) {
            newSelected = selectedZones.filter((el) => el !== id);
        } else {
            newSelected = [...selectedZones, id];
        }
        setSelectedZones(newSelected);
    };

    return (
        <div className="test-zone-list">
            Zones list:
            {zones.map((zone) => {
                return (
                    <label key={zone.id}>
                        <input
                            type="checkbox"
                            checked={selectedZones.includes(zone.id)}
                            value={zone.id}
                            onChange={onChange}
                        ></input>
                        {zone.name}
                    </label>
                );
            })}
        </div>
    );
};
