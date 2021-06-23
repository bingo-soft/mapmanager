import * as turf from "@turf/turf"
import booleanValid from '@turf/boolean-valid'
import { Coordinate as  OlCoordinate} from "ol/coordinate";
import OlFeature from "ol/Feature";
import {Geometry as OlGeometry, Point as OlPoint, MultiPoint as OlMultiPoint, LineString as OlLineString, MultiLineString as OlMultiLineString, 
    Polygon as OlPolygon, MultiPolygon as OlMultiPolygon} from "ol/geom"
import { Layer as OlLayer } from "ol/layer";
import OlVectorSource from "ol/source/Vector";
import { WKT as OlWKT, GeoJSON as OlGeoJSON }  from "ol/format";
import * as OlProj from 'ol/proj';
import GeometryFormat from "./GeometryFormat";
import LayerInterface from "../Layer/LayerInterface";
import VectorLayer from "../Layer/Impl/VectorLayer";
import StyleFunction from "../Style/StyleFunctionType";
import GeometryItem from "./GeometryItem";
import VertexCoordinate from "./VertexCoordinate";

/** @class Feature */
export default class Feature { 
    
    private feature: OlFeature;
    private layer: LayerInterface;
    private dirty: boolean;
    private treeId: number;

    private static readonly DEFAULT_SRS = "EPSG:3857";

