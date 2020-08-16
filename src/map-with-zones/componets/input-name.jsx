import React from "react";
import { POPUP_LABEL_CLASS_NAME, POPUP_INPUT_CLASS_NAME } from "../utils/constants";

export const InputName = ({ name, onChange }) => {
    return (
        <>
            <label htmlFor="popup-input-name" className={POPUP_LABEL_CLASS_NAME}>
                Enter zone name:
            </label>
            <br />
            <input
                type="text"
                id="popup-input-name"
                defaultValue={name || " "}
                className={POPUP_INPUT_CLASS_NAME}
                onChange={onChange}
            />
            <br />
        </>
    );
};
