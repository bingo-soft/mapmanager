//import OlMap from "ol/Map";
import {Circle as OlCircleStyle, Icon as OlIcon, Fill as OlFill, Stroke as OlStroke, Text as OlText, Style as OlStyle} from "ol/style";
import OlFillPattern from "ol-ext/style/FillPattern";
import ColorUtil from "../../../Infrastructure/Util/Color/ColorUtil";
import CustomFillPattern from "./CustomFillPattern";

/** FeatureStyleBuilder */
export default class FeatureStyleBuilder {
    private style: OlStyle;
    private static readonly ANCHOR_POSITION = {
        "t": 0,
        "b": 1,
        "l": 0,
        "r": 1,
        "c": 0.5
    }
    private static readonly TEXT_ALIGN = {
        "l": "left",
        "r": "right",
        "c": "center",
        "e": "end",
        "s": "start"
    }
    private static readonly TEXT_BASELINE = {
        "b": "bottom",
        "t": "top",
        "m": "middle",
        "a": "alphabetic",
        "h": "hanging",
        "i": "ideographic"
    }
    private static readonly DEFAULT_FONT_SIZE = 12;
    private static readonly DEFAULT_FONT_NAME = "Courier New";

    /**
     * @param opts - style text representation
     * @param featureType - type of feature
     */ 
    constructor(opts: unknown, featureType: string, pointIconFunction?: (url: string) => string) {
        this.applyStyle(opts, featureType, pointIconFunction);
    }

    /**
     * Applies options to style
     * @param style - style options
     * @param featureType - type of feature
     */
    private applyStyle(style: unknown, featureType: string, pointIconFunction?: (url: string) => string): void {
        if (featureType == "Point") {
            if (style["point"]) {
                this.setPointStyle(style["point"], pointIconFunction);
            } else if (style["label"]) {
                this.setTextStyle(style["label"]);
            }
        }
        if (featureType == "MultiPoint" && style["point"]) {
            this.setPointStyle(style["point"], pointIconFunction);
        }
        if ((featureType == "LineString" || featureType == "MultiLineString") && style["linestring"]) {
            this.setLinestringStyle(style["linestring"], style["label"]);
        }
        if ((featureType == "Polygon" || featureType == "MultiPolygon") && style["polygon"]) {
            this.setPolygonStyle(style["polygon"], style["label"]);
        }
        if (featureType == "GeometryCollection" && style["polygon"]) {
            this.setGeometryCollectionStyle(style["polygon"]); 
        }
    }

    /**
     * Sets point style
     * @param opts - options
     */
    private setPointStyle(opts: unknown, pointIconFunction?: (url: string) => string): Promise<void> {
        let style: OlStyle = null;
        if (opts["mt"] == "s") {
            style = new OlStyle({
                image: new OlCircleStyle({
                    radius: opts["w"] || 2,
                    fill: new OlFill({
                        color: opts["c"],
                    }),
                    stroke: new OlStroke({
                        color: opts["c"],
                        width: 1
                    }),
                }),
            });
        } else if (opts["mt"] == "i") {
            let sizes = [16, 16];
            if (opts["w"] && opts["w"][0] && opts["w"][1]) {
                sizes = this.buildIconSizes(opts["w"], opts["resolution"]);
            }
            style = new OlStyle({
                image: new OlIcon({
                    rotation: opts["r"] ? opts["r"] * Math.PI / 180 : 0,
                    offset: opts["off"],
                    anchor: opts["ach"] && opts["ach"][0] && opts["ach"][1] ? 
                        [FeatureStyleBuilder.ANCHOR_POSITION[opts["ach"][0]], FeatureStyleBuilder.ANCHOR_POSITION[opts["ach"][1]]] : [0.5, 0.5], 
                    width: sizes[0],  // opts["w"] && opts["w"][0] ? opts["w"][0] : undefined,
                    height: sizes[1], // opts["w"] && opts["w"][1] ? opts["w"][1] : undefined,
                    src: pointIconFunction ? pointIconFunction(opts["if"]) : "", //opts["if"],
                    //scale: 0.5
                })
            });
        } else {
            return;
        }
        this.style = style;
    }

