import OlFeature from "ol/Feature";
import Geometry from "ol/geom/Geometry"
import OlGeometryCollection from "ol/geom/GeometryCollection"
import GeoJSON from "ol/format/GeoJSON"
import Feature from "../Feature/Feature"

/** @class FeatureCollection */
export default class FeatureCollection { 
    
    private features: Feature[] = [];
    private srs: string = "EPSG:3857";
    
    constructor(features: OlFeature[], srs: string) {
        features.forEach((el: OlFeature): void => {
            this.features.push(new Feature(el));
        })
        this.srs = srs;
    }

    /* public getFeatures(): Feature[] {
        return this.features;   
    } */

    /* public getSRS(): string {
        return this.srs;   
    } */

    public isSingle(): boolean {
        return this.features.length == 1;
    }

    public isMixed(): boolean {
        const isEqual = this.features.every((val: Feature, i, arr) => val.getType() === arr[0].getType());
        return !isEqual;
    }

    /**
     * Gets features of the collection as single geometry GeoJSON
     *
     * @function getAsSingleGeometry
     * @memberof FeatureCollection
     * @return {String} - GeoJSON
     */
     public getAsSingleGeometry(): string {
        return "getFeaturesAsSingleGeometry"; // TODO
    }

    /**
     * Gets features of the collection as multi geometry GeoJSON
     *
     * @function getAsMultiGeometry
     * @memberof FeatureCollection
     * @return {String} - GeoJSON
     */
    public getAsMultiGeometry(): string {
        return "getFeaturesAsMultiGeometry"; // TODO
    }

    /**
     * Gets features of the collection as GeometryCollection GeoJSON
     *
     * @function getAsGeometryCollection
     * @memberof FeatureCollection
     * @return {String} - GeoJSON
     */
    public getAsGeometryCollection(): string {
        const geoms: Geometry[] = [];
        this.features.forEach((el): void => {
            geoms.push(el.getFeature().getGeometry());
        });
        return new GeoJSON().writeGeometry(new OlGeometryCollection(geoms), {
            dataProjection: this.srs,
            featureProjection: "EPSG:3857"
        });
    }
}