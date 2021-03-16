import GeometryType from "ol/geom/GeometryType"
import { Circle, Icon, Fill, Stroke, Style } from "ol/style";
import { Options as CircleOptions } from "ol/style/Circle";
import { DefaultStyle } from "./Impl/DefaultStyle"
//import { DynamicStyle } from "./Impl/DynamicStyle"
import { StyleType } from "./StyleType"

/** @class StyleBuilder */
export default class StyleBuilder {
    
    private style: StyleType;
    private static readonly POSITIONS = {
        "top": 0,
        "bottom": 1,
        "left": 0,
        "right": 100,
        "middle": 0.5
    }

    /**
     * @constructor
     * @memberof LayerBuilder
     * @param {object} opts - options
     */
    constructor(opts?: unknown) {
        this.style = {
            "Point": null,
            "MultiPoint": null,
            "LineString": null,
            "MultiLineString": null,
            "Polygon": null,
            "MultiPolygon": null,
            "Circle": null,
            "GeometryCollection": null
        };
        this.applyOptions(opts);
    }

    private applyOptions(opts?: unknown) {
        if (typeof opts !== "undefined") {
            if (Object.prototype.hasOwnProperty.call(opts, "point")) {
                this.setPointStyle(opts["point"]);
            } else {
                this.style[GeometryType.POINT] = DefaultStyle[GeometryType.POINT];
                this.style[GeometryType.MULTI_POINT] = DefaultStyle[GeometryType.POINT];
            }
            if (Object.prototype.hasOwnProperty.call(opts, "linestring")) {
                this.setLinestringStyle(opts["linestring"]);
            } else {
                this.style[GeometryType.LINE_STRING] = DefaultStyle[GeometryType.LINE_STRING];
                this.style[GeometryType.MULTI_LINE_STRING] = DefaultStyle[GeometryType.LINE_STRING];
            }
            if (Object.prototype.hasOwnProperty.call(opts, "polygon")) {
                this.setPolygonStyle(opts["polygon"]);
            } else {
                this.style[GeometryType.POLYGON] = DefaultStyle[GeometryType.POLYGON];
                this.style[GeometryType.MULTI_POLYGON] = DefaultStyle[GeometryType.POLYGON];
            }
        } else {
            this.style = DefaultStyle;
        }
    }

    private setPointStyle(opts: unknown): void {
        let style: Style = null;
        if (opts["marker_type"] == "simple_point") {
            const defaultImage: Circle = <Circle> DefaultStyle[GeometryType.POINT].getImage();
            style = new Style({
                image: new Circle({
                    radius: opts["size"] ? opts["size"] : defaultImage.getRadius(),
                    fill: new Fill({
                        color: opts["color"]
                    }),
                    stroke: new Stroke({
                        color: opts["color"],
                        width: 1
                    }),
                }),
            });
        } else if (opts["marker_type"] == "image") {
            style = new Style({
                image: new Icon({
                    opacity: opts["opacity"],
                    rotation: opts["rotation"],
                    offset: opts["offset"],
                    anchor: [StyleBuilder.POSITIONS[opts["anchor"][0]], StyleBuilder.POSITIONS[opts["anchor"][1]]],
                    src: opts["icon_file"],
                })
            });
        } else {
            return;
        }
        this.style[GeometryType.POINT] = style;
        this.style[GeometryType.MULTI_POINT] = style;
    }

    private setLinestringStyle(opts: unknown): void {
        const style: Style = new Style({
            stroke: new Stroke({
                color: opts["color"], 
                width: opts["stroke_width"]
            }),
        });
        this.style[GeometryType.LINE_STRING] = style;
        this.style[GeometryType.MULTI_LINE_STRING] = style;
    }

    private setPolygonStyle(opts: unknown): void {
        console.log(opts);
    }

    /**
     * Builds style
     *
     * @function build
     * @memberof StyleBuilder
     * @return {Object<import("ol/geom/GeometryType.js").default, Array<Style>>} - style
     */
    public build(): StyleType {
        return this.style;
    }
}