import OlFeature from "ol/Feature";
import OlGeometry from "ol/geom/Geometry";
import OlGeometryCollection from "ol/geom/GeometryCollection";
import OlGeoJSON from "ol/format/GeoJSON";
import { Coordinate as OlCoordinate } from "ol/coordinate";
import OlPoint from "ol/geom/Point";
import OlLineString from "ol/geom/LineString";
import OlPolygon from "ol/geom/Polygon";
import OlMultiPoint from "ol/geom/MultiPoint";
import OlMultiLineString from "ol/geom/MultiLineString";
import OlMultiPolygon from "ol/geom/MultiPolygon";
import Feature from "./Feature";
import LayerInterface from "../Layer/LayerInterface";

/** FeatureCollection */
export default class FeatureCollection { 
    
    private features: Feature[] = [];
    
    /**
     * @param features - array of features
     * @param layer - layer of features
     */
    constructor(features?: OlFeature[] | Feature[], layer?: LayerInterface) {
        if (!features || features.length == 0) {
            return;
        }
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
     * @return length of collection
     */
    public getLength(): number {
        return this.features.length;
    }

    /**
     * Returns an array of feature instances
     * @return features of the collection
     */
    public getFeatures(): Feature[] {
        return this.features;
    }

    /**
     * Returns an array of OL feature geometries
     * @return array of OL feature geometries
     */
    public getFeatureGeometries(): OlGeometry[] {
        const ret: OlGeometry[] = [];
        this.features.forEach((feature: Feature): void => {
            const geometry = feature.getFeature().getGeometry();
            if (geometry) {
                ret.push(geometry);
            }
        });
        return ret;
    }

    /**
     * Returns feature at index
     * @param index - index
     */
    public getAt(index: number): Feature {
        if (typeof this.features[index] === "undefined") {
            return null;
        }
        return this.features[index];
    }

    /**
     * Adds feature to the collection
     * @param feature - feature to add
     */
    public add(feature: Feature): void {
        this.features.push(feature);
    }

    /**
     * Removes feature from the collection
     * @param feature - feature to remove
     */
    public remove(feature: Feature): void {
        const index = this.indexOf(feature);
        if (index > -1) {
            this.features.splice(index, 1);
        }
    }

    /**
     * Returns feature index
     * @return feature index
     */
    public indexOf(feature: Feature): number {
        for (let i = 0; i < this.features.length; i += 1) {
            if (this.features[i] == feature || this.features[i].getFeature() == feature.getFeature()) {
                return i;
            }
        }
        return -1;
    }

    /**
     * Clears the collection
     */
    public clear(): void {
        this.features = [];
    }

    /**
     * Iterates the collection
     * @param callbackfn - callback function to call for each element
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
     * @return is feature collection single
     */
    public isSingle(): boolean {
        return this.features.length == 1;
    }

    /**
     * Returns true if feature collection consists of multiple features of different types, false otherwise
     * @return is feature collection consists of multiple features of different type
     */
    public isMixed(): boolean {
        const isEqual = this.features.every((val: Feature, i, arr) => val.getType().replace("Multi", "") === arr[0].getType().replace("Multi", ""));
        return !isEqual;
    }

    /**
     * Returns features of the collection as single geometry GeoJSON string
     * @param sourceSrsId - SRS Id of feature geometry
     * @param targetSrsId - SRS Id of returned text, defaults to sourceSrsId if omitted
     * @return GeoJSON string
     */
     public getAsSingleGeometry(sourceSrsId: number, targetSrsId: number): string {
        if (this.features.length) {
            const geom = this.features[0].getFeature().getGeometry();
            return new OlGeoJSON().writeGeometry(geom, {
                dataProjection: "EPSG:" + targetSrsId.toString(),
                featureProjection: "EPSG:" + sourceSrsId.toString()
            });
        }
        return "";
    }

    /**
     * Returns features of the collection as multi geometry GeoJSON string
     * @param sourceSrsId - SRS Id of feature geometry
     * @param targetSrsId - SRS Id of returned text, defaults to sourceSrsId if omitted
     * @return GeoJSON string
     */
    public getAsMultiGeometry(sourceSrsId: number, targetSrsId: number): string {
        let geomType: string; 
        if (this.features.length) {
            const coordsPoint: OlCoordinate[] = [];
            const coordsLineString: OlCoordinate[][] = [];
            const coordsPolygon: OlCoordinate[][][] = [];
            this.features.forEach((el): void => {
                const geom = el.getFeature().getGeometry();
                geomType = geom.getType();
                if (geomType == "Point") {
                    coordsPoint.push((<OlPoint> geom).getCoordinates());
                } else if (geomType == "MultiPoint") {
                    (<OlMultiPoint> geom).getCoordinates().forEach((coord: OlCoordinate): void => {
                        coordsPoint.push(coord);
                    });
                } else if (geomType == "LineString") {
                    coordsLineString.push((<OlLineString> geom).getCoordinates());
                } else if (geomType == "MultiLineString") {
                    (<OlMultiLineString> geom).getCoordinates().forEach((coord: OlCoordinate[]): void => {
                        coordsLineString.push(coord);
                    });
                } else if (geomType == "Polygon") {
                    coordsPolygon.push((<OlPolygon> geom).getCoordinates());
                } else if (geomType == "MultiPolygon") {
                    (<OlMultiPolygon> geom).getCoordinates().forEach((coord: OlCoordinate[][]): void => {
                        coordsPolygon.push(coord);
                    });
                }
            });
            let returnGeom: OlGeometry = null;
            switch(geomType) {
                case "Point":
                case "MultiPoint":
                    returnGeom = new OlMultiPoint(coordsPoint);
                    break;
                case "LineString":
                case "MultiLineString":
                    returnGeom = new OlMultiLineString(coordsLineString);
                    break;
                case "Polygon":
                case "MultiPolygon":
                    returnGeom = new OlMultiPolygon(coordsPolygon);
                    break;
                default:
                    break;
            }
            return new OlGeoJSON().writeGeometry(returnGeom, {
                dataProjection: "EPSG:" + targetSrsId.toString(),
                featureProjection: "EPSG:" + sourceSrsId.toString()
            });
        } 
        return "";
    }

    /**
     * Returns features of the collection as GeometryCollection GeoJSON string
     * @param sourceSrsId - SRS Id of feature geometry
     * @param targetSrsId - SRS Id of returned text, defaults to sourceSrsId if omitted
     * @return GeoJSON string
     */
    public getAsGeometryCollection(sourceSrsId: number, targetSrsId: number): string {
        if (this.features.length) {
            const geoms: OlGeometry[] = [];
            this.features.forEach((el): void => {
                geoms.push(el.getFeature().getGeometry());
            });
            return new OlGeoJSON().writeGeometry(new OlGeometryCollection(geoms), {
                dataProjection: "EPSG:" + targetSrsId.toString(),
                featureProjection: "EPSG:" + sourceSrsId.toString()
            });
        }
        return "";
    }

    /**
     * Returns features of the collection as GeoJSON string
     * @param sourceSrsId - SRS Id of features
     * @param targetSrsId - SRS Id of returned text, defaults to sourceSrsId if omitted
     * @return text representing feature
     */
    public getAsFeatureCollection(sourceSrsId: number, targetSrsId: number): string {
        const olFeatures: OlFeature[] = [];
        this.features.forEach((feature: Feature) => {
            olFeatures.push(feature.getFeature());
        });
        return new OlGeoJSON().writeFeatures(olFeatures, {
            dataProjection: "EPSG:" + targetSrsId.toString(),
            featureProjection: "EPSG:" + sourceSrsId.toString()
        });
    }

    /**
     * Creates feature collection from GeoJSON features
     * @param geoJSON - a string representing features
     * @param sourceSRSId - SRS Id of input GeoJSON
     * @param destinationSrsId - SRS Id of resulting features 
     * @return feature collection
     */
    public static createFromGeoJSON(geoJSON: string, sourceSRSId: number, destinationSrsId?: number): FeatureCollection {
        const sourceSRS = "EPSG:" + sourceSRSId.toString();
        const destinationSRS = destinationSrsId ? "EPSG:" + destinationSrsId.toString() : sourceSRS;
        const features = new OlGeoJSON().readFeatures(geoJSON, {
            dataProjection: sourceSRS,
            featureProjection: destinationSRS
        });
        return new FeatureCollection(features);
    }
    
}