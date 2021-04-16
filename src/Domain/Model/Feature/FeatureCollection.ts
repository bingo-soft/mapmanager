import { Layer as OlLayer } from "ol/layer";
import OlSource from "ol/source/Source";
import OlFeature from "ol/Feature";
import OlGeometry from "ol/geom/Geometry";
import OlGeometryCollection from "ol/geom/GeometryCollection";
import OlGeoJSON from "ol/format/GeoJSON";
import OlGeometryType from "ol/geom/GeometryType";
import { Coordinate as OlCoordinate } from "ol/coordinate";
import OlPoint from "ol/geom/Point";
import OlLineString from "ol/geom/LineString";
import OlPolygon from "ol/geom/Polygon";
import OlMultiPoint from "ol/geom/MultiPoint";
import OlMultiLineString from "ol/geom/MultiLineString";
import OlMultiPolygon from "ol/geom/MultiPolygon";
import Feature from "./Feature";


/** @class FeatureCollection */
export default class FeatureCollection { 
    
    private features: Feature[] = [];
    private srs: string = "EPSG:3857";

    private static readonly MAP_SRS_ID = 3857;
    
    /**
     * @constructor
     * @memberof FeatureCollection
     * @param {Array} features - array of features
     * @param {String} srs - SRS of features
     */
    /* constructor(features: OlFeature[] | Feature[], srs: string, source?: OlSource) {
        if (features[0]) {
            if (features[0] instanceof OlFeature) {
                (<OlFeature[]> features).forEach((el: OlFeature): void => {
                    this.features.push(new Feature(el, source));
                });
            }
            if (features[0] instanceof Feature) {
                (<Feature[]> features).forEach((el: Feature): void => {
                    if (source) {
                        el.setSource(source);
                    }
                    this.features.push(el);
                });
            }
        }
        this.srs = srs;
    } */
    constructor(features: OlFeature[] | Feature[], srs: string, layer?: OlLayer) {
        if (features[0]) {
            if (features[0] instanceof OlFeature) {
                (<OlFeature[]> features).forEach((el: OlFeature): void => {
                    this.features.push(new Feature(el, layer));
                });
            }
            if (features[0] instanceof Feature) {
                (<Feature[]> features).forEach((el: Feature): void => {
                    if (layer) {
                        el.setLayer(layer);
                    }
                    this.features.push(el);
                });
            }
        }
        this.srs = srs;
    }

    public forEach(callbackfn: (value: Feature, key: string, arr: Feature[]) => void, thisArg?: any) {
        if (typeof callbackfn != "function") {
            throw new TypeError();
        }
        for (var i = 0; i < this.features.length; i++) {
            if (i in this.features) {
                callbackfn.call(thisArg, this.features[i], i, this.features);
            }
        }
    }

    /* public getFeatures(): Feature[] {
        return this.features;   
    } */

    /* public getSRS(): string {
        return this.srs;   
    } */

    /**
     * Returns true if feature collection consists of a singe feature, otherwise returns false
     *
     * @function isSingle
     * @memberof FeatureCollection
     * @return {Boolean} is feature collection single
     */
    public isSingle(): boolean {
        return this.features.length == 1;
    }

    /**
     * Returns true if feature collection consists of multiple features of different types, otherwise returns false
     *
     * @function isMixed
     * @memberof FeatureCollection
     * @return {Boolean} is feature collection consists of multiple features of different type
     */
    public isMixed(): boolean {
        const isEqual = this.features.every((val: Feature, i, arr) => val.getType().replace("Multi", "") === arr[0].getType().replace("Multi", ""));
        return !isEqual;
    }

    /**
     * Returns features of the collection as single geometry GeoJSON
     *
     * @function getAsSingleGeometry
     * @memberof FeatureCollection
     * @return {String} - GeoJSON
     */
     public getAsSingleGeometry(): string {
        if (this.features.length) {
            const geom: OlGeometry = this.features[0].getFeature().getGeometry();
            return new OlGeoJSON().writeGeometry(geom, {
                dataProjection: this.srs,
                featureProjection: "EPSG:" + FeatureCollection.MAP_SRS_ID // todo - наверное надо передавать сюда SRS карты, а не жестко конвертить в 3857
            });
        }
        return "";
    }

