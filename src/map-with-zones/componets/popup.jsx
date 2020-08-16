import React from "react";
import { POPUP_BASE_CLASS_NAME } from "../utils/constants";

export const Popup = ({ children }) => {
    return <div className={POPUP_BASE_CLASS_NAME}>{children}</div>;
};
