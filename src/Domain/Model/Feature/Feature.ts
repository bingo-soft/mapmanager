import { Coordinate as  OlCoordinate} from "ol/coordinate";
import OlFeature from "ol/Feature";
import {Point as OlPoint, MultiPoint as OlMultiPoint, LineString as OlLineString, MultiLineString as OlMultiLineString, 
    Polygon as OlPolygon, MultiPolygon as OlMultiPolygon} from "ol/geom"
import { Layer as OlLayer } from "ol/layer";
import OlVectorSource from "ol/source/Vector";
import { WKT as OlWKT, GeoJSON as OlGeoJSON }  from "ol/format";
import GeometryFormat from "./GeometryFormat/GeometryFormat";
import LayerInterface from "../Layer/LayerInterface";
import VectorLayer from "../Layer/Impl/VectorLayer";
import StyleFunction from "../Style/StyleFunctionType";
import { VertexCoordinate } from "./VertexCoordinate";

/** @class Feature */
export default class Feature { 
    
    private feature: OlFeature;
    private layer: LayerInterface;
    private dirty: boolean;

    private static readonly DEFAULT_SRS = "EPSG:3857";

    /**
     * @constructor
     * @memberof Feature
     * @param {Object} feature - OpenLayers' feature object
     * @param {Object} layer - OpenLayers' layer object
     */
    constructor(feature?: OlFeature, layer?: OlLayer) {
        if (!feature) {
            feature = new OlFeature();
        }
        this.feature = feature;
        if (layer) { 
            this.layer = new VectorLayer(layer);
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
     * @return {Object} layer instance
     */
    public getLayer(): LayerInterface {
        return this.layer;
    }

    /**
     * Sets layer of the feature
     *
     * @function setLayer
     * @memberof Feature
     * @param {Object} layer - layer instance
     */
    public setLayer(layer: LayerInterface): void {
        this.layer = layer;
    }

    /**
     * Sets style of the feature
     *
     * @function setStyle
     * @memberof Feature
     * @param {Object} style - style
     */
    public setStyle(style: StyleFunction): void {
        this.feature.setStyle(style);
    }

    /**
     * Returns the flag indicating whether the feature is dirty (newly added or modified)
     *
     * @function isDirty
     * @memberof Feature
     * @return {boolean} flag indicating whether the feature is dirty
     */
    public isDirty(): boolean {
        return this.dirty;
    }

    /**
     * Sets the flag indicating whether the feature is dirty (newly added or modified)
     *
     * @function setDirty
     * @memberof Feature
     * @param {boolean} dirty - flag indicating whether the feature is dirty 
     */
    public setDirty(dirty: boolean): void {
        this.dirty = dirty;
    }

    /**
     * Returns feature vertices' coordinates along with their indices
     *
     * @function getCoordinates
     * @memberof Feature
     * @return {Array} array of feature vertices' coordinates along with their indices e.g. [ {idx1, x1, y1}, {idx2, x2, y2} ]
     */
     public getCoordinates(): VertexCoordinate[] {
        const returnCoordinates: VertexCoordinate[] = [];
        let coordinatesFlat: OlCoordinate = [];
        let coordinatesOneDim: OlCoordinate[] = [];
        let coordinatesTwoDim: OlCoordinate[][] = [];
        let coordinatesThreeDim: OlCoordinate[][][] = [];
        const geometry = this.feature.getGeometry();
        if (geometry instanceof OlPoint) {
            coordinatesFlat = (<OlPoint> geometry).getCoordinates();
        } else if (geometry instanceof OlMultiPoint) {
            coordinatesOneDim = (<OlMultiPoint> geometry).getCoordinates();
        } else if (geometry instanceof OlLineString) {
            coordinatesOneDim = (<OlLineString> geometry).getCoordinates();
        } else if (geometry instanceof OlMultiLineString) {
            coordinatesTwoDim = (<OlMultiLineString> geometry).getCoordinates();
        } else if (geometry instanceof OlPolygon) {
            coordinatesTwoDim = (<OlPolygon> geometry).getCoordinates();
        } else if (geometry instanceof OlMultiPolygon) {
            coordinatesThreeDim = (<OlMultiPolygon> geometry).getCoordinates();
        } else {

        }
        let index: number = 0;
        if (coordinatesFlat.length) {
            returnCoordinates.push({"id": index, "x": coordinatesFlat[0], "y": coordinatesFlat[1]});
        } 
        if (coordinatesOneDim.length) {
            coordinatesOneDim.forEach((coordinate1: OlCoordinate): void => {
                returnCoordinates.push({"id": index, "x": coordinate1[0], "y": coordinate1[1]});
                index++;
            });
        }
        if (coordinatesTwoDim.length) {
            coordinatesTwoDim.forEach((coordinate1: OlCoordinate[]): void => {
                coordinate1.forEach((coordinate2: OlCoordinate): void => {
                    returnCoordinates.push({"id": index, "x": coordinate2[0], "y": coordinate2[1]});
                    index++;
                });
            });
        }
        if (coordinatesThreeDim.length) {
            coordinatesThreeDim.forEach((coordinate1: OlCoordinate[][]): void => {
                coordinate1.forEach((coordinate2: OlCoordinate[]): void => {
                    coordinate2.forEach((coordinate3: OlCoordinate): void => {
                        returnCoordinates.push({"id": index, "x": coordinate3[0], "y": coordinate3[1]});
                        index++;
                    });
                });
            });
        }
        return returnCoordinates;
    }


    /**
     * Modifies feature vertex at given index
     *
     * @function modifyCoordinate
     * @memberof Feature
     * @param {String} action - modify action: "edit" or "delete"
     * @param {Array} coordinate - new coordinate along with index in case of edit e.g. [idx, x, y], index in case of delete e.g. [idx]
     */
    public modifyCoordinate(action: string, coordinate: number[]): void {
        const geometry = this.feature.getGeometry();
        let coordinatesFlat: OlCoordinate = [];
        let coordinatesOneDim: OlCoordinate[] = [];
        let coordinatesTwoDim: OlCoordinate[][] = [];
        let coordinatesThreeDim: OlCoordinate[][][] = [];
        if (geometry instanceof OlPoint) {
            coordinatesFlat = (<OlPoint> geometry).getCoordinates();
        } else if (geometry instanceof OlMultiPoint) {
            coordinatesOneDim = (<OlMultiPoint> geometry).getCoordinates();
        } else if (geometry instanceof OlLineString) {
            coordinatesOneDim = (<OlLineString> geometry).getCoordinates();
        } else if (geometry instanceof OlMultiLineString) {
            coordinatesTwoDim = (<OlMultiLineString> geometry).getCoordinates();
        } else if (geometry instanceof OlPolygon) {
            coordinatesTwoDim = (<OlPolygon> geometry).getCoordinates();
        } else if (geometry instanceof OlMultiPolygon) {
            coordinatesThreeDim = (<OlMultiPolygon> geometry).getCoordinates();
        } else {

        }
        let index: number = 0;
        const indexToFind: number = coordinate[0];
        const coordinateToReplace: number[] = [coordinate[1], coordinate[2]];
        let i:number, j: number, k: number;
        if (coordinatesFlat.length) {
            if (indexToFind == 0) {
                if (action == "delete") {
                    return; 
                } else {
                    coordinatesFlat = coordinateToReplace;
                }
                (<OlPoint> this.feature.getGeometry()).setCoordinates(coordinatesFlat);
            }
            return;
        } 
        if (coordinatesOneDim.length) {
            for (i = 0; i < coordinatesOneDim.length; i++) {
                if (index == indexToFind) {
                    action == "delete" ? coordinatesOneDim.splice(i, 1) : coordinatesOneDim[i] = coordinateToReplace;
                    if (geometry instanceof OlMultiPoint) {
                        (<OlMultiPoint> this.feature.getGeometry()).setCoordinates(coordinatesOneDim);
                    }
                    if (geometry instanceof OlLineString) {
                        (<OlLineString> this.feature.getGeometry()).setCoordinates(coordinatesOneDim);
                    }
                    return;
                }
                index++;
            }
        } 
        if (coordinatesTwoDim.length) {
            for (i = 0; i < coordinatesTwoDim.length; i++) {
                for (j = 0; j < coordinatesTwoDim[i].length; j++) {
                    if (index == indexToFind) {
                        action == "delete" ? coordinatesTwoDim[i].splice(j, 1) : coordinatesTwoDim[i][j] = coordinateToReplace;
                        if (geometry instanceof OlMultiLineString) {
                            (<OlMultiLineString> this.feature.getGeometry()).setCoordinates(coordinatesTwoDim);
                        }
                        if (geometry instanceof OlPolygon) {
                            (<OlPolygon> this.feature.getGeometry()).setCoordinates(coordinatesTwoDim);
                        }
                        return;
                    }
                    index++;
                }
            }
        } 
        if (coordinatesThreeDim.length) {
            for (i = 0; i < coordinatesThreeDim.length; i++) {
                for (j = 0; j < coordinatesThreeDim[i].length; j++) {
                    for (k = 0; k < coordinatesThreeDim[i][j].length; k++) {
                        if (index == indexToFind) {
                            action == "delete" ? coordinatesThreeDim[i][j].splice(j, 1) : coordinatesThreeDim[i][j][k] = coordinateToReplace;
                            (<OlMultiPolygon> this.feature.getGeometry()).setCoordinates(coordinatesThreeDim);
                            return;
                        }
                        index++;
                    }
                }
            }
        }
    }

    /**
     * Returns feature geometry as text
     *
     * @function getGeometryAsText
     * @memberof Feature
     * @param {String} format - format to return in
     * @param {Number} srsId - SRS Id of returned feature text representation
     * @return {String} text representing feature
     */
    public getGeometryAsText(format: GeometryFormat, srsId: number): string {
        const formatInstance: OlWKT | OlGeoJSON = this.getFormatInstance(format);
        if (formatInstance) {
            return formatInstance.writeFeature(this.feature, {
                dataProjection: "EPSG:" + srsId.toString(),
                featureProjection: this.layer.getSource().getProjection() || Feature.DEFAULT_SRS
            });
        }
        return "";
    }

    /**
     * Updates feature geometry from text
     *
     * @function updateGeometryFromText
     * @memberof Feature
     * @param {String} text - feature text representation
     * @param {String} format - format of feature text representation
     * @param {Number} srsId - SRS Id of feature text representation
     */
     public updateGeometryFromText(text: string, format: GeometryFormat, srsId: number): void {
        const formatInstance: OlWKT | OlGeoJSON = this.getFormatInstance(format);
        if (formatInstance) {
            this.feature = formatInstance.readFeature(text, {
                dataProjection: "EPSG:" + srsId.toString(),
                featureProjection: this.layer ? this.layer.getSource().getProjection() || Feature.DEFAULT_SRS : Feature.DEFAULT_SRS
            });
        }
    }

    /**
     * Creates feature geometry from text
     *
     * @function updateGeometryFromText
     * @memberof Feature
     * @param {String} text - feature text representation
     * @param {String} format - format of feature text representation
     * @param {Number} srsId - SRS Id of feature text representation
     */
    public createGeometryFromText(layer:LayerInterface, text: string, format: GeometryFormat, srsId: number): Feature {
        const formatInstance: OlWKT | OlGeoJSON = this.getFormatInstance(format);
        if (formatInstance) {
            this.feature = formatInstance.readFeature(text, {
                dataProjection: "EPSG:" + srsId.toString(),
                featureProjection: this.layer ? this.layer.getSource().getProjection() || Feature.DEFAULT_SRS : Feature.DEFAULT_SRS
            });
            (<OlVectorSource> layer.getLayer().getSource()).addFeature(this.feature);
            return this;
        }
        return null;
    }

    /**
     * Returns format instance based on format type
     *
     * @function getFormatInstance
     * @memberof Feature
     * @param {String} format - format
     * @return {Object} format instance
     */
    private getFormatInstance(format: GeometryFormat): OlWKT | OlGeoJSON {
        if (format == GeometryFormat.WKT) {
            return new OlWKT();
        } else if (format == GeometryFormat.GeoJSON) {
            return new OlGeoJSON();
        } else {
            return null;
        }
    }

}