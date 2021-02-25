import GeometryType from 'ol/geom/GeometryType'
import { DefaultStyle } from "./Impl/DefaultStyle"
import { DynamicStyle } from "./Impl/DynamicStyle"

/** @class StyleBuilder */
export default class StyleBuilder {
    /** @type {Object<import("ol/geom/GeometryType.js").default, Array<Style>>} */
    private style;

    /**
     * @constructor
     * @memberof LayerBuilder
     * @param {object} opts - options
     */
    constructor(opts?: object) {
        this.applyOptions(opts);
    }

    private applyOptions(opts?: object) {
        if (typeof opts !== "undefined") {
            this.style = DynamicStyle;
            if (opts.hasOwnProperty("point")) {
                this.setPointStyle(opts["point"]);
            } else {
                this.style[GeometryType.POINT] = DefaultStyle[GeometryType.POINT];
                this.style[GeometryType.MULTI_POINT] = DefaultStyle[GeometryType.MULTI_POINT];
            }
            if (opts.hasOwnProperty("linestring")) {
                this.setLinestringStyle(opts["point"]);
            } else {
                this.style[GeometryType.LINE_STRING] = DefaultStyle[GeometryType.LINE_STRING];
                this.style[GeometryType.MULTI_LINE_STRING] = DefaultStyle[GeometryType.MULTI_LINE_STRING];
            }
            if (opts.hasOwnProperty("polygon")) {
                this.setPolygonStyle(opts["point"]);
            } else {
                this.style[GeometryType.POLYGON] = DefaultStyle[GeometryType.POLYGON];
                this.style[GeometryType.MULTI_POLYGON] = DefaultStyle[GeometryType.MULTI_POLYGON];
            }
        } else {
            this.style = DefaultStyle;
        }
    }

    private setPointStyle(opts: object): void {
        //todo
    }

    private setLinestringStyle(opts: object): void {
        //todo
    }

    private setPolygonStyle(opts: object): void {
        //todo
    }

    /**
     * Builds style
     *
     * @function build
     * @memberof StyleBuilder
     * @return {Object<import("ol/geom/GeometryType.js").default, Array<Style>>} - style
     */
    public build() {
        return this.style;
    }
}