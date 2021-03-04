import { Vector as OlVectorLayer } from "ol/layer"
import BaseVector from "ol/layer/BaseVector"
import { Vector as OlVectorSource } from "ol/source"
import GeoJSON from "ol/format/GeoJSON"
import Feature from "ol/Feature"
import Style from "ol/style/Style"
import BaseLayer from "../BaseLayer"
import LayerType from "../LayerType"
import SourceInterface from "../../Source/SourceInterface"
//import { ProjectionOptions } from "../../Source/ProjectionOptions"
//import { ApiClient } from '../../../../Infrastructure/Http/ApiClient'
//import { ApiRequest } from '../../../../Infrastructure/Http/ApiRequest'

/** @class VectorLayer */
export default class VectorLayer extends BaseLayer {
    
    /**
     * @constructor
     * @memberof VectorLayer
     */
    constructor() {
        super();
        this.layer = new OlVectorLayer();
    }

    public getType(): LayerType {
        return LayerType.Vector;
    }

    public setSource(source: SourceInterface): void {
        this.layer.setSource(<OlVectorSource> source.getSource());
    }

    public setLoader(loader: () => Promise<string>, opts?: unknown): void {  
        const source : OlVectorSource = <OlVectorSource> this.layer.getSource();
        const crs: string = this.getCRS(opts);
        source.setLoader(async () => {
            const data = await loader();
            source.addFeatures(new GeoJSON().readFeatures(data, {
                dataProjection: crs,
                featureProjection: "EPSG:3857"
            }));
        });
    }

    /**
     * @param {Object<import("ol/geom/GeometryType.js").default, Array<Style>>} style - Style
     */
    public setStyle(style: unknown): void { 
        (<BaseVector> this.layer).setStyle(<Style> style);
    }

    public addFeatures(features: string, opts?: unknown): void {
        const crs: string = this.getCRS(opts);
        (<OlVectorLayer> this.layer).getSource().addFeatures(new GeoJSON().readFeatures(features, {
            dataProjection: crs,
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
    public getFeatures(): Feature[] {
        return (<OlVectorLayer> this.layer).getSource().getFeatures();
    }
    
    /**
     * Gets features of layer as GeoJSON
     *
     * @function getFeaturesAsGeoJSON
     * @memberof Layer
     * @return {String} - GeoJSON
     */
    public getFeaturesAsGeoJSON(): string {
        return new GeoJSON().writeFeatures(this.getFeatures());
    }

    private getCRS(opts?: unknown): string {
        let crs = "EPSG:3857";
        if (typeof opts !== "undefined" && Object.prototype.hasOwnProperty.call(opts, "srs_handling")) {
            if (opts["srs_handling"]["srs_handling_type"] == "keep_native") {
                crs = opts["srs_handling"]["native_coordinate_system_id"];
            } else {
                crs = opts["srs_handling"]["declared_coordinate_system_id"];
            }
        }
        return crs;
    }

}