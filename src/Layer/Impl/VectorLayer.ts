import { Vector as OlVectorLayer } from "ol/layer"
import BaseVector from "ol/layer/BaseVector"
import { Vector as OlVectorSource } from "ol/source"
import GeoJSON from "ol/format/GeoJSON"
import Feature from "ol/Feature"
import BaseLayer from "../BaseLayer"
import LayerType from "../LayerType"
import SourceInterface from "../../Source/SourceInterface"
import { ApiClient } from '../../Util/Http/ApiClient'
import { ApiRequest } from '../../Util/Http/ApiRequest'
import { VectorLayerApi } from './VectorLayerApi'

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
        let source : OlVectorSource = <OlVectorSource> this.layer.getSource();
        source.setLoader(async (extent, resolution, projection) => {
            let data = await ApiClient.shared.request(new VectorLayerApi.LoadLayer(
                request.baseURL,
                request.params,
                request.headers
            ));
            source.addFeatures(new GeoJSON().readFeatures(data));
        });
    }

    /**
     * @param {Object<import("ol/geom/GeometryType.js").default, Array<Style>>} style - Style
     */
    public setStyle(style): void { 
        (<BaseVector> this.layer).setStyle(style);
    }

    public addFeatures(features: ArrayBuffer|Document|Element|Object|string): void {
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