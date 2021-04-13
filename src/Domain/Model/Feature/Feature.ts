import OlFeature from "ol/Feature";
import OlSource from "ol/source/Source";
/* import OlGeoJSON from "ol/format/GeoJSON";
import OlGeometryType from "ol/geom/GeometryType"; */


/** @class Feature */
export default class Feature { 
    
    private feature: OlFeature;
    private source: OlSource;

    /**
     * @constructor
     * @memberof Feature
     * @param {Object} feature - OpenLayers' feature object
     * @param {Object} layer - OpenLayers' layer object
     */
    constructor(feature: OlFeature, source?: OlSource) {
        this.feature = feature;
        if (source) {
            this.source = source;
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

    /* public getLayerName(): OlLayer {
        return this.layer.get("name");
    } */

    /* public getId(): string | number {
        return this.feature.getId();
    } */
    

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
     public getSource(): OlSource {
        return this.source;
    }

    /**
     * Sets layer of the feature
     *
     * @function getType
     * @memberof Feature
     * @param {Object} layer - layer instance
     */
    public setSource(source: OlSource): void {
        this.source = source;
    }



    /* public getProperties(): unknown {
        return this.feature.getProperties();
    } */

    /* public getGeometryAsGeoJSON(): string {
        return new OlGeoJSON().writeFeature(this.feature);
    } */

}