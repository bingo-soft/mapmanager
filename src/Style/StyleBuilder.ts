import GeometryType from 'ol/geom/GeometryType'
import { DefaultStyle } from "./Impl/DefaultStyle"
import { DynamicStyle } from "./Impl/DynamicStyle"

/** @class StyleBuilder */
export default class StyleBuilder {
    /** @type {Object<import("ol/geom/GeometryType.js").default, Array<Style>>} */
    private style: unknown;

    /**
     * @constructor
     * @memberof LayerBuilder
     * @param {object} opts - options
     */
    constructor(opts?: unknown) {
        this.applyOptions(opts);
    }

    private applyOptions(opts?: unknown) {
        if (typeof opts !== "undefined") {
            this.style = DynamicStyle;
            if (Object.prototype.hasOwnProperty.call(opts, "point")) {
                this.setPointStyle(opts["point"]);
            } else {
                this.style[GeometryType.POINT] = DefaultStyle[GeometryType.POINT];
                this.style[GeometryType.MULTI_POINT] = DefaultStyle[GeometryType.MULTI_POINT];
            }
            if (Object.prototype.hasOwnProperty.call(opts, "linestring")) {
                this.setLinestringStyle(opts["point"]);
            } else {
                this.style[GeometryType.LINE_STRING] = DefaultStyle[GeometryType.LINE_STRING];
                this.style[GeometryType.MULTI_LINE_STRING] = DefaultStyle[GeometryType.MULTI_LINE_STRING];
            }
            if (Object.prototype.hasOwnProperty.call(opts, "polygon")) {
                this.setPolygonStyle(opts["point"]);
            } else {
                this.style[GeometryType.POLYGON] = DefaultStyle[GeometryType.POLYGON];
                this.style[GeometryType.MULTI_POLYGON] = DefaultStyle[GeometryType.MULTI_POLYGON];
            }
        } else {
            this.style = DefaultStyle;
        }
    }

    private setPointStyle(opts: unknown): void {
        console.log(opts);
        //todo
    }

    private setLinestringStyle(opts: unknown): void {
        console.log(opts);
        //todo
    }

    private setPolygonStyle(opts: unknown): void {
        console.log(opts);
        //todo
    }

    /**
     * Builds style
     *
     * @function build
     * @memberof StyleBuilder
     * @return {Object<import("ol/geom/GeometryType.js").default, Array<Style>>} - style
     */
    public build(): unknown {
        return this.style;
    }
}