import {Circle as OlCircleStyle, Icon as OlIcon, Fill as OlFill, Stroke as OlStroke, Text as OlText, Style as OlStyle} from "ol/style";
import OlFillPattern from "ol-ext/style/FillPattern";

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

    /**
     * @param opts - style text representation
     * @param featureType - type of feature
     */ 
    constructor(opts: unknown, featureType: string) {
        this.applyStyle(opts, featureType);
    }

    /**
     * Applies options to style
     * @param style - style options
     * @param featureType - type of feature
     */
    private applyStyle(style: unknown, featureType: string): void {
        if (featureType == "Point") {
            style["point"] ? this.setPointStyle(style["point"]) : this.setTextStyle(style["label"]);
        }
        if (featureType == "MultiPoint") {
            this.setPointStyle(style["point"]);
        }
        if (featureType == "LineString" || featureType == "MultiLineString") {
            this.setLinestringStyle(style["linestring"], style["label"]);
        } 
        if (featureType == "Polygon" || featureType == "MultiPolygon") {
            this.setPolygonStyle(style["polygon"], style["label"]);
        }
        if (featureType == "GeometryCollection") {
            this.setGeometryCollectionStyle(style["polygon"]); 
        }
    }

    /**
     * Sets point style
     * @param opts - options
     */
    private setPointStyle(opts: unknown): void {
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
            style = new OlStyle({
                image: new OlIcon({
                    rotation: opts["r"] ? opts["r"] * Math.PI / 180 : 0,
                    offset: opts["off"],
                    anchor: opts["ach"][0] && opts["ach"][1] ? 
                        [FeatureStyleBuilder.ANCHOR_POSITION[opts["ach"][0]], FeatureStyleBuilder.ANCHOR_POSITION[opts["ach"][1]]] : [0.5, 0.5],
                    src: opts["if"],
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
        const patternArr = [];
        let patternStyle = null;
        let patternTotalLength = 0;
        const pattern = optsLinestring["p"];
        if (pattern) {
            pattern.forEach((item: unknown) => {
                if (item["tp"] == "t") {
                    //patternStyle = item["s"];
                    patternStyle = { "fnt": item["fs"] + "px " + item["fn"], "l": item["v"] }
                } else {
                    patternArr.push(item["w"]);
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
            optsLabel["rp"] = patternTotalLength;
        }
        this.style = new OlStyle({
            stroke: new OlStroke({
                color: optsLinestring["c"], 
                width: optsLinestring["w"],
                lineCap: optsLinestring["lc"],
                lineJoin: optsLinestring["lj"],
                lineDash: patternArr,
                lineDashOffset: optsLinestring["ldo"],
                miterLimit: optsLinestring["ml"]
            }),
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
        if (fillStyle == "empty") {
            fill = new OlFill({
                color: optsPolygon["bc"]
            });
        } else {
            fill = new OlFillPattern({
                pattern: fillStyle,
                size: optsPolygon["p"]["w"] || 1,
                color: optsPolygon["p"]["c"] || "rgb(255, 255, 255)",
                offset: optsPolygon["p"]["o"] || 0,
                scale: optsPolygon["p"]["s"] || 1,
                fill: new OlFill({
                    color: optsPolygon["bc"]
                }),
                spacing: optsPolygon["p"]["ss"] || 10,
                angle: optsPolygon["p"]["sr"] || 0
            });
        }
        this.style = new OlStyle({
            stroke: new OlStroke({
                color: optsPolygon["c"], 
                width: optsPolygon["w"]
            }),
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
    private createTextStyleInstance(opts: unknown): OlText | null {
        if (!opts) {
            return null;
        }
        const overflow = typeof opts["o"] === "boolean" ? opts["o"] : opts["o"] === "t";
        const rotateWithView = typeof opts["rwv"] === "boolean" ? opts["rwv"] : opts["rwv"] === "t";
        const placement = opts["p"] && opts["p"].toLowerCase() == "p" ? "point" : "line";
        return new OlText({
            stroke: new OlStroke({
                color: opts["c"],
                width: opts["w"]
            }),
            fill: new OlFill({
                color: opts["f"]
            }),
            font: opts["fnt"],
            text: opts["l"],
            textAlign: FeatureStyleBuilder.TEXT_ALIGN[opts["ta"]],
            textBaseline: FeatureStyleBuilder.TEXT_BASELINE[opts["tb"]],
            maxAngle: opts["ma"] ? opts["ma"] * Math.PI / 180 : 0,
            offsetX: opts["off"] && opts["off"][0] ? opts["off"][0] : null,
            offsetY: opts["off"] && opts["off"][1] ? opts["off"][1] : null,
            overflow: overflow,
            placement: placement,
            repeat: opts["rp"],
            scale: opts["sc"],
            rotateWithView: rotateWithView,
            rotation: opts["r"] ? opts["r"] * Math.PI / 180 : 0
        });
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
     * Builds style
     * @return style
     */
    public build(): OlStyle {
        return this.style;
    }
   
}