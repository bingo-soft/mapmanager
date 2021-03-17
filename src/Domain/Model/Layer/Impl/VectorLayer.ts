import { Vector as OlVectorLayer } from "ol/layer"
//import BaseVector from "ol/layer/BaseVector"
import { Source as OlSource } from "ol/source"
import { Vector as OlVectorSource } from "ol/source"
import GeoJSON from "ol/format/GeoJSON"
import Geometry from "ol/geom/Geometry"
import Feature from "ol/Feature"
import GeometryCollection from "ol/geom/GeometryCollection"
import GeometryType from "ol/geom/GeometryType"
import Style from "ol/style/Style"
import { StyleType } from "../../Style/StyleType"
import BaseLayer from "../BaseLayer"
import SourceType from "../../Source/SourceType"
import SourceInterface from "../../Source/SourceInterface"
import { DefaultStyle } from "../../Style/Impl/DefaultStyle"


/** @class VectorLayer */
export default class VectorLayer extends BaseLayer {

    private style: StyleType;
    
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
        this.style = DefaultStyle;
        this.layer = new OlVectorLayer({
            style: (feature): Style => {
                const geomType: GeometryType = feature.getGeometry().getType();
                return this.style[geomType];
            }
        });
    }

    public getType(): SourceType {
        return SourceType.Vector;
    }

    public getSource(): OlSource {
        return this.layer.getSource();
    }

    public setSource(source: SourceInterface): void {
        this.layer.setSource(<OlVectorSource> source.getSource());
    }

    public setLoader(loader: () => Promise<string>): void {   
        const source : OlVectorSource = <OlVectorSource> this.layer.getSource();
        source.setLoader(async () => {
            const data = await loader();
            source.addFeatures(new GeoJSON().readFeatures(data, {
                dataProjection: this.srs,
                featureProjection: "EPSG:3857"
            }));
        });
    }

    public setStyle(style: StyleType): void { 
        //(<BaseVector> this.layer).setStyle(style);
        this.style = style;
    }

    public addFeatures(features: string/* , opts?: unknown */): void {
        //const srs: number = this.getSRSId(opts);
        (<OlVectorLayer> this.layer).getSource().addFeatures(new GeoJSON().readFeatures(features, {
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
    private getFeatures(): Feature[] {
        return (<OlVectorLayer> this.layer).getSource().getFeatures();
    }
    
    /**
     * Gets features of layer as FeatureCollection GeoJSON
     *
     * @function getFeaturesAsFeatureCollection
     * @memberof Layer
     * @return {String} - GeoJSON
     */
    public getFeaturesAsFeatureCollection(): string {
        return new GeoJSON().writeFeatures(this.getFeatures(), {
            dataProjection: this.srs,
            featureProjection: "EPSG:3857"
        });
    }

    /**
     * Gets features of the layer as GeometryCollection GeoJSON
     *
     * @function getFeaturesAsGeometryCollection
     * @memberof Layer
     * @return {String} - GeoJSON
     */
    public getFeaturesAsGeometryCollection(): string {
        const geoms: Geometry[] = [];
        this.getFeatures().forEach((el): void => {
            geoms.push(el.getGeometry());
        });
        return new GeoJSON().writeGeometry(new GeometryCollection(geoms), {
            dataProjection: this.srs,
            featureProjection: "EPSG:3857"
        });
    }

    /**
     * Flattens geometry from GeometryCollection to FeatureCollection
     *
     * @function flattenGeometry
     * @memberof Layer
     * @static
     * @param {String} features - features to flatten
     * @return {String} flattened features
     */
    public static flattenGeometry(features: string): string {
        const objFeatures: unknown = JSON.parse(features);  
        if (objFeatures["type"] !== "undefined" && objFeatures["type"] == "GeometryCollection") {
            const featureCollection: unknown = { type: "FeatureCollection", features: [] };
            const geometries: unknown[] = objFeatures["geometries"];
            geometries.forEach(el => {
                featureCollection["features"].push({ "type": "Feature", "geometry": el });
            });
            return JSON.stringify(featureCollection);
        }
        return features;
    }

    
    /* private getSRS(opts?: unknown): string {
        let srs = "EPSG:3857";
        if (typeof opts !== "undefined" && Object.prototype.hasOwnProperty.call(opts, "srs_handling")) {
            const srsH: unknown = opts["srs_handling"];
            srs = srsH["srs_handling_type"] == "forced_declared" ? srsH["declared_coordinate_system_id"] : srsH["native_coordinate_system_id"];
        }
        return "EPSG:" + srs;
    } */

}