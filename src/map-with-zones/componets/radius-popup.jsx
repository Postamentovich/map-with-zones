import React, { useState, useCallback } from "react";
import { InputRadius } from "./input-radius";
import { Popup } from "./popup";
import { PopupButton } from "./popup-button";
import { POPUP_CONTROLS_CLASS_NAME, RadiusModes } from "../utils/constants";
import { RadiusMode } from "./radius-mode";
import { InputTime } from "./input-time";

export const RadiusPopup = ({ radius, onChangeRadius, onClickSelect, onChangeMode, time, onChangeTime, mode }) => {
    const [stateMode, setMode] = useState(mode);
    const handleChangeMode = useCallback(
        (e) => {
            setMode(e.target.value);
            onChangeMode(e);
        },
        [onChangeMode],
    );
    const [stateRadius, setRadius] = useState(radius);
    const handleChangeRadius = useCallback(
        (e) => {
            setRadius(e.target.value);
            onChangeRadius(e);
        },
        [onChangeRadius],
    );
    const [stateTime, setTime] = useState(time);
    const handleChangeTime = useCallback(
        (e) => {
            setTime(e.target.value);
            onChangeTime(e);
        },
        [onChangeTime],
    );
    return (
        <Popup>
            <RadiusMode mode={stateMode} onChangeMode={handleChangeMode} />
            {stateMode === RadiusModes.time && <InputTime time={stateTime} onChange={handleChangeTime} />}
            {stateMode === RadiusModes.distance && <InputRadius radius={stateRadius} onChange={handleChangeRadius} />}
            <div className={POPUP_CONTROLS_CLASS_NAME}>
                <PopupButton text="Select" onClick={onClickSelect} />
            </div>
        </Popup>
    );
};
