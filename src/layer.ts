import BaseLayer from "ol/layer/Base";
import { Vector as VectorLayer } from "ol/layer"
import { Vector as VectorSource } from "ol/source"
import GeoJSON from "ol/format/GeoJSON"
import Feature from "ol/Feature"
import LayerType from "./layer-type"
import { geomStyles } from "./config"

/** @class Layer */
export default class Layer {
    private layer: BaseLayer;
    private type: string;

    /**
     * @constructor
     * @memberof Layer
     * @param {String} type - layer type 
     */
    constructor(type: string) {
        switch(type) {
            case LayerType.Vector:
                this.layer = new VectorLayer({
                    source: new VectorSource(),
                    style: (feature: Feature) => {
                        return geomStyles[feature.getGeometry().getType().toLowerCase()];
                    }
                });
                break;
            default:
                break;
        }
        this.type = type;
    }

    /**
     * Returns OpenLayers layer
     *
     * @function getLayer
     * @memberof Layer
     * @return {BaseLayer} - OpenLayers layer
     */
    public getLayer(): BaseLayer {
        return this.layer;
    }

    /**
     * Returns layer type
     *
     * @function getType
     * @memberof Layer
     * @return {String} - layer type
     */
    public getType(): string {
        return this.type;
    }

    /**
     * Adds features to layer
     *
     * @function addFeatures
     * @memberof Layer
     * @param {ArrayBuffer|Document|Element|Object|String} features - features
     */
    public addFeatures(features: ArrayBuffer|Document|Element|Object|string): void {
        if (this.type == LayerType.Vector) {
            (<VectorLayer>this.layer).getSource().addFeatures(new GeoJSON().readFeatures(features));
        }
    }

    /**
     * Gets features of layer
     *
     * @function getFeatures
     * @memberof Layer
     * @return {Array} - features of the layer
     */
    public getFeatures(): Feature[] {
        if (this.type == LayerType.Vector) {
            return (<VectorLayer>this.layer).getSource().getFeatures();
        }
        return null;
    }

    /**
     * Gets features of layer as GeoJSON
     *
     * @function getFeaturesAsGeoJSON
     * @memberof Layer
     * @return {String} GeoJSON
     */
    public getFeaturesAsGeoJSON(): string {
        return new GeoJSON().writeFeatures(this.getFeatures());
    }

}