    /**
     * @constructor
     * @memberof Feature
     * @param {Object} feature - OpenLayers' feature object
     * @param {Object} layer - OpenLayers' layer object
     */
    constructor(feature?: OlFeature, layer?: LayerInterface) {
        if (!feature) {
            feature = new OlFeature();
        }
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

    public getCoordinates(): GeometryItem[] {
        return <GeometryItem[]> this.iterateGeometryItems();
    }
    
    public setCoordinates(geometryItem: GeometryItem): void {
        this.iterateGeometryItems(geometryItem);
    }

    /**
     * Returns feature vertices' coordinates along with their indices
     *
     * @function getCoordinates
     * @memberof Feature
     * @return {Array} array of geometry parts of feature along with their coordinates
     */
    private iterateGeometryItems(geometryItem?: GeometryItem): GeometryItem[] | void {
        const srs = "EPSG:" + this.getLayer().getSRSId().toString();
        this.treeId = 1;
        const geometry = this.feature.getGeometry();
        if (geometry instanceof OlPoint || geometry instanceof OlLineString || geometry instanceof OlPolygon) {
            const geometryItems: GeometryItem[] = [];
            const coordsArr: VertexCoordinate[][] = this.getGeometryItemCoordinates(geometry, srs);
            coordsArr.forEach((coords: VertexCoordinate[]): void => {
                const geometryItem: GeometryItem = {
                    "id": this.treeId,
                    "name": geometry instanceof OlPoint ? "Point" : geometry instanceof OlLineString ? "LineString" : "Polygon",
                    "children": coords
                };
                geometryItems.push(geometryItem);
                this.treeId++;
            });
            return geometryItems;
        }
        if (geometry instanceof OlMultiPoint || geometry instanceof OlMultiLineString || geometry instanceof OlMultiPolygon) {
            const geometryItems: GeometryItem[] = [{
                "id": this.treeId,
                "name": geometry instanceof OlMultiPoint ? "MultiPoint" : geometry instanceof OlMultiLineString ? "MultiLineString" : "MultiPolygon",
                "children": []
            }];
            this.treeId++;
            if (geometry instanceof OlMultiPoint) {
                (<OlMultiPoint> geometry).getPoints().forEach((point: OlPoint): void => {
                    const coords: VertexCoordinate[] = this.getGeometryItemCoordinates(point, srs)[0];
                    geometryItems[0].children.push(<GeometryItem & VertexCoordinate> {
                        "id": this.treeId,
                        "name": "Point",
                        "children": coords
                    });
                    this.treeId++;
                });
            }
            if (geometry instanceof OlMultiLineString) {
                (<OlMultiLineString> geometry).getLineStrings().forEach((linestring: OlLineString): void => {
                    const coords: VertexCoordinate[] = this.getGeometryItemCoordinates(linestring, srs)[0];
                    geometryItems[0].children.push(<GeometryItem & VertexCoordinate> {
                        "id": this.treeId,
                        "name": "LineString",
                        "children": coords
                    });
                    this.treeId++;
                });
            }
            if (geometry instanceof OlMultiPolygon) {
                (<OlMultiPolygon> geometry).getPolygons().forEach((polygon: OlPolygon): void => {
                    const coords: VertexCoordinate[] = this.getGeometryItemCoordinates(polygon, srs)[0];
                    geometryItems[0].children.push(<GeometryItem & VertexCoordinate> {
                        "id": this.treeId,
                        "name": "Polygon",
                        "children": coords
                    });
                    this.treeId++;
                });
            }
            return geometryItems;
        }
    }

    /**
     * Returns feature vertices' coordinates along with their indices
     *
     * @function getCoordinatesDo
     * @memberof Feature
     * @param {Object} geometry - geometry
     * @param {String} srs - srs to return coordinates in
     * @param {Object} index - index for unique id generation
     * @return {Array} array of feature vertices' coordinates along with their indices e.g. [ {idx1, x1, y1}, {idx2, x2, y2} ]
     */
    private getGeometryItemCoordinates(geometry: OlGeometry, srs: string): VertexCoordinate[][] {
        let returnCoordinates: VertexCoordinate[][] = [];
        let coordinatesFlat: OlCoordinate = [];
        let coordinatesOneDim: OlCoordinate[] = [];
        let coordinatesTwoDim: OlCoordinate[][] = [];
        let coordinatesThreeDim: OlCoordinate[][][] = [];
        if (geometry instanceof OlPoint) {
            coordinatesFlat = (<OlPoint> geometry).getCoordinates();
        } 
        if (geometry instanceof OlMultiPoint) {
            coordinatesOneDim = (<OlMultiPoint> geometry).getCoordinates();
        } 
        if (geometry instanceof OlLineString) {
            coordinatesOneDim = (<OlLineString> geometry).getCoordinates();
        } 
        if (geometry instanceof OlMultiLineString) {
            coordinatesTwoDim = (<OlMultiLineString> geometry).getCoordinates();
        } 
        if (geometry instanceof OlPolygon) {
            coordinatesTwoDim = (<OlPolygon> geometry).getCoordinates();
        } 
        if (geometry instanceof OlMultiPolygon) {
            coordinatesThreeDim = (<OlMultiPolygon> geometry).getCoordinates();
        } 
        if (coordinatesFlat.length) {
            returnCoordinates.push(this.iterateCoordinates([coordinatesFlat], srs));
        } 
        if (coordinatesOneDim.length) {
            returnCoordinates.push(this.iterateCoordinates(coordinatesOneDim, srs));
        }
        if (coordinatesTwoDim.length) {
            coordinatesTwoDim.forEach((coordinate1: OlCoordinate[]): void => {
                returnCoordinates.push(this.iterateCoordinates(coordinate1, srs));
            });
        }
        if (coordinatesThreeDim.length) {
            coordinatesThreeDim.forEach((coordinate1: OlCoordinate[][]): void => {
                coordinate1.forEach((coordinate2: OlCoordinate[]): void => {
                    returnCoordinates.push(this.iterateCoordinates(coordinate2, srs));
                });
            });
        }
        return returnCoordinates;
    }

    /**
     * Iterates through array of coordinates and return them as array of objects
     *
     * @function iterateCoordinates
     * @memberof Feature
     * @param {Object} coordinates - array of coordinates
     * @param {String} srs - srs to return coordinates in
     * @param {Object} index - index for unique id generation
     * @return {Array} array of feature vertices' coordinates along with their indices e.g. [ {idx1, x1, y1}, {idx2, x2, y2} ]
     */
    private iterateCoordinates(coordinates: OlCoordinate[], srs: string): VertexCoordinate[] {
        let indexCoord: number = 1;
        const returnCoordinates: VertexCoordinate[] = [];
        coordinates.forEach((coordinate: OlCoordinate): void => {
            coordinate = OlProj.transform(coordinate, Feature.DEFAULT_SRS, srs);
            returnCoordinates.push({"id": this.treeId, "coordinate_id": indexCoord, "name": "Coordinate", "x": coordinate[0], "y": coordinate[1]});
            this.treeId++;
            indexCoord++;
        });
        return returnCoordinates;
    }

    private findGeometryItem(items: GeometryItem[], geomId: number): GeometryItem {
        if (!items) {
            return null;
        }
        for (let i: number = 0; i < items.length; i++) {
            if (items[i].id == geomId) {
                return items[i];
            }
            return this.findGeometryItem(<GeometryItem[]> items[i].children, geomId);
        }
    }


    /**
     * Modifies feature vertex at given index
     *
     * @function modifyCoordinate
     * @memberof Feature
     * @param {String} action - modify action: "edit" or "delete"
     * @param {Number} geomId - id of geometry item to delete
     * @param {Number} coordId - id of coordinate to delete
     * @param {Array} coordValue - new coordinates
     */
    public modifyCoordinate(action: string, geomId: number, coordId: number, coordValue?: number[]): void {
        const geometryItems: GeometryItem[] = this.getCoordinates();
        const geometryItem: GeometryItem = this.findGeometryItem(geometryItems, geomId);
        if (!geometryItem) {
            return;
        }
        if (action == "edit") {
            const child: VertexCoordinate = <VertexCoordinate> geometryItem.children[coordId];
            if (child && child.name == "Coordinate") {
                child.x = coordValue[0];
                child.y = coordValue[1];
            }
        }
        if (action == "delete") {
            if (geometryItem.children && geometryItem.children[0] && geometryItem.children[0].name == "Coordinate") {
                geometryItem.children.splice(coordId, 1);
            }
        }

        console.log(geometryItems);



        /* const geometry = this.feature.getGeometry();
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
        const srs = "EPSG:" + this.getLayer().getSRSId().toString();
        let index: number = 0;
        const indexToFind: number = coordinate[0];
        const coordinateToReplace: OlCoordinate = OlProj.transform([coordinate[1], coordinate[2]], srs, Feature.DEFAULT_SRS);
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
        } */
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
                featureProjection: this.layer ? "EPSG:" + this.layer.getSRSId() || Feature.DEFAULT_SRS : Feature.DEFAULT_SRS
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
            const tempFeature: OlFeature = formatInstance.readFeature(text, {
                dataProjection: "EPSG:" + srsId.toString(),
                featureProjection: this.layer ? "EPSG:" + this.layer.getSRSId() || Feature.DEFAULT_SRS : Feature.DEFAULT_SRS
            });
            this.feature.setGeometry(tempFeature.getGeometry());
            this.dirty = true;
        }
    }

