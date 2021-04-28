import { Vector as OlVectorLayer } from "ol/layer";
//import OlBaseVector from "ol/layer/BaseVector";
import { Source as OlSource } from "ol/source";
import { Vector as OlVectorSource } from "ol/source";
import OlGeoJSON from "ol/format/GeoJSON";
import OlFeature from "ol/Feature";
import BaseVectorLayer from "ol/layer/BaseVector";
import OlGeometryType from "ol/geom/GeometryType";
import { Style as OlStyle, Text as OlTextStyle, Fill as OlFill, Stroke as OlStroke } from "ol/style";
import { StyleType } from "../../Style/StyleType";
import SourceType from "../../Source/SourceType";
import SourceInterface from "../../Source/SourceInterface";
import { DefaultStyle } from "../../Style/Impl/DefaultStyle";
import FeatureCollection from "../../Feature/FeatureCollection";
import AbstractLayer from "../AbstractLayer";
import EventHandlerCollection from "../../EventHandlerCollection/EventHandlerCollection";
import StyleFunction from "../../Style/StyleFunctionType";


/** @class VectorLayer */
export default class VectorLayer extends AbstractLayer{
    
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
        this.layer = new OlVectorLayer();
    }

    public getType(): SourceType {
        return SourceType.Vector;
    }

    public getSource(): OlSource {
        return this.layer.getSource();
    }

    public setSource(source: SourceInterface): void {
        const olSource: OlVectorSource = <OlVectorSource> source.getSource();
        this.layer.setSource(olSource);
        this.eventHandlers = new EventHandlerCollection(olSource);
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

    public setStyle(style: StyleFunction): void {
        (<BaseVectorLayer> this.layer).setStyle(style);
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