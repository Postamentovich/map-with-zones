import React from "react";
import { SketchPicker } from "react-color";
import { POPUP_COLOR_CLASS_NAME } from "../utils/constants";

export class ColorPicker extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            displayColorPicker: false,
            color: props.color,
        };
    }

    handleClick = () => {
        this.setState({ displayColorPicker: !this.state.displayColorPicker });
    };

    handleClose = () => {
        this.setState({ displayColorPicker: false });
    };

    handleChange = (color) => {
        const { onChange } = this.props;
        this.setState({ color: color.hex });
        onChange(color);
    };

    render() {
        const { color } = this.state;

        return (
            <div className={`${POPUP_COLOR_CLASS_NAME}__picker`}>
                <div className={`${POPUP_COLOR_CLASS_NAME}__swatch`} onClick={this.handleClick}>
                    <div className={`${POPUP_COLOR_CLASS_NAME}__select`} style={{ backgroundColor: color }} />
                </div>
                {this.state.displayColorPicker ? (
                    <div className={`${POPUP_COLOR_CLASS_NAME}__popover`}>
                        <div className={`${POPUP_COLOR_CLASS_NAME}__cover`} onClick={this.handleClose} />
                        <SketchPicker color={color} onChange={this.handleChange} />
                    </div>
                ) : null}
            </div>
        );
    }
}
