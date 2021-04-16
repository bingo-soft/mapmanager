import OlFeature from "ol/Feature";
import { Layer as OlLayer } from "ol/layer";

/** @class Feature */
export default class Feature { 
    
    private feature: OlFeature;
    private layer: OlLayer;

    /**
     * @constructor
     * @memberof Feature
     * @param {Object} feature - OpenLayers' feature object
     * @param {Object} layer - OpenLayers' layer object
     */
    constructor(feature: OlFeature, layer?: OlLayer /* source?: OlSource */) {
        this.feature = feature;
        if (layer) {
            this.layer = layer;
        }
    }

    /**
     * Returns OpenLayers' feature object
     *
     * @function getFeature
     * @memberof Feature
     * @return {Object} feature object
     */
    public getFeature(): OlFeature {
        return this.feature;
    }

    /**
     * Returns OpenLayers' feature type
     *
     * @function getType
     * @memberof Feature
     * @return {String} feature type
     */
    public getType(): string {
        return this.feature.getGeometry().getType();
    }

    /**
     * Returns OpenLayers' layer object
     *
     * @function getLayer
     * @memberof Feature
     * @return {Object} layer object
     */
    public getLayer(): OlLayer {
        return this.layer;
    }

    /**
     * Sets layer of the feature
     *
     * @function setLayer
     * @memberof Feature
     * @param {Object} layer - layer instance
     */
    public setLayer(layer: OlLayer): void {
        this.layer = layer;
    }

}