    /**
     * Returns features of the collection as multi geometry GeoJSON
     *
     * @function getAsMultiGeometry
     * @memberof FeatureCollection
     * @return {String} - GeoJSON
     */
    public getAsMultiGeometry(): string {
        let geomType: OlGeometryType; 
        if (this.features.length) {
            //geomType = this.features[0].getFeature().getGeometry().getType();
            const coordsPoint: OlCoordinate[] = [];
            const coordsLineString: OlCoordinate[][] = [];
            const coordsPolygon: OlCoordinate[][][] = [];
            this.features.forEach((el): void => {
                const geom: OlGeometry = el.getFeature().getGeometry();
                geomType = geom.getType();
                if (geomType == OlGeometryType.POINT) {
                    //console.log((<OlPoint> geom).getCoordinates());
                    coordsPoint.push((<OlPoint> geom).getCoordinates());
                } else if (geomType == OlGeometryType.MULTI_POINT) {
                    (<OlMultiPoint> geom).getCoordinates().forEach((coord: OlCoordinate): void => {
                        //console.log(coord);
                        coordsPoint.push(coord);
                    });
                } else if (geomType == OlGeometryType.LINE_STRING) {
                    coordsLineString.push((<OlLineString> geom).getCoordinates());
                } else if (geomType == OlGeometryType.MULTI_LINE_STRING) {
                    (<OlMultiLineString> geom).getCoordinates().forEach((coord: OlCoordinate[]): void => {
                        coordsLineString.push(coord);
                    });
                } else if (geomType == OlGeometryType.POLYGON) {
                    coordsPolygon.push((<OlPolygon> geom).getCoordinates());
                } else if (geomType == OlGeometryType.MULTI_POLYGON) {
                    (<OlMultiPolygon> geom).getCoordinates().forEach((coord: OlCoordinate[][]): void => {
                        coordsPolygon.push(coord);
                    });
                } else {

                } 
            });
            let returnGeom: OlGeometry = null;
            switch(geomType) {
                case OlGeometryType.POINT:
                case OlGeometryType.MULTI_POINT:
                    returnGeom = new OlMultiPoint(coordsPoint);
                    break;
                case OlGeometryType.LINE_STRING:
                case OlGeometryType.MULTI_LINE_STRING:
                    returnGeom = new OlMultiLineString(coordsLineString);
                    break;
                case OlGeometryType.POLYGON:
                case OlGeometryType.MULTI_POLYGON:
                    returnGeom = new OlMultiPolygon(coordsPolygon);
                    break;
                default:
                    break;
            }
            return new OlGeoJSON().writeGeometry(returnGeom, {
                dataProjection: this.srs,
                featureProjection: "EPSG:" + FeatureCollection.MAP_SRS_ID // todo - наверное надо передавать сюда SRS карты, а не жестко конвертить в 3857
            });
        } 
        return "";
    }

    /**
     * Returns features of the collection as GeometryCollection GeoJSON
     *
     * @function getAsGeometryCollection
     * @memberof FeatureCollection
     * @return {String} - GeoJSON
     */
    public getAsGeometryCollection(): string {
        if (this.features.length) {
            const geoms: OlGeometry[] = [];
            this.features.forEach((el): void => {
                geoms.push(el.getFeature().getGeometry());
            });
            return new OlGeoJSON().writeGeometry(new OlGeometryCollection(geoms), {
                dataProjection: this.srs,
                featureProjection: "EPSG:" + FeatureCollection.MAP_SRS_ID // todo - наверное надо передавать сюда SRS карты, а не жестко конвертить в 3857
            });
        }
        return "";
    }
}