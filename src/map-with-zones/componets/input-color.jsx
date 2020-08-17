import React from "react";
import { POPUP_COLOR_CLASS_NAME, POPUP_LABEL_CLASS_NAME, DEFAULT_ZONE_LAYER_COLOR } from "../utils/constants";
import { ColorPicker } from "./color-picker";

export const InputColor = ({ color, onChange }) => {
    return (
        <div className={POPUP_COLOR_CLASS_NAME}>
            <label htmlFor="popup-input-color" className={POPUP_LABEL_CLASS_NAME}>
                Select zone color:
            </label>
            <ColorPicker color={color || DEFAULT_ZONE_LAYER_COLOR} onChange={onChange} />
        </div>
    );
};
