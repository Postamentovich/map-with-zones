import React from "react";
import { POPUP_BUTTON_CLASS_NAME } from "../utils/constants";

export const PopupButton = ({ text, onClick }) => {
    return (
        <button className={POPUP_BUTTON_CLASS_NAME} onClick={onClick} type="button">
            {text || " "}
        </button>
    );
};
