import React from "react";
import { POPUP_RADIUS_MODE_CLASS_NAME, RadiusModes } from "../utils/constants";

export const RadiusMode = ({ mode, onChangeMode }) => {
    return (
        <div className={POPUP_RADIUS_MODE_CLASS_NAME}>
            <label htmlFor="radius-mode-time">Time</label>
            <input
                type="radio"
                id="radius-mode-time"
                value={RadiusModes.time}
                name="radius-mode"
                checked={mode === RadiusModes.time}
                onChange={onChangeMode}
            />
            <label htmlFor="radius-mode-distance">Distance</label>
            <input
                type="radio"
                id="radius-mode-distance"
                value={RadiusModes.distance}
                name="radius-mode"
                checked={mode === RadiusModes.distance}
                onChange={onChangeMode}
            />
        </div>
    );
};
