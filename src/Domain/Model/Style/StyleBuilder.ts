import { View as OlView } from "ol";
import {Circle as OlCircleStyle, Icon as OlIcon, Fill as OlFill, Stroke as OlStroke, Text as OlText, Style as OlStyle} from "ol/style";
import OlVectorLayer from "ol/layer/Vector";
import { LineString as OlLineString, Polygon as OlPolygon } from "ol/geom";
//import { Point as OlPoint, LineString as OlLineString} from "ol/geom";
import OlStrokePattern from "ol-ext/style/StrokePattern";
import OlFillPattern from "ol-ext/style/FillPattern";
import OlFeature from "ol/Feature";
import { StyleType } from "./StyleType"
import StyleFunction from "./StyleFunctionType";
import ObjectParser from "../../../Infrastructure/Util/ObjectParser";
import StringUtil from "../../../Infrastructure/Util/StringUtil";
import ColorUtil from "../../../Infrastructure/Util/Color/ColorUtil";
import SourceType from "../Source/SourceType";
import FeatureStyleBuilder from "./FeatureStyleBuilder";
import CustomFillPattern from "./CustomFillPattern";
//import CustomStrokePattern from "./CustomStrokePattern";
import LayerInterface from "../Layer/LayerInterface";


/** StyleBuilder */
export default class StyleBuilder {
    private layer: LayerInterface;
    private style: StyleType;
    private styleTemplated: StyleType;
    private clusterStyle: OlStyle;
    private defaultOLStyle: OlStyle;
    private field: string | string[];
    private isStyleInFeatureAttribute: boolean;
    private styleAttr: string;
    private externalStyleBuilder: (featureProps: unknown) => unknown;
    private uniqueColorField: string;
    private colorUtil: ColorUtil;
    //private showLabelMaxResolution: number;
    private pointIconFunction: (url: string) => string;
    private view: OlView;
    private featureDisplayRules: unknown;
    //private static readonly SHOW_LABEL_MAX_RESOLUTION = 10;
    private static readonly ANCHOR_POSITION = {
        "top": 0,
        "bottom": 1,
        "left": 0,
        "right": 1,
        "center": 0.5
    };
    styleTemplate: any[];

    /**
     * @param opts - options
     * @param layer - layer
     */ 
    constructor(opts: unknown, layer?: LayerInterface) {
        if (layer) {
            this.layer = layer;
            const layerProperties = layer.getProperties();
            if (layerProperties && Array.isArray(layerProperties["styleTemplate"])) {
                this.styleTemplate = layerProperties["styleTemplate"];
            }
        }
        this.style = { "Point": null, "MultiPoint": null, "LineString": null, "MultiLineString": null, "Polygon": null, "MultiPolygon": null, "GeometryCollection": null, "Text": null };
        this.defaultOLStyle = <OlStyle> new OlVectorLayer().getStyleFunction()(null, 0);
        // TODO: конвертировать короткие стили в длинные, если надо
        // opts = this.convertOptions(opts);
        this.featureDisplayRules = {};
        if (opts["feature_hide_rules"]) {
            const fdrStr = JSON.stringify(opts["feature_hide_rules"]).replace(/\s/g, '');
            this.featureDisplayRules = JSON.parse(fdrStr) || {};
        }
        this.applyOptions(opts);
    }

