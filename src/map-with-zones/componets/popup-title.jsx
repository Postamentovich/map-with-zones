import React from "react";
import { POPUP_TITLE_CLASS_NAME } from "../utils/constants";

export const PopupTitle = ({ title }) => {
    return <span className={POPUP_TITLE_CLASS_NAME}>{title || " "}</span>;
};
