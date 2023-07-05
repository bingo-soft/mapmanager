import ol_control_Scale from "ol-ext/control/Scale";

/** ScaleControl */
export default class ScaleControl extends ol_control_Scale {
    constructor(options) {
        super(options);
    }
    setScale(value) {
        value.target.value = value.target.value.replace(":", "/");
        super.setScale(value);
    }
    formatScale(d) {
        d = d > 100 ? Math.round(d / 100) * 100 : d = Math.round(d);
        return '1 : ' + d.toLocaleString();
    }
}