import OlVectorLayer from "ol/layer/Vector";
import OlGeometryType from "ol/geom/GeometryType"
import {Circle as OlCircleStyle, Icon as OlIconStyle, Fill as OlFill, Stroke as OlStroke, Text as OlTextStyle, Style as OlStyle} from "ol/style";
import OlFeature from "ol/Feature";
// temp
/* import * as OlColor from "ol/color";
import * as OlColorLike from "ol/colorlike"; */
// temp
import { StyleType } from "./StyleType"
import StyleFunction from "./StyleFunctionType";

/** @class StyleBuilder */
export default class StyleBuilder {
    
    private style: StyleType;
    // temp
    /* private uniqueStyles: Map<number, OlStyle>;
    private lastColor: number; */
    // temp
    private static readonly POSITIONS = {
        "top": 0,
        "bottom": 1,
        "left": 0,
        "right": 1,
        "center": 0.5
    }

    /**
     * @constructor
     * @memberof StyleBuilder
     * @param {Object} opts - options
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
        // temp
        /* this.uniqueStyles = new Map();
        this.lastColor = 10; */
        // temp
        this.applyOptions(opts);
    }

    /**
     * Applies options to style
     *
     * @function applyOptions
     * @memberof StyleBuilder
     * @param {Object} opts - options
     */
    private applyOptions(opts?: unknown): void {
        if (typeof opts !== "undefined") {
            if (Object.prototype.hasOwnProperty.call(opts, "point") && Object.keys(opts["point"]).length) {
                this.setPointStyle(opts["point"]);
            }
            if (Object.prototype.hasOwnProperty.call(opts, "linestring") && Object.keys(opts["linestring"]).length) {
                this.setLinestringStyle(opts["linestring"]);
            }
            if (Object.prototype.hasOwnProperty.call(opts, "polygon") && Object.keys(opts["polygon"]).length) {
                this.setPolygonStyle(opts["polygon"]);
                this.setGeometryCollectionStyle(opts["polygon"]);
            }
            if (Object.prototype.hasOwnProperty.call(opts, "label") && Object.keys(opts["label"]).length) {
                this.setTextStyle(opts["label"]);
            }
        }
    }

    /**
     * Sets point style
     *
     * @function setPointStyle
     * @memberof StyleBuilder
     * @param {Object} opts - options
     * @return {Object} style builder instance
     */
    private setPointStyle(opts: unknown): StyleBuilder {
        let style: OlStyle = null;
        if (opts["marker_type"] == "simple_point") {
            style = new OlStyle({
                image: new OlCircleStyle({
                    radius: opts["size"] || 2,
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
                    opacity: opts["opacity"] ? opts["opacity"] / 100 : 1,
                    rotation: opts["rotation"] ? opts["rotation"] * Math.PI / 180 : 0,
                    offset: opts["offset"],
                    anchor: opts["anchor"][0] && opts["anchor"][1] ? [StyleBuilder.POSITIONS[opts["anchor"][0]], StyleBuilder.POSITIONS[opts["anchor"][1]]] : [0.5, 0.5],
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

    /**
     * Sets linestring style
     *
     * @function setLinestringStyle
     * @memberof StyleBuilder
     * @param {Object} opts - options
     * @return {Object} style builder instance
     */
    private setLinestringStyle(opts: unknown): StyleBuilder {
        const style = new OlStyle({
            stroke: new OlStroke({
                color: opts["color"], 
                width: opts["stroke_width"]
            }),
        });
        this.style["LineString"] = style;
        this.style["MultiLineString"] = style;
        return this;
    }

    /**
     * Sets polygon style
     *
     * @function setPolygonStyle
     * @memberof StyleBuilder
     * @param {Object} opts - options
     * @return {Object} style builder instance
     */
    private setPolygonStyle(opts: unknown): StyleBuilder {
        const style = new OlStyle({
            stroke: new OlStroke({
                color: opts["color"], 
                width: opts["stroke_width"]
            }),
            fill: new OlFill({
                color: opts["opacity"] ? this.applyOpacity(opts["background_color"], opts["opacity"]) : opts["background_color"],
            }),
        });
        this.style["Polygon"] = style;
        this.style["MultiPolygon"] = style;
        return this;
    }

    /**
     * Sets text style
     *
     * @function setTextStyle
     * @memberof StyleBuilder
     * @param {Object} opts - options
     * @return {Object} style builder instance
     */
    private setTextStyle(opts: unknown): StyleBuilder {
        const style = new OlTextStyle({
            stroke: new OlStroke({
                color: opts["style"] && opts["style"]["stroke"] && opts["style"]["stroke"]["color"] ? opts["style"]["stroke"]["color"] : null, 
                width: opts["style"] && opts["style"]["stroke"] && opts["style"]["stroke"]["stroke_width"] ? opts["style"]["stroke"]["stroke_width"] : null
            }),
            fill: new OlFill({
                color: opts["style"] && opts["style"]["fill"] && opts["style"]["fill"]["background_color"] ? opts["style"]["fill"]["background_color"] : null
            }),
            font: opts["style"] && opts["style"]["font"] ? opts["style"]["font"] : null,
            text: opts["field"]
        });
        this.style["Text"] = style;
        return this;
    }

    /**
     * Sets geometry collection style
     *
     * @function setGeometryCollectionStyle
     * @memberof StyleBuilder
     * @param {Object} opts - options
     * @return {Object} style builder instance
     */
     private setGeometryCollectionStyle(opts: unknown): StyleBuilder {
        const opacity = this.applyOpacity(opts["background_color"], opts["opacity"]);
        const style = new OlStyle({
            image: new OlCircleStyle({
                radius: opts["size"] || 2,
                fill: new OlFill({
                    color: opts["opacity"] ? opacity : opts["background_color"],
                }),
                stroke: new OlStroke({
                    color: opts["color"], 
                    width: opts["stroke_width"]
                }),
            }),
            stroke: new OlStroke({
                color: opts["color"], 
                width: opts["stroke_width"]
            }),
            fill: new OlFill({
                color: opts["opacity"] ? opacity : opts["background_color"],
            }),
        });
        this.style["GeometryCollection"] = style;
        return this;
    }

    /**
     * Builds style
     *
     * @function build
     * @memberof StyleBuilder
     * @return {Function} style function
     */
    public build(): StyleFunction {
        return (feature: OlFeature, resolution: number): OlStyle | OlStyle[] => {
            const geomType = feature.getGeometry().getType();
            const style = this.style[geomType];

            // temp
            /* const valueToPaintOn: number = feature.getProperties()["attr_939_id"];
            let savedStyle: OlStyle = this.uniqueStyles.get(valueToPaintOn);
            if (!savedStyle) {
                // create style
                const color: OlColor.Color | OlColorLike.ColorLike = [this.lastColor, 0, 0, 0.5];
                savedStyle = new OlStyle({
                    stroke: new OlStroke({
                        color: color, 
                        width: 1
                    }),
                    fill: new OlFill({
                        color: color,
                    }),
                });
                this.lastColor += 10;
                this.uniqueStyles.set(valueToPaintOn, savedStyle);
            }
            return savedStyle; */
            // temp
            


            const textStyle: OlTextStyle = this.style["Text"];
            if (style && textStyle) {
                const textValue: string = feature.getProperties()[textStyle.getText()];
                if (textValue) {
                    const newTextStyle = new OlTextStyle({
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
            return style ? style : new OlVectorLayer().getStyleFunction()(feature, resolution); // default OL style
        }
    }

    /**
     * Applies opacity to hex color code
     *
     * @function applyOpacity
     * @memberof StyleBuilder
     * @param {String} color - hex color code
     * @param {Number} opacity - opacity value from 1 to 100
     * @return {String} hex code representing color and opacity
     */
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
}