    /**
     * Applies options to style
     * @param opts - options
     * @param isTemplatedStyle - a boolean indicating that options are applied to templated style, defaults to false
     */
    private applyOptions(opts: unknown, isTemplatedStyle = false): OlStyle | void {
        if (typeof opts !== "undefined") {
            this.styleTemplated = { "Point": null, "MultiPoint": null, "LineString": null, "MultiLineString": null, "Polygon": null, "MultiPolygon": null, "GeometryCollection": null, "Text": null };
            this.isStyleInFeatureAttribute = false;
            if (Object.prototype.hasOwnProperty.call(opts, "style_in_feature_attribute")) {
                this.isStyleInFeatureAttribute = opts["style_in_feature_attribute"];
                this.styleAttr = opts["style_attribute"];
            }
            if (Object.prototype.hasOwnProperty.call(opts, "point_icon_function")) {
                this.pointIconFunction = opts["point_icon_function"];
            }
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
                this.setPointStyle(opts["point"], isTemplatedStyle);
                if (this.layer && this.layer.getType() == SourceType.Cluster) {
                    this.setClusterStyle(opts["point"]);
                }
            }
            if (Object.prototype.hasOwnProperty.call(opts, "linestring") && Object.keys(opts["linestring"]).length != 0) {
                if (hasUniqueStyle && opts["linestring"]) {
                    opts["linestring"]["color"] = opts["unique_values"]["start_color"];
                }
                this.setLinestringStyle(opts["linestring"], isTemplatedStyle);
            }
            if (Object.prototype.hasOwnProperty.call(opts, "polygon") && Object.keys(opts["polygon"]).length != 0) {
                if (hasUniqueStyle && opts["polygon"]) {
                    opts["polygon"]["background_color"] = opts["unique_values"]["start_color"];
                }
                this.setPolygonStyle(opts["polygon"], isTemplatedStyle);
                this.setGeometryCollectionStyle(opts["polygon"], isTemplatedStyle);
            }
            if (Object.prototype.hasOwnProperty.call(opts, "label") && Object.keys(opts["label"]).length != 0) {
                this.setTextStyle(opts["label"]);
            }
            if (Object.prototype.hasOwnProperty.call(opts, "style_builder")) {
                this.externalStyleBuilder = opts["style_builder"];
            }
            /* this.showLabelMaxResolution = StyleBuilder.SHOW_LABEL_MAX_RESOLUTION;
            if (Object.prototype.hasOwnProperty.call(opts, "show_label_max_resolution")) {
                this.showLabelMaxResolution = opts["show_label_max_resolution"];
            } */
        }
    }

    /**
     * Sets point style
     * @param opts - options
     * @return style builder instance
     */
    private setPointStyle(opts: unknown, isTemplatedStyle: boolean): StyleBuilder {
        let style: OlStyle = null;
        if (opts["marker_type"] == "simple_point") {
            if (!opts["background_color"]) {
                opts["background_color"] = opts["color"];
            }
            style = new OlStyle({
                image: new OlCircleStyle({
                    radius: opts["size"] || 2,
                    fill: new OlFill({
                        color: opts["background_color"] && opts["opacity"] !== undefined ? ColorUtil.applyOpacity(opts["background_color"], opts["opacity"]) : opts["background_color"],
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
                    anchor: opts["anchor"] && opts["anchor"][0] && opts["anchor"][1] ? [StyleBuilder.ANCHOR_POSITION[opts["anchor"][0]], StyleBuilder.ANCHOR_POSITION[opts["anchor"][1]]] : [0.5, 0.5],
                    src: opts["image_path"],
                })
            });
        } else {
            return;
        }
        const res = isTemplatedStyle ? this.styleTemplated : this.style;
        res["Point"] = style;
        res["MultiPoint"] = style;
        return this;
    }

    /**
     * Sets linestring style
     * @param opts - options
     * @return style builder instance
     */
    private setLinestringStyle(opts: unknown, isTemplatedStyle: boolean): StyleBuilder {
        let style = null;
        const pattern = (opts["pattern"] ? opts["pattern"] : "empty").toLowerCase();
        let backgroundColor = opts["background_color"] ? opts["background_color"] : "#fff";
        if (opts["opacity"]) {
            backgroundColor = ColorUtil.applyOpacity(backgroundColor, opts["opacity"]);
        }

        let color = opts["color"] ? opts["color"] : "#fff";
        if (opts["opacity"]) {
            color = ColorUtil.applyOpacity(color, opts["opacity"]);
        }
        if (pattern == "empty") {
            style = new OlStyle({
                stroke: new OlStroke({
                    color: color, 
                    width: opts["stroke_width"],
                    lineCap: opts["line_cap"],
                    lineJoin: opts["line_join"],
                    lineDash: opts["line_dash"],
                    lineDashOffset: opts["line_dash_offset"],
                    miterLimit: opts["miter_limit"]
                }),
            });
            /* const image = new Image();
            image.src = "line-1.png";
            image.onload = () => {
                const ctx = document.createElement('canvas').getContext("2d");
                const pattern = ctx.createPattern(image,"repeat");
                const style = new OlStyle({
                    stroke:  new OlStroke({
                        width: 8,
                        color: pattern
                    })
                });
                const res = isTemplatedStyle ? this.styleTemplated : this.style;
                res["LineString"] = style;
                res["MultiLineString"] = style;
                return this;
            };

        
            const style = new OlStyle({
                stroke: new OlStrokePattern({
                    pattern: "image",
                    //pattern: "hatch",
                    size:  15,
                    //color: "#000",
                    //background: "#fff",
                    image: new OlIcon({ src: "line-1.png" })
                })
            }); */
        } else {
            /* style = new OlStyle({
                stroke: new CustomStrokePattern({
                    pattern: pattern,
                    size: opts["stroke_width"] || 1,
                    color: opts["color"] || "rgb(255, 255, 255)",
                    opacity: 100,
                    fill: new OlFill({color: backgroundColor}),
                })
            }); */
        }
        const res = isTemplatedStyle ? this.styleTemplated : this.style;
        res["LineString"] = style;
        res["MultiLineString"] = style;
        return this;
    }

    /**
     * Sets polygon style
     * @param opts - options
     * @return style builder instance
     */
    private setPolygonStyle(opts: unknown, isTemplatedStyle: boolean): StyleBuilder {
        let fill: OlFill | OlFillPattern = null;
        const fillStyle = (opts["fill_style"] ? opts["fill_style"] : "empty").toLowerCase();
        let backgroundColor = opts["background_color"] ? opts["background_color"] : "#fff";
        if (opts["opacity"]) {
            backgroundColor = ColorUtil.applyOpacity(backgroundColor, opts["opacity"]);
        }
        if (fillStyle == "empty") {
            fill = new OlFill({color: backgroundColor});
        } else if (fillStyle == "hatch_dash_dot"/*  || fillStyle == "image" */)  {
            fill = new CustomFillPattern({
                pattern: fillStyle,
                size: opts["pattern_stroke_width"] || 1,
                color: opts["pattern_color"] || "rgb(255, 255, 255)",
                fill: new OlFill({color: backgroundColor}),
                angle: Math.PI / 2 /* ,
                imageFile: opts["pattern_image_file"] || null */
            });
        } else {
            fill = new OlFillPattern({
                pattern: fillStyle,
                size: opts["pattern_stroke_width"] || 1,
                color: opts["pattern_color"] || "rgb(255, 255, 255)",
                offset: opts["pattern_offset"] || 0,
                scale: opts["pattern_scale"] || 1,
                fill: new OlFill({color: backgroundColor}),
                spacing: opts["pattern_stroke_spacing"] || 10,
                angle: opts["pattern_stroke_rotation"] || 0,
                image: opts["pattern_image_file"] ? new OlIcon({ src: opts["pattern_image_file"] }) : null
            });
        }
        const style = new OlStyle({
            stroke: new OlStroke({
                color: opts["color"], 
                width: opts["stroke_width"]
            }),
            fill: fill
        });
        const res = isTemplatedStyle ? this.styleTemplated : this.style;
        res["Polygon"] = style;
        res["MultiPolygon"] = style;
        return this;
    }

    /**
     * Sets text style
     * @param opts - options
     * @return style builder instance
     */
    private setTextStyle(opts: unknown): StyleBuilder {
        const overflow = typeof opts["overflow"] === "boolean" ? opts["overflow"] : opts["overflow"] === "true";
        const rotateWithView = typeof opts["rotate_with_view"] === "boolean" ? opts["rotate_with_view"] : opts["rotate_with_view"] === "true";
        const style = new OlText({
            stroke: new OlStroke({
                color: opts["color"],
                width: opts["stroke_width"]
            }),
            fill: new OlFill({
                color: opts["fill"]
            }),
            font: opts["font"],
            text: opts["field"] ? opts["field"] : opts["text"],
            textAlign: opts["text_align"],
            justify: opts["justify"],
            textBaseline: opts["text_baseline"],
            maxAngle: opts["max_angle"] ? opts["max_angle"] * Math.PI / 180 : 0,
            offsetX: opts["offset"] && opts["offset"][0] ? opts["offset"][0] : null,
            offsetY: opts["offset"] && opts["offset"][1] ? opts["offset"][1] : null,
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
     private setGeometryCollectionStyle(opts: unknown, isTemplatedStyle: boolean): StyleBuilder {
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
        const res = isTemplatedStyle ? this.styleTemplated : this.style;
        res["GeometryCollection"] = style;
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
     * @param useLabelTextOption - whether to use label text option instead of field option
     * @return style function
     */
    public build(useExternalStyleBuilder = false, useLabelTextOption = false): StyleFunction {
        return (feature: OlFeature, resolution: number): OlStyle | OlStyle[] => { 
            // hide features on given zoom levels
            if (!this.view && this.layer) {
                this.view = this.layer.getMap().getMap().getView();
            }
            if (this.view) {
                const zoom = this.view.getZoom();
                const showFeature = this.showFeatureOnZoom(feature, zoom);
                if (!showFeature){
                    return undefined;
                }
            }

            let style = null;
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
            const geomType = feature.getGeometry().getType();
            const featureProps = feature.getProperties();

            // template based styles
            const layerProperties = this.layer ? this.layer.getProperties() : null;
            if (layerProperties && Array.isArray(layerProperties["styleTemplate"])) {
                this.styleTemplate = layerProperties["styleTemplate"];
                if (this.styleTemplate) {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const context = feature.getProperties();
                    for (let i = 0; i < this.styleTemplate.length; i++) {
                        const condition = eval(this.styleTemplate[i].condition);
                        if (condition) {
                            this.applyOptions(this.styleTemplate[i].style, true);
                            return this.styleTemplated[geomType] ? this.styleTemplated[geomType] : this.style[geomType];
                        }
                    }
                }
            }
            
            // feature based styles
            if (this.isStyleInFeatureAttribute && this.layer && featureProps) {
                const featureStyle = typeof featureProps[this.styleAttr] === "string"
                  ? JSON.parse(featureProps[this.styleAttr]) : featureProps[this.styleAttr];

                if (featureStyle && Object.keys(featureStyle).length != 0) {
                    if (featureStyle["label"]) {
                        featureStyle["label"]["resolution"] = resolution;
                    }
                    if (featureStyle["linestring"]) {
                        featureStyle["linestring"]["resolution"] = resolution;
                    }
                    if (featureStyle["point"]) {
                        featureStyle["point"]["resolution"] = resolution;
                    }
                    return new FeatureStyleBuilder(this.layer, feature, geomType, featureStyle, this.featureDisplayRules, this.pointIconFunction).build();
                }
            }
            // common features
            if (useExternalStyleBuilder && typeof this.externalStyleBuilder === "function") {
                const featureStyle = this.externalStyleBuilder(featureProps);
                this.applyOptions(featureStyle);
            }
            if (this.style[geomType]) {
                style = this.style[geomType];
            }
            // painting on unique attribute value
            this.paintOnUniqueAttributeValue(feature, <OlStyle> style);
            // apply text 
            this.applyText(feature, style, geomType, resolution, useLabelTextOption);
            return style ? <OlStyle> style : this.defaultOLStyle;
        }
    }

    /**
     * Aplies text value to the style
     * @param feature - feature
     * @param style - style to apply the text value to
     * @param geomType - feature geometry type
     * @param resolution - current map view resolution
     * @param useLabelTextOption - whether to use label text option instead of field option
     */
    private applyText(feature: OlFeature, style: OlStyle, geomType: string, resolution: number, useLabelTextOption = false): void {
        const textStyle: OlText = this.style["Text"];
        if (style && textStyle) {
            if (useLabelTextOption && feature.get("label")) {
                textStyle.setText(feature.get("label").toString());
                style.setText(textStyle);
                return;
            }    
            if (!this.field) {
                this.field = textStyle.getText();
            }
            const properties = feature.getProperties();
            if (properties && properties[<string> this.field]) {
                let textValue: string = properties[<string> this.field].toString();
                if (textValue) { 
                    if (geomType != "Polygon" && geomType != "MultiPolygon") {
                        //textValue = StringUtil.adjustText(textValue, resolution, this.showLabelMaxResolution);
                        textValue = StringUtil.divideString(textValue, 16, "\n");
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

    /**
     * Returns a boolean flag indicating whether to show a feature on the map for the given zoom
     * @param feature - feature
     * @param zoom - zoom
     * @return flag
     */
    private showFeatureOnZoom(feature: OlFeature, zoom: number): boolean {
        const geometry = feature.getGeometry();
        const geometryType = geometry.getType();
        if ((geometryType == "Point" || geometryType == "MultiPoint")) {
            const rule = this.featureDisplayRules["point_min_zoom"];
            return rule ? zoom >= rule : true;
        } else {
            // vertices count
            let rule = this.getRuleForZoom("line_polygon_vertices_zoom", zoom)
            if (rule) {
                const flatCoords = (<OlLineString | OlPolygon> geometry).getFlatCoordinates();
                const verticesCount = flatCoords.length;
                return this.applyRule(rule, verticesCount);
            }
            // lines length
            if (geometryType == "LineString") {
                rule = this.getRuleForZoom("line_length_zoom", zoom)
                if (rule) {
                    const flatCoords = (<OlLineString> geometry).getFlatCoordinates();
                    let lineLength = 0;
                    for (let i = 0; i < flatCoords.length; i += 2) {
                        const x0 = flatCoords[i];
                        const y0 = flatCoords[i + 1];
                        const x1 = flatCoords[i + 2];
                        const y1 = flatCoords[i + 3];
                        if (x0 && y0 && x1 && y1) {
                            lineLength += Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
                        }
                    }
                    return this.applyRule(rule, lineLength);
                }
            }
        }
        return true;
    }

    /**
     * Returns a rule for the given zoom
     * @param section - rule section
     * @param zoom - zoom
     * @return rule
     */
    private getRuleForZoom(section: string, zoom: number): string {
        const rules = this.featureDisplayRules[section];
        if (!rules) {
            return null;
        }
        const rule = rules[Math.round(zoom)];
        if (!rule) {
            return null;
        }
        return rule;
    }

    /**
     * Applies rule
     * @param rule - rule
     * @param param - param
     * @return whether to show a feature
     */
    private applyRule(rule: string, param: number): boolean {
        const sign = rule.substring(0, 1);
        const value = parseFloat(rule.substring(1));
        if (sign == ">") {
            if (param > value) {
                return false; 
            }   
        }
        if (sign == "<") {
            if (param < value) {
                return false; 
            }   
        }
        return true;
    }

   
}