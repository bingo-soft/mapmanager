import {Circle as OlCircleStyle, Icon as OlIcon, Fill as OlFill, Stroke as OlStroke, Text as OlText, Style as OlStyle} from "ol/style";
import OlFillPattern from "ol-ext/style/FillPattern";
import OlFeature from "ol/Feature";
import { StyleType } from "./StyleType"
import StyleFunction from "./StyleFunctionType";
import ObjectParser from "../../../Infrastructure/Util/ObjectParser";
import StringUtil from "../../../Infrastructure/Util/StringUtil";
import ColorUtil from "../../../Infrastructure/Util/Color/ColorUtil";
import SourceType from "../Source/SourceType";

/** StyleBuilder */
export default class StyleBuilder {
    private sourceType: SourceType;
    private style: StyleType;
    private clusterStyle: OlStyle;
    private field: string;
    private externalStyleBuilder: (featureProps: unknown) => unknown;
    private uniqueColorField: string;
    private colorUtil: ColorUtil;
    private showLabelMaxResolution: number;
    private static readonly SHOW_LABEL_MAX_RESOLUTION = 10;
    private static readonly POSITIONS = {
        "top": 0,
        "bottom": 1,
        "left": 0,
        "right": 1,
        "center": 0.5
    }

    /**
     * @param opts - options
     */ 
    constructor(opts?: unknown, sourceType?: SourceType) {
        this.sourceType = sourceType;
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

    /**
     * Applies options to style
     * @param opts - options
     */
    private applyOptions(opts?: unknown): void {
        if (typeof opts !== "undefined") {
            let hasUniqueStyle = false;
            if (Object.prototype.hasOwnProperty.call(opts, "unique_values") && Object.keys(opts["unique_values"]).length != 0) {
                hasUniqueStyle = true;
                this.colorUtil = new ColorUtil(opts["unique_values"]["start_color"], opts["unique_values"]["increment_color"]);
                this.uniqueColorField = opts["unique_values"]["field"];
            }
            if (Object.prototype.hasOwnProperty.call(opts, "point") && Object.keys(opts["point"]).length != 0) {
                if (hasUniqueStyle && opts["point"]) {
                    opts["point"]["color"] = opts["unique_values"]["start_color"];
                }
                this.setPointStyle(opts["point"]);
                if (this.sourceType == SourceType.Cluster) {
                    this.setClusterStyle(opts["point"]);
                }
            }
            if (Object.prototype.hasOwnProperty.call(opts, "linestring") && Object.keys(opts["linestring"]).length != 0) {
                if (hasUniqueStyle && opts["linestring"]) {
                    opts["linestring"]["color"] = opts["unique_values"]["start_color"];
                }
                this.setLinestringStyle(opts["linestring"]);
            }
            if (Object.prototype.hasOwnProperty.call(opts, "polygon") && Object.keys(opts["polygon"]).length != 0) {
                if (hasUniqueStyle && opts["polygon"]) {
                    opts["polygon"]["background_color"] = opts["unique_values"]["start_color"];
                }
                this.setPolygonStyle(opts["polygon"]);
                this.setGeometryCollectionStyle(opts["polygon"]);
            }
            if (Object.prototype.hasOwnProperty.call(opts, "label") && Object.keys(opts["label"]).length != 0) {
                this.setTextStyle(opts["label"]);
            }
            if (Object.prototype.hasOwnProperty.call(opts, "style_builder")) {
                this.externalStyleBuilder = opts["style_builder"];
            }
            this.showLabelMaxResolution = StyleBuilder.SHOW_LABEL_MAX_RESOLUTION;
            if (Object.prototype.hasOwnProperty.call(opts, "show_label_max_resolution")) {
                this.showLabelMaxResolution = opts["show_label_max_resolution"];
            }
        }
    }

    /**
     * Sets point style
     * @param opts - options
     * @return style builder instance
     */
    private setPointStyle(opts: unknown): StyleBuilder {
        let style: OlStyle = null;
        if (opts["marker_type"] == "simple_point") {
            style = new OlStyle({
                image: new OlCircleStyle({
                    radius: opts["size"] || 2,
                    fill: new OlFill({
                        color: opts["color"] && opts["opacity"] !== undefined ? ColorUtil.applyOpacity(opts["color"], opts["opacity"]) : opts["color"],
                    }),
                    stroke: new OlStroke({
                        color: opts["color"],
                        width: 1
                    }),
                }),
            });
        } else if (opts["marker_type"] == "image") {
            style = new OlStyle({
                image: new OlIcon({
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
     * @param opts - options
     * @return style builder instance
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
     * @param opts - options
     * @return style builder instance
     */
    private setPolygonStyle(opts: unknown): StyleBuilder {
        let fill: OlFill | OlFillPattern = null;
        const fillStyle = (opts["fill_style"] ? opts["fill_style"] : "empty").toLowerCase();
        let backgroundColor = opts["background_color"] ? opts["background_color"] : "#fff";
        if (opts["opacity"]) {
            backgroundColor = ColorUtil.applyOpacity(backgroundColor, opts["opacity"]);
        }
        if (fillStyle == "empty") {
            fill = new OlFill({color: backgroundColor});
        } else {
            fill = new OlFillPattern({
                pattern: fillStyle,
                size: opts["pattern_stroke_width"] || 0,
                color: opts["pattern_color"] || "rgb(255, 255, 255)",
                offset: opts["pattern_offset"] || 0,
                scale: opts["pattern_scale"] || 0,
                fill: new OlFill({color: backgroundColor}),
                spacing: opts["pattern_stroke_spacing"] || 0,
                angle: opts["pattern_stroke_rotation"] || 0
            });            
        }
        const style = new OlStyle({
            stroke: new OlStroke({
                color: opts["color"], 
                width: opts["stroke_width"]
            }),
            fill: fill
        });
        this.style["Polygon"] = style;
        this.style["MultiPolygon"] = style;
        return this;
    }

    /**
     * Sets text style
     * @param opts - options
     * @return style builder instance
     */
    private setTextStyle(opts: unknown): StyleBuilder {
        const overflow = typeof opts["overflow"] === "boolean" ? opts["overflow"] : opts["overflow"] === "true";
        const rotateWithView = typeof opts["rotateWithView"] === "boolean" ? opts["rotateWithView"] : opts["rotateWithView"] === "true";
        const style = new OlText({
            stroke: new OlStroke({
                color: opts["color"],
                width: opts["stroke_width"]
            }),
            fill: new OlFill({
                color: opts["fill"]
            }),
            font: opts["font"],
            text: opts["field"],
            textAlign: opts["text_align"],
            textBaseline: opts["text_baseline"],
            maxAngle: opts["max_angle"] ? opts["max_angle"] * Math.PI / 180 : 0,
            offsetX: opts["offset"][0] ? opts["offset"][0] : null,
            offsetY: opts["offset"][1] ? opts["offset_y"][1] : null,
            overflow: overflow,
            placement: opts["placement"],
            scale: opts["scale"],
            rotateWithView: rotateWithView,
            rotation: opts["rotation"] ? opts["rotation"] * Math.PI / 180 : 0,
        });
        this.style["Text"] = style;
        return this;
    }

    /**
     * Sets geometry collection style
     * @param opts - options
     * @return style builder instance
     */
     private setGeometryCollectionStyle(opts: unknown): StyleBuilder {
        const opacity = opts["background_color"] && opts["opacity"] !== undefined ? ColorUtil.applyOpacity(opts["background_color"], opts["opacity"]) : null;
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
     * Sets cluster style
     * @param opts - options
     * @return style builder instance
     */
     private setClusterStyle(opts: unknown): StyleBuilder { 
        let style: OlStyle = null;
        style = new OlStyle({
            image: new OlCircleStyle({
                radius: opts["cluster_size"] || 2,
                fill: new OlFill({
                    color: opts["cluster_color"] && opts["cluster_opacity"] !== undefined ? 
                        ColorUtil.applyOpacity(opts["cluster_color"], opts["cluster_opacity"]) : opts["cluster_color"],
                }),
                stroke: new OlStroke({
                    color: opts["cluster_color"],
                    width: 1
                })
            }),
            text: new OlText({
                font: opts["cluster_font"],
                fill: new OlFill({
                    color: opts["cluster_text_color"] || "#fff"
                })
            })
        });
        this.clusterStyle = style;
        return this;
    }

    /**
     * Builds style
     * @param useExternalStyleBuilder - whether to use external style builder
     * @return style function
     */
    public build(useExternalStyleBuilder = true): StyleFunction {
        return (feature: OlFeature, resolution: number): OlStyle | OlStyle[] => {
            let style: OlStyle;
            // clustered features
            const clusteredFeatures = feature.get('features');
            if (clusteredFeatures) {
                const size = clusteredFeatures.length;
                if (size != 1) {
                    style = this.clusterStyle;
                    if (style) {
                        const text = style.getText();
                        text.setText(size.toString());
                        style.setText(text);
                        return style;
                    }
                }
            }
            // common features
            if (useExternalStyleBuilder && typeof this.externalStyleBuilder === "function") {
                const featureProps = feature.getProperties();
                const featureStyle = this.externalStyleBuilder(featureProps);
                this.applyOptions(featureStyle);
            }
            const geomType = feature.getGeometry().getType();
            if (this.style[geomType]) {
                style = this.style[geomType];
            } else {
                style = new OlStyle({
                    stroke: new OlStroke({
                        color: "#FF0000", 
                        width: 2
                    }),
                    fill: new OlFill({
                        color: "rgba(255, 255, 255, 0.4)",
                    }),
                    image: new OlCircleStyle({
                        radius: 2,
                        fill: new OlFill(),
                        stroke: new OlStroke()
                    })
                });
            }
            // painting on unique attribute value
            this.paintOnUniqueAttributeValue(feature, style);
            // apply text 
            this.applyText(feature, style, geomType, resolution);
            return style;
        }
    }

    /**
     * Aplies text value to the style
     * @param feature - feature
     * @param style - style to apply the text value to
     * @param geomType - feature geometry type
     * @param resolution - current map view resolution
     */
    private applyText(feature: OlFeature, style: OlStyle, geomType: string, resolution: number): void {
        const textStyle: OlText = this.style["Text"];
        if (style && textStyle) {
            if (!this.field) {
                this.field = textStyle.getText();
            }
            const properties = feature.getProperties();
            if (properties) {
                let textValue: string = properties[this.field];
                if (textValue) { 
                    if (geomType != "Polygon" && geomType != "MultiPolygon") {
                        textValue = StringUtil.adjustText(textValue, resolution, this.showLabelMaxResolution);
                    }
                    textStyle.setText(textValue);
                    style.setText(textStyle);
                }
            }
        }
    }

    /**
     * Applies unique stroke and fill colors by attribute value
     * @param feature - feature
     * @param style - style to apply the painting
     */
    private paintOnUniqueAttributeValue(feature: OlFeature, style: OlStyle): void {
        if (this.uniqueColorField) { 
            let valueToPaintOn: string = feature.getProperties()[this.uniqueColorField];
            if (valueToPaintOn) {
                valueToPaintOn = ObjectParser.parseAttributeValue(valueToPaintOn);
                const htmlColor = this.colorUtil.getUniqueColor(valueToPaintOn);
                let stroke = style.getStroke();
                let fill = style.getFill();
                if (stroke) {
                    stroke.setColor(htmlColor);
                }
                if (fill) {
                    fill.setColor(htmlColor);
                }
                const image = style.getImage(); // points
                if (image) {
                    stroke = (<OlCircleStyle> image).getStroke();
                    if (stroke) {
                        stroke.setColor(htmlColor);
                    }
                    fill = (<OlCircleStyle> image).getFill();
                    if (fill) {
                        fill.setColor(htmlColor);
                    }
                    style.setImage(image);
                }
            }
        }
    }

   
}