import OlGeometryType from "ol/geom/GeometryType"
import {Circle as OlCircleStyle, Icon as OlIconStyle, Fill as OlFill, Stroke as OlStroke, Text as OlTextStyle, Style as OlStyle} from "ol/style";
import OlFeature from "ol/Feature";
//import { Options as OlCircleOptions } from "ol/style/Circle";
import { DefaultStyle } from "./Impl/DefaultStyle"
//import { DynamicStyle } from "./Impl/DynamicStyle"
import { StyleType } from "./StyleType"
import StyleFunction from "./StyleFunctionType";

/** @class StyleBuilder */
export default class StyleBuilder {
    
    private style: StyleType;
    private static readonly POSITIONS = {
        "top": 0,
        "bottom": 1,
        "left": 0,
        "right": 1,
        "center": 0.5
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
            //"Circle": null,
            "GeometryCollection": null,
            "Text": null
        };
        this.applyOptions(opts);
    }

    private applyOptions(opts?: unknown) { debugger
        if (typeof opts !== "undefined") {
            if (Object.prototype.hasOwnProperty.call(opts, "point") && Object.keys(opts["point"]).length) {
                this.setPointStyle(opts["point"]);
            } else {
                this.style["Point"] = DefaultStyle["Point"];
                this.style["MultiPoint"] = DefaultStyle["MultiPoint"];
            }
            if (Object.prototype.hasOwnProperty.call(opts, "linestring") && Object.keys(opts["linestring"]).length) {
                this.setLinestringStyle(opts["linestring"]);
            } else {
                this.style["LineString"] = DefaultStyle["LineString"];
                this.style["MultiLineString"] = DefaultStyle["MultiLineString"];
            }
            if (Object.prototype.hasOwnProperty.call(opts, "polygon") && Object.keys(opts["polygon"]).length) {
                this.setPolygonStyle(opts["polygon"]);
            } else {
                this.style["Polygon"] = DefaultStyle["Polygon"];
                this.style["MultiPolygon"] = DefaultStyle["MultiPolygon"];
            }
/*             if (Object.prototype.hasOwnProperty.call(opts, "geometrycollection") && Object.keys(opts["geometrycollection"]).length) {
                this.setGeometryCollectionStyle(opts["geometrycollection"]);
            } else {
                this.style["GeometryCollection"] = DefaultStyle["GeometryCollection"];
            } */
            if (Object.prototype.hasOwnProperty.call(opts, "label") && Object.keys(opts["label"]).length) {
                this.setTextStyle(opts["label"]);
            }/*  else { // не имеет смысла, т.к. label не задан
                this.style["Text"] = DefaultStyle["Text"];
            } */
        } else {
            this.style = DefaultStyle;
        }
    }

    private setPointStyle(opts: unknown): StyleBuilder {
        let style: OlStyle = null;
        if (opts["marker_type"] == "simple_point") {
            const defaultImage: OlCircleStyle = <OlCircleStyle> DefaultStyle["Point"].getImage();
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
        this.style["Point"] = style;
        this.style["MultiPoint"] = style;
        return this;
    }

    private setLinestringStyle(opts: unknown): StyleBuilder {
        const style: OlStyle = new OlStyle({
            stroke: new OlStroke({
                color: opts["color"], 
                width: opts["stroke_width"]
            }),
        });
        this.style["LineString"] = style;
        this.style["MultiLineString"] = style;
        return this;
    }

    private setPolygonStyle(opts: unknown): StyleBuilder {
        const style: OlStyle = new OlStyle({
            stroke: new OlStroke({
                color: opts["color"], 
                width: opts["stroke_width"]
            }),
            fill: new OlFill({
                color: this.applyOpacity(opts["background_color"], opts["opacity"]),
            }),
        });
        this.style["Polygon"] = style;
        this.style["MultiPolygon"] = style;
        return this;
    }

    /* private setGeometryCollectionStyle(opts: unknown): void {
        const style: OlStyle = new OlStyle({
            stroke: new OlStroke({
                color: opts["color"], 
                width: opts["stroke_width"]
            }),
            fill: new OlFill({
                color: opts["background_color"],
            }),
        });
        this.style[OlGeometryType.GEOMETRY_COLLECTION] = style;
    } */

    private setTextStyle(opts: unknown): StyleBuilder {
        if (typeof opts["style"] !== "undefined") {
            const style: OlTextStyle = new OlTextStyle({
                stroke: new OlStroke({
                    color: typeof opts["style"]["stroke"] !== "undefined" ? opts["style"]["stroke"]["color"] : DefaultStyle["Text"].getStroke().getColor(), 
                    width: typeof opts["style"]["stroke"] !== "undefined" ? opts["style"]["stroke"]["stroke_width"] : DefaultStyle["Text"].getStroke().getWidth()
                }),
                fill: new OlFill({
                    color: typeof opts["style"]["fill"] !== "undefined" ? opts["style"]["fill"]["background_color"] : DefaultStyle["Text"].getFill().getColor()
                }),
                font: opts["style"]["font"],
                text: opts["field"]
            });
            this.style["Text"] = style;
        }  else {
            this.style["Text"] = DefaultStyle["Text"];
            this.style["Text"].setText(opts["field"]);
        }
        return this;
    }

    private applyOpacity(color: string, opacity: number): string {
        if (color.length == 4) { // short color like #333
            color += "000";
        }
        if (opacity < 0) {
            opacity = 0;   
        }
        if (opacity > 100) {
            opacity = 100;
        }
        opacity = Math.round(opacity * 2.55);
        return color + opacity.toString(16).toUpperCase().padStart(2, "0");
      }

    /**
     * Builds style
     *
     * @function build
     * @memberof StyleBuilder
     * @return {Object<import("ol/geom/GeometryType.js").default, Array<Style>>} - style
     */
    /* public build(): StyleType {
        return this.style;
    } */
    public build(): StyleFunction /* StyleType */ {
        //return this.style;

        return (feature: OlFeature): OlStyle => {
            const geomType: OlGeometryType = feature.getGeometry().getType();
            const style: OlStyle = this.style[geomType];
            const textStyle: OlTextStyle = this.style["Text"];
            if (style && textStyle) {
                const textValue: string = feature.getProperties()[textStyle.getText()];
                if (textValue) {
                    const newTextStyle: OlTextStyle = new OlTextStyle({
                        stroke: new OlStroke({
                            color: textStyle.getStroke().getColor(),
                            width: textStyle.getStroke().getWidth()
                        }),
                        fill: new OlFill({
                            color: textStyle.getFill().getColor()
                        }),
                        font: textStyle.getFont()
                    });
                    newTextStyle.setText(textValue);
                    style.setText(newTextStyle);
                }
            }
            return style;
        }
    }
}