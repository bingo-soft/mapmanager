import { Vector as OlVectorLayer } from "ol/layer"
import BaseVector from "ol/layer/BaseVector"
import { Vector as OlVectorSource } from "ol/source"
import GeoJSON from "ol/format/GeoJSON"
import Feature from "ol/Feature"
import Style from "ol/style/Style"
import BaseLayer from "../BaseLayer"
import LayerType from "../LayerType"
import SourceInterface from "../../Source/SourceInterface"
import { ApiClient } from '../../Util/Http/ApiClient'
import { ApiRequest } from '../../Util/Http/ApiRequest'

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

    public setRequest(request: ApiRequest): void {  
        const source : OlVectorSource = <OlVectorSource> this.layer.getSource();
        source.setLoader(async () => {
            const data: ArrayBuffer|Document|Element|string = await ApiClient.request(request);
            source.addFeatures(new GeoJSON().readFeatures(data));
        });
    }

    /**
     * @param {Object<import("ol/geom/GeometryType.js").default, Array<Style>>} style - Style
     */
    public setStyle(style: unknown): void { 
        (<BaseVector> this.layer).setStyle(<Style> style);
    }

    public addFeatures(features: string): void {
        (<OlVectorLayer> this.layer).getSource().addFeatures(new GeoJSON().readFeatures(features));
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

}