    /**
     * Sets linestring style
     * @param optsLinestring - linestring style options
     * @param optsLabel - label style options
     */
    private setLinestringStyle(optsLinestring: unknown, optsLabel: unknown): void {
        let patternStyle = null;
        let patternTotalLength = 0;
        const pattern = optsLinestring["p"];
        if (pattern) {
            pattern.forEach((item: unknown) => {
                if (item["tp"] == "t") {
                    patternStyle = { "fnt": item["fs"] + "px " + item["fn"], "l": item["v"] }
                } else {
                    patternTotalLength += parseInt(item["w"]);
                }
            });
        }
        if (patternStyle) {
            optsLabel = patternStyle;
            optsLabel["p"] = "l";
            optsLabel["c"] = optsLinestring["c"];
            optsLabel["f"] = optsLinestring["c"];
            optsLabel["w"] = 1;
            optsLabel["rp"] = patternTotalLength != 0 ? patternTotalLength  + 5 : 30;
            optsLabel["resolution"] = optsLinestring["resolution"];
        }
        this.style = new OlStyle({
            stroke: this.createStrokeStyleInstance(optsLinestring),
            text: this.createTextStyleInstance(optsLabel)
        });
    }

    /**
     * Sets polygon style
     * @param optsPolygon - polygon style options
     * @param optsLabel - label style options
     */
    private setPolygonStyle(optsPolygon: unknown, optsLabel: unknown): void {
        let fill: OlFill | OlFillPattern = null;
        const fillStyle = (optsPolygon["fs"] ? optsPolygon["fs"] : "empty").toLowerCase();
        let backgroundColor = optsPolygon["bc"] ? optsPolygon["bc"] : "#fff";
        if (optsPolygon["o"]) {
            backgroundColor = ColorUtil.applyOpacity(backgroundColor, optsPolygon["o"]);
        }
        if (fillStyle == "empty") {
            fill = new OlFill({
                color: backgroundColor
            });
        } else if (fillStyle == "hatch_dash_dot" /* || fillStyle == "image" */)  {
            fill = new CustomFillPattern({
                pattern: fillStyle,
                size: optsPolygon["p"]["w"] || 1,
                color: optsPolygon["p"]["c"] || "rgb(255, 255, 255)",
                fill: new OlFill({color: backgroundColor})/* ,
                imageFile: optsPolygon["p"]["if"] || null */
            });
        } else {
            fill = new OlFillPattern({
                pattern: fillStyle,
                size: optsPolygon["p"]["w"] || 1,
                color: optsPolygon["p"]["c"] || "rgb(255, 255, 255)",
                offset: optsPolygon["p"]["o"] || 0,
                scale: optsPolygon["p"]["s"] || 1,
                fill: new OlFill({ color: backgroundColor }),
                spacing: optsPolygon["p"]["ss"] || 10,
                angle: optsPolygon["p"]["sr"] || 0,
                image: optsPolygon["p"]["if"] ? new OlIcon({ src: optsPolygon["p"]["if"] }) : null
            });
        }
        this.style = new OlStyle({
            stroke: optsPolygon["st"] ? this.createStrokeStyleInstance(optsPolygon["st"]) : null,
            fill: fill,
            text: this.createTextStyleInstance(optsLabel)
        });
    }

    /**
     * Sets text style
     * @param opts - options
     */
    private setTextStyle(opts: unknown): void {
        this.style = new OlStyle({
            image: new OlCircleStyle({
                radius: 0
            }),
            text: this.createTextStyleInstance(opts)
        });
    }

