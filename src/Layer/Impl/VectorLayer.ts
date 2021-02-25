import { Vector as OlVectorLayer } from "ol/layer"
import BaseVector from "ol/layer/BaseVector"
import { Vector as OlVectorSource } from "ol/source"
import GeoJSON from "ol/format/GeoJSON"
import Feature from "ol/Feature"
import BaseLayer from "../BaseLayer"
import LayerType from "../LayerType"
import SourceInterface from "../../Source/SourceInterface"

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

    public setUrl(baseUrl: string, params?: string[][]): void {
        (<OlVectorSource> this.layer.getSource()).setUrl(baseUrl + '?' + (new URLSearchParams(params).toString()));
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