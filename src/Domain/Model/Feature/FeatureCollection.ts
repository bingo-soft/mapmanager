import OlFeature from "ol/Feature";
import Geometry from "ol/geom/Geometry"
import OlGeometryCollection from "ol/geom/GeometryCollection"
import GeoJSON from "ol/format/GeoJSON"
import GeometryType from "ol/geom/GeometryType";
import { Coordinate } from "ol/coordinate";
import Point from "ol/geom/Point";
import LineString from "ol/geom/LineString";
import Polygon from "ol/geom/Polygon";
import MultiPoint from "ol/geom/MultiPoint";
import MultiLineString from "ol/geom/MultiLineString";
import MultiPolygon from "ol/geom/MultiPolygon";
import Feature from "./Feature"


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
        if (this.features.length) {
            const geom: Geometry = this.features[0].getFeature().getGeometry();
            return new GeoJSON().writeGeometry(geom, {
                dataProjection: this.srs,
                featureProjection: "EPSG:3857"
            });
        }
        return "";
    }

    /**
     * Gets features of the collection as multi geometry GeoJSON
     *
     * @function getAsMultiGeometry
     * @memberof FeatureCollection
     * @return {String} - GeoJSON
     */
    public getAsMultiGeometry(): string {
        let geomType: GeometryType;
        if (this.features.length) {
            geomType = this.features[0].getFeature().getGeometry().getType();
            const coordsPoint: Coordinate[] = [];
            const coordsLineString: Coordinate[][] = [];
            const coordsPolygon: Coordinate[][][] = [];
            this.features.forEach((el): void => {
                const geom: Geometry = el.getFeature().getGeometry();
                if (geomType == GeometryType.POINT) {
                    coordsPoint.push((<Point> geom).getCoordinates());
                } else if (geomType == GeometryType.LINE_STRING) {
                    coordsLineString.push((<LineString> geom).getCoordinates());
                } else if (geomType == GeometryType.POLYGON) {
                    coordsPolygon.push((<Polygon> geom).getCoordinates());
                } else {

                } 
            });
            let returnGeom: Geometry = null;
            switch(geomType) {
                case GeometryType.POINT:
                    returnGeom = new MultiPoint(coordsPoint);
                    break;
                case GeometryType.LINE_STRING:
                    returnGeom = new MultiLineString(coordsLineString);
                    break;
                case GeometryType.POLYGON:
                    returnGeom = new MultiPolygon(coordsPolygon);
                    break;
                default:
                    break;
            }
            return new GeoJSON().writeGeometry(returnGeom, {
                dataProjection: this.srs,
                featureProjection: "EPSG:3857"
            });
        } 
        return "";
    }

    /**
     * Gets features of the collection as GeometryCollection GeoJSON
     *
     * @function getAsGeometryCollection
     * @memberof FeatureCollection
     * @return {String} - GeoJSON
     */
    public getAsGeometryCollection(): string {
        if (this.features.length) {
            const geoms: Geometry[] = [];
            this.features.forEach((el): void => {
                geoms.push(el.getFeature().getGeometry());
            });
            return new GeoJSON().writeGeometry(new OlGeometryCollection(geoms), {
                dataProjection: this.srs,
                featureProjection: "EPSG:3857"
            });
        }
        return "";
    }
}