    /**
     * Creates and returns OL Text Style instance
     * @param opts - options
     * @return OL Text Style instance
     */
    private createTextStyleInstance(opts: unknown): OlText {
        if (!opts) {
            return null;
        }
        const overflow = typeof opts["o"] === "boolean" ? opts["o"] : opts["o"] === "t";
        const rotateWithView = typeof opts["rwv"] === "boolean" ? opts["rwv"] : opts["rwv"] === "t";
        const placement = opts["p"] && opts["p"].toLowerCase() == "p" ? "point" : "line";
        let font = opts["fnt"]; 
        if (opts["resolution"]) {
            font = this.buildFontString(opts["fs"], opts["fn"], opts["resolution"]);
        }
        let text = opts["l"];
        if (Array.isArray(text)) {
            text = this.buildFontArray(text, opts["resolution"]);
        }
        return new OlText({
            stroke: new OlStroke({
                color: opts["c"],
                width: opts["w"]
            }),
            fill: new OlFill({
                color: opts["f"]
            }),
            font: font,
            text: text,
            textAlign: FeatureStyleBuilder.TEXT_ALIGN[opts["ta"]],
            textBaseline: FeatureStyleBuilder.TEXT_BASELINE[opts["tb"]], // "alphabetic",
            maxAngle: opts["ma"] ? opts["ma"] * Math.PI / 180 : 0,
            offsetX: opts["off"] && opts["off"][0] ? opts["off"][0] : null,
            offsetY: opts["off"] && opts["off"][1] ? opts["off"][1] : null,
            overflow: overflow,
            placement: placement,
            repeat: opts["rp"],
            scale: opts["sc"],
            rotateWithView: rotateWithView,
            rotation: opts["r"] ? opts["r"] * Math.PI / 180 : 0,
        });
    }

    /**
     * Creates and returns OL stroke instance
     * @param optsLinestring - linestring style options
     */
    private createStrokeStyleInstance(optsLinestring: unknown): OlStroke {
        const patternArr = [];
        let patternTotalLength = 0;
        const pattern = optsLinestring["p"];
        if (pattern) {
            pattern.forEach((item: unknown) => {
                if (item["tp"] != "t") {
                    patternArr.push(item["w"]);
                    patternTotalLength += parseInt(item["w"]);
                }
            });
        }
        return new OlStroke({
            color: optsLinestring["c"] || "#000", 
            width: optsLinestring["w"] || 1,
            lineCap: optsLinestring["lc"],
            lineJoin: optsLinestring["lj"],
            lineDash: patternArr,
            lineDashOffset: optsLinestring["ldo"],
            miterLimit: optsLinestring["ml"]
        })
    }

    /**
     * Sets geometry collection style
     * @param opts - options
     * @return style builder instance
     */
    private setGeometryCollectionStyle(opts: unknown): void {
        this.style = new OlStyle({
            image: new OlCircleStyle({
                radius: opts["w"] || 2,
                fill: new OlFill({
                    color: opts["bc"],
                }),
                stroke: new OlStroke({
                    color: opts["c"], 
                    width: opts["s_w"]
                }),
            }),
            stroke: new OlStroke({
                color: opts["c"], 
                width: opts["sw"]
            }),
            fill: new OlFill({
                color: opts["bc"]
            }),
        });
    }

    /**
     * Builds font array depending on map resolution
     * @param value - array
     * @param resolution - map resolution
     * @return built array
     */
    private buildFontArray(value: any[], resolution: number): string[] {
        const result = [];
        for (let i = 0; i < value.length; i++) {
            if (i + 2 > value.length) {
                break;
            }
            if (i % 3 == 0) {
                result.push(value[i]);
                const fontString = this.buildFontString(value[i+1], value[i+2], resolution);
                result.push(fontString);
            }
        }
        return result;
    }

    /**
     * Builds font string depending on map resolution
     * @param size - font size
     * @param name - font name
     * @param resolution - map resolution
     * @return font string in CSS format
     */
    private buildFontString(size: number, name: string, resolution: number): string {
        size = size || FeatureStyleBuilder.DEFAULT_FONT_SIZE;
        name = name || FeatureStyleBuilder.DEFAULT_FONT_NAME;
        size = size / resolution * 2.5;
        //size = size / resolution / 32;
        size = isNaN(size) ? FeatureStyleBuilder.DEFAULT_FONT_SIZE : size;
        return size.toString() + "px " + name;   
    }

    /**
     * Returns an array of width and height depending on map resolution
     * @param sizes - array of width and height
     * @param resolution - map resolution
     * @return array of width and height
     */
    private buildIconSizes(size: number[], resolution: number): number[] {
        return [size[0] / resolution / 2.5, size[1] / resolution / 2.5];
    }

    /**
     * Builds style
     * @return style
     */
    public build(): OlStyle {
        return this.style;
    }
   
}