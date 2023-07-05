import {unByKey as ol_Observable_unByKey} from 'ol/Observable.js'
import ol_control_Control from 'ol/control/Control.js'
import {getMapScale as ol_sphere_getMapScale, setMapScale as ol_sphere_setMapScale} from 'ol-ext/geom/sphere.js'
import { Map } from 'ol';

/**
 * Scale Control.
 * A control to display the scale of the center on the map
 *
 * @constructor
 * @extends {ol_control_Control}
 * @fires select
 * @fires change:input
 * @param {Object=} options
 * @param {string} options.className - control class name
 * @param {string} options.ppi - screen ppi, defaults to 96
 * @param {string} options.editable - make the control editable, defaults to true
 * @param {string[]} options.scale - array of predefined scales
 */
export default class ScaleControl extends ol_control_Control {
    private _listener: any;
    private _input: any;

    constructor(options: any) {
        options = options || {};
        if (options.typing === undefined) {
            options.typing = 300;
        }
        options.scales = options.scales || [];
        const element = document.createElement("div");
        let classNames = (options.className || "") + " ol-scale";
        if (!options.target) {
            classNames += " ol-unselectable ol-control";
        }
        super({
            element: element,
            target: options.target
        });

        this._input = document.createElement("input");
        this._input.setAttribute("id", "scales_input");
        this._input.setAttribute("list", "scales");
        this._input.addEventListener("click", function(e: any) {
            e.target.value = "1 : ";
        });
        this._input.addEventListener("change", this.setScale.bind(this));
        //this._input.value = '-';
        element.setAttribute('class', classNames);
        this._input.readOnly = options.editable === false;
        element.appendChild(this._input);

        const datalist = document.createElement("datalist");
        datalist.setAttribute("id", "scales");
        datalist.setAttribute("autocomplete", "off");
        datalist.setAttribute("autocorrect", "off");
        const scales = options.scales;
        scales.forEach((item: string): void => {
            const datalistOption = document.createElement("option");
            datalistOption.value = item;
            datalist.appendChild(datalistOption);
        });
        element.appendChild(datalist);

        this.set('ppi', options.ppi || 96);
    }

    /**
     * Remove the control from its current map and attach it to the new map.
     * Subclasses may set up event handlers to get notified about changes to
     * the map here.
     * @param map - OL Map.
     */
    public setMap(map: Map): void {
        if (this._listener) {
            ol_Observable_unByKey(this._listener);
        }
        this._listener = null;
        super.setMap(map);
        // Get change (new layer added or removed)
        if (map) {
            this._listener = map.on('moveend', this.getScale.bind(this));
        }
    }

    /** Display the scale
     */
    protected getScale(): void {
        const map = this.getMap();
        if (map) {
            const d = ol_sphere_getMapScale(map, this.get('ppi'));
            this._input.value = this.formatScale(d);
            return d;
        }
    }

    /** Format the scale 1:d
     * @param d
     * @return formated string
     */
    protected formatScale(d: number): string {
        d = d > 100 ? Math.round(d / 100) * 100 : d = Math.round(d);
        return '1 : ' + d.toLocaleString();
    }

    /** Set the current scale (will change the scale of the map)
     * @param value - the scale factor
     */
    protected setScale(value: any): void {
        const map = this.getMap();
        if (map && value) {
            if (value.target) {
                value = value.target.value.replace(":", "/");
            }
            ol_sphere_setMapScale(map, value, this.get('ppi'));
        }
        this.getScale();
    }
}



//import ol_control_Scale from "ol-ext/control/Scale";

/** ScaleControl */
/* export default class ScaleControl extends ol_control_Scale {
    constructor(options: any) {
        super(options);
    }
    setScale(value: any): void {
        value.target.value = value.target.value.replace(":", "/");
        super.setScale(value);
    }
    formatScale(d: number): string {
        d = d > 100 ? Math.round(d / 100) * 100 : d = Math.round(d);
        return '1 : ' + d.toLocaleString();
    }
} */