    /**
     * Creates feature geometry from text
     *
     * @function updateGeometryFromText
     * @memberof Feature
     * @param {Object} layer - layer to put a feature into
     * @param {String} text - feature text representation
     * @param {String} format - format of feature text representation
     * @param {Number} srsId - SRS Id of feature text representation
     */
    public createGeometryFromText(layer:LayerInterface, text: string, format: GeometryFormat, srsId: number): Feature {
        const formatInstance: OlWKT | OlGeoJSON = this.getFormatInstance(format);
        if (formatInstance) {
            this.feature = formatInstance.readFeature(text, {
                dataProjection: "EPSG:" + srsId.toString(),
                featureProjection: this.layer ? "EPSG:" + this.layer.getSRSId() || Feature.DEFAULT_SRS : Feature.DEFAULT_SRS
            });
            (<OlVectorSource> layer.getLayer().getSource()).addFeature(this.feature);
            this.dirty = true;
            return this;
        }
        return null;
    }

    /**
     * Checks whether feature is valid
     *
     * @function isValid
     * @memberof Feature
     * @return {Boolean} boolean indicating whether feature is valid
     */
    public isValid(): boolean {
        return booleanValid(new OlGeoJSON().writeFeatureObject(this.feature));
    }

    /**
     * Converts line to polygon
     *
     * @function lineToPolygon
     * @memberof Feature
     * @return {Object} feature representing a polygon
     */
    public lineToPolygon(): Feature {
        const coords: OlCoordinate[] | OlCoordinate[][] = (<OlLineString | OlMultiLineString> this.feature.getGeometry()).getCoordinates();
        let turfPolygon: turf.Feature;
        try {
            turfPolygon = turf.lineToPolygon(turf.lineString(<turf.helpers.Position[]> coords));
        } catch {
            return null;
        }
        const olFeature: OlFeature = new OlGeoJSON().readFeature(turfPolygon);
        this.feature.setGeometry(olFeature.getGeometry());
        return this;
    }

    /**
     * Converts polygon to line
     *
     * @function polygonToLine
     * @memberof Feature
     * @return {Object} feature representing a line
     */
    public polygonToLine(): Feature {
        const coords: OlCoordinate[][] | OlCoordinate[][][] = (<OlPolygon | OlMultiPolygon> this.feature.getGeometry()).getCoordinates();
        let turfLine: turf.Feature | turf.FeatureCollection;
        try {
            turfLine = turf.polygonToLine(turf.polygon(<turf.helpers.Position[][]> coords));
        } catch {
            return null;
        }
        const olFeature: OlFeature = new OlGeoJSON().readFeature(turfLine);
        this.feature.setGeometry(olFeature.getGeometry());
        return this;
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