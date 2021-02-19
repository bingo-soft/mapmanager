import { Vector as VectorLayer } from "ol/layer"
import { Vector as VectorSource } from "ol/source"
import GeoJSON from "ol/format/GeoJSON"
import Feature from "ol/Feature"
import LayerType from "./layer-type"
import { geomStyles } from "./config"

export default class Layer {
    private layer: any;

    constructor(type: string) {
        switch(type) {
            case LayerType.Vector:
                this.layer = new VectorLayer({
                    source: new VectorSource(),
                    style: (feature: Feature) => {
                        return geomStyles[feature.getGeometry().getType()];
                    }
                });
                break;
            default:
                break;
        }
    }

    /**
     * Returns OpenLayers layer
     *
     * @function getLayer
     * @memberof Layer
     * @return {any} - OpenLayers layer
     */
    public getLayer(): any {
        return this.layer;
    }

    /**
     * Adds features to layer
     *
     * @function addFeatures
     * @memberof Layer
     * @param {ArrayBuffer|Document|Element|Object|string} features - features
     */
    public addFeatures(features: ArrayBuffer|Document|Element|Object|string): void {
        this.layer.getSource().addFeatures(new GeoJSON().readFeatures(<string>features));
    }
}