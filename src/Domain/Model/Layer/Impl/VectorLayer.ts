import { Vector as OlVectorLayer } from "ol/layer";
//import OlBaseVector from "ol/layer/BaseVector";
import { Source as OlSource } from "ol/source";
import { Vector as OlVectorSource } from "ol/source";
import OlGeoJSON from "ol/format/GeoJSON";
import OlFeature from "ol/Feature";
import OlGeometryType from "ol/geom/GeometryType";
import { Style as OlStyle, Text as OlTextStyle, Fill as OlFill, Stroke as OlStroke } from "ol/style";
import { StyleType } from "../../Style/StyleType";
import BaseLayer from "../BaseLayer";
import SourceType from "../../Source/SourceType";
import SourceInterface from "../../Source/SourceInterface";
import { DefaultStyle } from "../../Style/Impl/DefaultStyle";
import FeatureCollection from "../../Feature/FeatureCollection";


/** @class VectorLayer */
export default class VectorLayer extends BaseLayer {

    private style: StyleType;
    
    /**
     * @constructor
     * @memberof VectorLayer
     */
    constructor(opts?: unknown) {
        super();
        this.srs = "EPSG:3857";
        if (typeof opts !== "undefined" && Object.prototype.hasOwnProperty.call(opts, "srs_handling")) {
            const srsH: unknown = opts["srs_handling"];
            this.srs = "EPSG:" + (srsH["srs_handling_type"] == "forced_declared" ? srsH["declared_coordinate_system_id"] : srsH["native_coordinate_system_id"]);
        }
        this.style = DefaultStyle;
        this.layer = new OlVectorLayer({
            style: (feature: OlFeature): OlStyle => { 
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
        });
    }

    public getType(): SourceType {
        return SourceType.Vector;
    }

    public getSource(): OlSource {
        return this.layer.getSource();
    }

    public setSource(source: SourceInterface): void {
        this.layer.setSource(<OlVectorSource> source.getSource());
    }

    public setLoader(loader: () => Promise<string>): void {   
        const source : OlVectorSource = <OlVectorSource> this.layer.getSource();
        source.setLoader(async () => {
            const data = await loader();
            source.addFeatures(new OlGeoJSON().readFeatures(data, {
                dataProjection: this.srs,
                featureProjection: "EPSG:3857"
            }));
        });
    }

    public setStyle(style: StyleType): void { 
        //(<BaseVector> this.layer).setStyle(style);
        this.style = style;
    }

    public addFeatures(features: string/* , opts?: unknown */): void {
        //const srs: number = this.getSRSId(opts);
        (<OlVectorLayer> this.layer).getSource().addFeatures(new OlGeoJSON().readFeatures(features, {
            dataProjection: this.srs,
            featureProjection: "EPSG:3857"
        }));
    }

    /**
     * Gets features of layer
     *
     * @function getFeatures
     * @memberof Layer
     * @return {Array} - features of the layer
     */
    private getFeatures(): OlFeature[] {
        return (<OlVectorLayer> this.layer).getSource().getFeatures();
    }

    public getFeatureCollection(): FeatureCollection {
        return new FeatureCollection(this.getFeatures(), this.srs);
    }
    
    /**
     * Gets features of layer as FeatureCollection GeoJSON
     *
     * @function getFeaturesAsFeatureCollection
     * @memberof Layer
     * @return {String} - GeoJSON
     */
    /* public getFeaturesAsFeatureCollection(): string {
        return new OlGeoJSON().writeFeatures(this.getFeatures(), {
            dataProjection: this.srs,
            featureProjection: "EPSG:3857"
        });
    }  */

}