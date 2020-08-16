import React from "react";
import { TABLE_BASE_CLASS_NAME, TABLE_TITLE_CLASS_NAME, TABLE_ZONES_CLASS_NAME } from "../utils/constants";

export const ZoneTable = ({ zones, itHasPoint }) => {
    const getContent = () => {
        if (!itHasPoint) {
            return <span className={TABLE_TITLE_CLASS_NAME}>Set point on the map</span>;
        }
        if (!zones.length) {
            return <span className={TABLE_TITLE_CLASS_NAME}>No zones in the radius</span>;
        }

        return (
            <>
                <span className={TABLE_TITLE_CLASS_NAME}>You have selected the following zones:</span>
                <div className={TABLE_ZONES_CLASS_NAME}>
                    {zones.map((zone) => (
                        <span>{zone.name}</span>
                    ))}
                </div>
            </>
        );
    };

    return <div className={TABLE_BASE_CLASS_NAME}>{getContent()}</div>;
};
