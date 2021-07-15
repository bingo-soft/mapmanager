import { Layer as OlLayer } from "ol/layer";
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
import VectorLayer from "../Layer/Impl/VectorLayer";
import LayerInterface from "../Layer/LayerInterface";


/** @class FeatureCollection */
export default class FeatureCollection { 

    private static readonly MAP_SRS_ID = 3857;
    
    private features: Feature[] = [];
    
    /**
     * @constructor
     * @memberof FeatureCollection
     * @param {Array} features - array of features
     * @param {Object} layer - layer of features
     */
    constructor(features: OlFeature[] | Feature[], layer?: LayerInterface) {
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
    }

    /**
     * Returns the length of collection
     *
     * @function getLength
     * @memberof FeatureCollection
     * @return {Number} length of collection
     */
    public getLength(): number {
        return this.features.length;
    }

    /**
     * Returns an array of feature instances
     *
     * @function getFeatures
     * @memberof FeatureCollection
     * @return {Array} features of the  collection
     */
    public getFeatures(): Feature[] {
        return this.features;
    }

    /**
     * Returns an array of OL feature geometries
     *
     * @function getFeatureGeometries
     * @memberof FeatureCollection
     * @return {Array} array of OL feature geometries
     */
    public getFeatureGeometries(): OlGeometry[] {
        const ret: OlGeometry[] = [];
        this.features.forEach((feature: Feature): void => {
            ret.push(feature.getFeature().getGeometry());
        });
        return ret;
    }

    /**
     * Sets the flag indicating whether the features in collection are dirty (newly added or modified)
     *
     * @function setDirty
     * @memberof FeatureCollection
     * @param {boolean} dirty - flag indicating whether the features in collection are dirty
     */
    public setDirty(dirty: boolean): void {
        this.features.forEach((feature: Feature): void => {
            feature.setDirty(dirty);
        });
    }


    /**
     * Returns feature at index
     *
     * @function getAt
     * @memberof FeatureCollection
     * @param {Number} index - index
     */
    public getAt(index: number): Feature {
        if (typeof this.features[index] === "undefined") {
            return null;
        }
        return this.features[index];
    }

    /**
     * Adds feature to the collection
     *
     * @function add
     * @memberof FeatureCollection
     * @param {Object} feature - feature to add
     */
    public add(feature: Feature): void {
        this.features.push(feature);
    }

    /**
     * Removes feature from the collection
     *
     * @function remove
     * @memberof FeatureCollection
     * @param {Object} feature - feature to remove
     */
    public remove(feature: Feature): void {
        const index = this.features.indexOf(feature);
        if (index > -1) {
            this.features.splice(index, 1);
        }
    }

    /**
     * Clears the collection
     *
     * @function clear
     * @memberof FeatureCollection
     */
    public clear(): void {
        this.features = [];
    }

    /**
     * Iterates the collection
     *
     * @function forEach
     * @memberof FeatureCollection
     * @param {Function} callbackfn - callback function to call for each element
     */
    public forEach(callbackfn: (value: Feature, key: string, arr: Feature[]) => void, thisArg?: any) {
        if (typeof callbackfn != "function") {
            throw new TypeError();
        }
        for (let i = 0; i < this.features.length; i++) {
            if (i in this.features) {
                callbackfn.call(thisArg, this.features[i], i, this.features);
            }
        }
    }

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
     * @param {Number} srsId - SRS Id returned features
     * @return {String} - GeoJSON
     */
     public getAsSingleGeometry(srsId: number): string {
        if (this.features.length) {
            const geom = this.features[0].getFeature().getGeometry();
            return new OlGeoJSON().writeGeometry(geom, {
                dataProjection: "EPSG:" + srsId.toString()/* this.srs */,
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
     * @param {Number} srsId - SRS Id returned features
     * @return {String} - GeoJSON
     */
    public getAsMultiGeometry(srsId: number): string {
        let geomType: OlGeometryType; 
        if (this.features.length) {
            const coordsPoint: OlCoordinate[] = [];
            const coordsLineString: OlCoordinate[][] = [];
            const coordsPolygon: OlCoordinate[][][] = [];
            this.features.forEach((el): void => {
                const geom = el.getFeature().getGeometry();
                geomType = geom.getType();
                if (geomType == OlGeometryType.POINT) {
                    coordsPoint.push((<OlPoint> geom).getCoordinates());
                } else if (geomType == OlGeometryType.MULTI_POINT) {
                    (<OlMultiPoint> geom).getCoordinates().forEach((coord: OlCoordinate): void => {
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
                dataProjection: "EPSG:" + srsId.toString()/* this.srs */,
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
     * @param {Number} srsId - SRS Id returned features
     * @return {String} - GeoJSON
     */
    public getAsGeometryCollection(srsId: number): string {
        if (this.features.length) {
            const geoms: OlGeometry[] = [];
            this.features.forEach((el): void => {
                geoms.push(el.getFeature().getGeometry());
            });
            return new OlGeoJSON().writeGeometry(new OlGeometryCollection(geoms), {
                dataProjection: "EPSG:" + srsId.toString()/* this.srs */,
                featureProjection: "EPSG:" + FeatureCollection.MAP_SRS_ID // todo - наверное надо передавать сюда SRS карты, а не жестко конвертить в 3857
            });
        }
        return "";
    }
}