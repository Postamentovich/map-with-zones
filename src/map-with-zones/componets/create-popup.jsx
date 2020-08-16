import React from "react";
import { Popup } from "./popup";
import { InputName } from "./input-name";
import { InputColor } from "./input-color";
import { POPUP_CONTROLS_CLASS_NAME } from "../utils/constants";
import { PopupButton } from "./popup-button";

export const CreatePopup = ({ name, color, onChangeName, onChangeColor, onClickCancel, onClickSave }) => {
    return (
        <Popup>
            <InputName name={name} onChange={onChangeName} />
            <InputColor color={color} onChange={onChangeColor} />
            <div className={POPUP_CONTROLS_CLASS_NAME}>
                <PopupButton text="Cancel" onClick={onClickCancel} />
                <PopupButton text="Save" onClick={onClickSave} />
            </div>
        </Popup>
    );
};
