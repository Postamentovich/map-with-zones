import React from "react";
import { POPUP_LABEL_CLASS_NAME, POPUP_INPUT_CLASS_NAME } from "../utils/constants";

export const InputRadius = ({ id, radius }) => {
    return (
        <>
            <label htmlFor={id} className={POPUP_LABEL_CLASS_NAME}>
                Enter radius (km):
            </label>
            <br />
            <input type="number" id={id} value={radius || 0} className={POPUP_INPUT_CLASS_NAME} />
            <br />
        </>
    );
};
