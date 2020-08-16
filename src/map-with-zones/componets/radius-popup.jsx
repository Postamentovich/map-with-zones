import React from "react";
import { InputRadius } from "./input-radius";
import { Popup } from "./popup";
import { PopupButton } from "./popup-button";
import { POPUP_CONTROLS_CLASS_NAME } from "../utils/constants";

export const RadiusPopup = ({ radius, onChangeRadius, onClickSelect }) => {
    return (
        <Popup>
            <InputRadius radius={radius} onChange={onChangeRadius} />
            <div className={POPUP_CONTROLS_CLASS_NAME}>
                <PopupButton text="Select" onClick={onClickSelect} />
            </div>
        </Popup>
    );
};
