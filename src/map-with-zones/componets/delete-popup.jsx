import React from "react";
import { PopupTitle } from "./popup-title";
import { POPUP_CONTROLS_CLASS_NAME } from "../utils/constants";
import { Popup } from "./popup";
import { PopupButton } from "./popup-button";

export const DeletePopup = ({ name, onClickDelete, onClickCancel }) => {
    return (
        <Popup>
            <PopupTitle title={`Do you want to delete a zone ${name}?`} />
            <div className={POPUP_CONTROLS_CLASS_NAME}>
                <PopupButton text="Cancel" onClick={onClickCancel} />
                <PopupButton text="Delete" onClick={onClickDelete} />
            </div>
        </Popup>
    );
};
