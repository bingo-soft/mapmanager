import OlGeometryType from "ol/geom/GeometryType"
import {Circle as OlCircleStyle, Icon as OlIconStyle, Fill as OlFill, Stroke as OlStroke, Style as OlStyle} from "ol/style";
//import { Options as OlCircleOptions } from "ol/style/Circle";
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
        "right": 1,
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
                this.style[OlGeometryType.POINT] = DefaultStyle[OlGeometryType.POINT];
                this.style[OlGeometryType.MULTI_POINT] = DefaultStyle[OlGeometryType.POINT];
            }
            if (Object.prototype.hasOwnProperty.call(opts, "linestring")) {
                this.setLinestringStyle(opts["linestring"]);
            } else {
                this.style[OlGeometryType.LINE_STRING] = DefaultStyle[OlGeometryType.LINE_STRING];
                this.style[OlGeometryType.MULTI_LINE_STRING] = DefaultStyle[OlGeometryType.LINE_STRING];
            }
            if (Object.prototype.hasOwnProperty.call(opts, "polygon")) {
                this.setPolygonStyle(opts["polygon"]);
            } else {
                this.style[OlGeometryType.POLYGON] = DefaultStyle[OlGeometryType.POLYGON];
                this.style[OlGeometryType.MULTI_POLYGON] = DefaultStyle[OlGeometryType.POLYGON];
            }
        } else {
            this.style = DefaultStyle;
        }
    }

    private setPointStyle(opts: unknown): void {
        let style: OlStyle = null;
        if (opts["marker_type"] == "simple_point") {
            const defaultImage: OlCircleStyle = <OlCircleStyle> DefaultStyle[OlGeometryType.POINT].getImage();
            style = new OlStyle({
                image: new OlCircleStyle({
                    radius: opts["size"] ? opts["size"] : defaultImage.getRadius(),
                    fill: new OlFill({
                        color: opts["color"]
                    }),
                    stroke: new OlStroke({
                        color: opts["color"],
                        width: 1
                    }),
                }),
            });
        } else if (opts["marker_type"] == "image") {
            style = new OlStyle({
                image: new OlIconStyle({
                    opacity: opts["opacity"] / 100,
                    rotation: opts["rotation"] * Math.PI / 180,
                    offset: opts["offset"],
                    anchor: [StyleBuilder.POSITIONS[opts["anchor"][0]], StyleBuilder.POSITIONS[opts["anchor"][1]]],
                    src: opts["image_path"],
                })
            });
        } else {
            return;
        }
        this.style[OlGeometryType.POINT] = style;
        this.style[OlGeometryType.MULTI_POINT] = style;
    }

    private setLinestringStyle(opts: unknown): void {
        const style: OlStyle = new OlStyle({
            stroke: new OlStroke({
                color: opts["color"], 
                width: opts["stroke_width"]
            }),
        });
        this.style[OlGeometryType.LINE_STRING] = style;
        this.style[OlGeometryType.MULTI_LINE_STRING] = style;
    }

    private setPolygonStyle(opts: unknown): void {
        const style: OlStyle = new OlStyle({
            stroke: new OlStroke({
                color: opts["color"], 
                width: opts["stroke_width"]
            }),
            fill: new OlFill({
                color: opts["background_color"],
            }),
        });
        this.style[OlGeometryType.POLYGON] = style;
        this.style[OlGeometryType.MULTI_POLYGON] = style;
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