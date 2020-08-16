import React from "react";
import { POPUP_LABEL_CLASS_NAME, POPUP_INPUT_CLASS_NAME } from "../utils/constants";

export const InputRadius = ({ radius, onChange }) => {
    return (
        <>
            <label htmlFor="popup-input-radius" className={POPUP_LABEL_CLASS_NAME}>
                Enter radius (km):
            </label>
            <br />
            <input
                type="number"
                id="popup-input-radius"
                defaultValue={radius || 0}
                className={POPUP_INPUT_CLASS_NAME}
                onChange={onChange}
            />
            <br />
        </>
    );
};
