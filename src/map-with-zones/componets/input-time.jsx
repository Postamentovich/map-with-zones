import React from "react";
import { POPUP_LABEL_CLASS_NAME, POPUP_INPUT_CLASS_NAME } from "../utils/constants";

export const InputTime = ({ time, onChange }) => {
    return (
        <>
            <label htmlFor="popup-input-time" className={POPUP_LABEL_CLASS_NAME}>
                Enter time (min):
            </label>
            <br />
            <input
                type="number"
                id="popup-input-time"
                defaultValue={time || 0}
                className={POPUP_INPUT_CLASS_NAME}
                onChange={onChange}
                max={60}
            />
            <br />
        </>
    );
};
