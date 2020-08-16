import React from "react";
import { POPUP_COLOR_CLASS_NAME, POPUP_LABEL_CLASS_NAME, DEFAULT_ZONE_LAYER_COLOR } from "../utils/constants";

export const InputColor = ({ color, onChange }) => {
    return (
        <div className={POPUP_COLOR_CLASS_NAME}>
            <label htmlFor="popup-input-color" className={POPUP_LABEL_CLASS_NAME}>
                Select zone color:
            </label>
            <input
                type="color"
                id="popup-input-color"
                defaultValue={color || DEFAULT_ZONE_LAYER_COLOR}
                onChange={onChange}
            />
        </div>
    );
};
