import {Circle as OlCircleStyle, Icon as OlIcon, Fill as OlFill, Stroke as OlStroke, Text as OlText, Style as OlStyle} from "ol/style";
import OlFillPattern from "ol-ext/style/FillPattern";

/** StyleBuilder */
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
     * @param style - style text representation
     * @param featureType - type of feature
     */ 
    constructor(style: string, featureType: string) {
        this.applyStyle(style, featureType);
    }

    /**
     * Applies options to style
     * @param style - style options
     * @param featureType - type of feature
     */
    private applyStyle(style: unknown, featureType: string): void {
        if (featureType == "Point") {
            style["point"] !== undefined ? this.setPointStyle(style["point"]) : this.setTextStyle(style["label"]);
        }
        if (featureType == "MultiPoint") {
            this.setPointStyle(style["point"]);
        }
        if (featureType == "LineString" || featureType == "MultiLineString") {
            this.setLinestringStyle(style["linestring"]);
        } 
        if (featureType == "Polygon" || featureType == "MultiPolygon") {
            this.setPolygonStyle(style["polygon"]);
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
     * @param opts - options
     */
    private setLinestringStyle(opts: unknown): void {
        this.style = new OlStyle({
            stroke: new OlStroke({
                color: opts["c"], 
                width: opts["w"],
                lineCap: opts["lc"],
                lineJoin: opts["lj"],
                lineDash: opts["p"],
                lineDashOffset: opts["ldo"],
                miterLimit: opts["ml"]
            }),
        });
    }

    /**
     * Sets polygon style
     * @param opts - options
     */
    private setPolygonStyle(opts: unknown): void {
        let fill: OlFill | OlFillPattern = null;
        const fillStyle = (opts["fs"] ? opts["fs"] : "empty").toLowerCase();
        if (fillStyle == "empty") {
            fill = new OlFill({
                color: opts["bc"]
            });
        } else {
            fill = new OlFillPattern({
                pattern: fillStyle,
                size: opts["p"]["w"] || 1,
                color: opts["p"]["c"] || "rgb(255, 255, 255)",
                offset: opts["p"]["o"] || 0,
                scale: opts["p"]["s"] || 1,
                fill: new OlFill({
                    color: opts["bc"]
                }),
                spacing: opts["p"]["ss"] || 10,
                angle: opts["p"]["sr"] || 0
            });
        }
        this.style = new OlStyle({
            stroke: new OlStroke({
                color: opts["c"], 
                width: opts["w"]
            }),
            fill: fill
        });
    }

    /**
     * Sets text style
     * @param opts - options
     */
    private setTextStyle(opts: unknown): void {
        const overflow = typeof opts["o"] === "boolean" ? opts["o"] : opts["o"] === "t";
        const rotateWithView = typeof opts["rwv"] === "boolean" ? opts["rwv"] : opts["rwv"] === "t";
        const textStyle = new OlText({
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
            placement: opts["p"],
            scale: opts["sc"],
            rotateWithView: rotateWithView,
            rotation: opts["r"] ? opts["r"] * Math.PI / 180 : 0,
        });
        this.style = new OlStyle({
            image: new OlCircleStyle({
                radius: 0
            }),
            text: textStyle
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