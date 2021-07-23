import * as turf from "@turf/turf"
import booleanIntersects from "@turf/boolean-intersects"
import { Coordinate as  OlCoordinate} from "ol/coordinate";
import OlFeature from "ol/Feature";
import {Geometry as OlGeometry, Point as OlPoint, MultiPoint as OlMultiPoint, LineString as OlLineString, MultiLineString as OlMultiLineString, 
    Polygon as OlPolygon, MultiPolygon as OlMultiPolygon, GeometryCollection as OlGeometryCollection} from "ol/geom"
import OlVectorSource from "ol/source/Vector";
import { WKT as OlWKT, GeoJSON as OlGeoJSON }  from "ol/format";
import * as OlProj from 'ol/proj';
import {Circle as OlCircle, Fill as OlFill, Stroke as OlStroke, Style as OlStyle} from "ol/style";
import GeometryFormat from "./GeometryFormat";
import LayerInterface from "../Layer/LayerInterface";
import StyleFunction from "../Style/StyleFunctionType";
import GeometryItem from "./GeometryItem";
import VertexCoordinate from "./VertexCoordinate";

/** Feature */
export default class Feature { 
    
    private feature: OlFeature;
    private layer: LayerInterface;
    private dirty: boolean;
    private treeId: number;
    private featureParts: Map<number, OlGeometry> = new Map();
    private featureStyle: OlStyle;

    private static readonly DEFAULT_SRS = "EPSG:3857";

    /**
     * @param feature - OpenLayers' feature object
     * @param layer - OpenLayers' layer object
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
     * @return feature object
     */
    public getFeature(): OlFeature {
        return this.feature;
    }

    /**
     * Returns OpenLayers' feature type
     * @return feature type
     */
    public getType(): string {
        return this.feature.getGeometry().getType();
    }

    /**
     * Returns OpenLayers' layer object
     * @return layer instance
     */
    public getLayer(): LayerInterface {
        return this.layer;
    }

    /**
     * Sets layer of the feature
     * @param layer - layer instance
     */
    public setLayer(layer: LayerInterface): void {
        this.layer = layer;
    }

    /**
     * Sets style of the feature
     * @param style - style
     */
    public setStyle(style: StyleFunction): void {
        this.feature.setStyle(style);
    }

    /**
     * Returns the flag indicating whether the feature is dirty (newly added or modified)
     * @return flag indicating whether the feature is dirty
     */
    public isDirty(): boolean {
        return this.dirty;
    }

    /**
     * Sets the flag indicating whether the feature is dirty (newly added or modified)
     * @param dirty - flag indicating whether the feature is dirty 
     */
    public setDirty(dirty: boolean): void {
        this.dirty = dirty;
    }

    /**
     * Highlights feature
     */
    public highlight(): void {
        const selectStyleLinePolygon = new OlStyle({
            stroke: new OlStroke({
                color: "#555",
                width: 3
            }),
            fill: new OlFill({
                color: "rgba(128, 128, 128, 0.2)",
            }) 
        });
        const selectStylePoint = new OlStyle({
            image: new OlCircle({
                radius: 3,
                stroke: new OlStroke({
                    color: "#555",
                    width: 3
                })
            })
        });
        //debugger
        //console.log(this.feature.getStyle());
        this.featureStyle = (<OlStyle> this.feature.getStyle());
        const type = this.feature.getGeometry().getType();
        if (type == "Point" || type == "MultiPoint") {
            this.feature.setStyle(selectStylePoint);
        } else {
            this.feature.setStyle(selectStyleLinePolygon);
        }
    }

    /**
     * Unhighlights feature
     * @category Feature
     * @param feature - feature to unhighlight
     */
    public unhighlight(): void {
        this.feature.setStyle(this.featureStyle);
    }

    /**
     * Updates feature from  vertices
     * @param array - array of feature vertices' along with their ids and coordinates
     * @return resulting feature
     */
    public updateFromVertices(items: GeometryItem[]): Feature {
        let feature: OlFeature;
        if (items[0].name == "GeometryCollection") {
            const geometries: OlGeometry[] = [];
            (<GeometryItem[]> items[0].children).forEach((item: GeometryItem): void => {
                const geometry = this.createGeometry([item]);
                geometries.push(geometry);
            });
            feature = new OlFeature({
                geometry: new OlGeometryCollection(geometries)
            });
        } else {
            const geometry = this.createGeometry(items);
            feature = new OlFeature({
                geometry: geometry
            });
        }
        const source = <OlVectorSource> this.layer.getLayer().getSource();
        if (this.feature.getGeometry()) {
            source.removeFeature(this.feature);
        }
        feature.setProperties(this.feature.getProperties());
        this.feature = feature;
        this.dirty = true;
        source.addFeature(this.feature);
        return this;
    }

    /**
     * Creates geometry based on geometry items tree
     * @param items - vertices data
     * @return OL geometry instance
     */
    private createGeometry(items: GeometryItem[]): OlGeometry {
        if (!items.length) {
            return null;
        }
        let coordinates: OlCoordinate | OlCoordinate[] | OlCoordinate[][] = [];
        if (items[0].name == "Point") {
            (<VertexCoordinate[]> items[0].children).forEach((coordinate: VertexCoordinate): void => {
                coordinates = [coordinate.x, coordinate.y];
            });
            return new OlPoint(<OlCoordinate> coordinates);
        }
        if (items[0].name == "LineString") {
            (<VertexCoordinate[]> items[0].children).forEach((coordinate: VertexCoordinate): void => {
                (<OlCoordinate[]> coordinates).push([coordinate.x, coordinate.y]);
            });
            return new OlLineString(<OlCoordinate[]> coordinates);
        }
        if (items[0].name == "Polygon") {
            (<GeometryItem[]> items).forEach((item: GeometryItem): void => {
                (<OlCoordinate[][]> coordinates).push([]);
                (<VertexCoordinate[]> item.children).forEach((coordinate: VertexCoordinate): void => {
                    (<OlCoordinate[]> coordinates[0]).push([coordinate.x, coordinate.y]);
                });
            });
            return new OlPolygon(<OlCoordinate[][]> coordinates);
        }
        if (items[0].name == "MultiPoint") {
            (<GeometryItem[]> items[0].children).forEach((item: GeometryItem): void => {
                (<VertexCoordinate[]> item.children).forEach((coordinate: VertexCoordinate): void => {
                    (<OlCoordinate[]> coordinates).push([coordinate.x, coordinate.y]);
                });
            });
            return new OlMultiPoint(<OlCoordinate[]> coordinates);
        }
        if (items[0].name == "MultiLineString") {
            (<GeometryItem[]> items[0].children).forEach((item: GeometryItem): void => {
                (<OlCoordinate[][]> coordinates).push([]);
                (<VertexCoordinate[]> item.children).forEach((coordinate: VertexCoordinate): void => {
                    (<OlCoordinate[]> coordinates[coordinates.length-1]).push([coordinate.x, coordinate.y]);
                });
            });
            return new OlMultiLineString(<OlCoordinate[][]> coordinates);
        }
        if (items[0].name == "MultiPolygon") {
            let i = 0;
            (<GeometryItem[]> items[0].children).forEach((item: GeometryItem): void => {
                (<OlCoordinate[][]> coordinates).push([]);
                (<OlCoordinate[]> coordinates[i]).push([]);
                (<VertexCoordinate[]> item.children).forEach((coordinate: VertexCoordinate): void => {
                    (<OlCoordinate[]> coordinates[i][0]).push([coordinate.x, coordinate.y]);
                });
                i++;
            });
            return new OlMultiPolygon(<number[] | (OlCoordinate[][] | OlPolygon)[]> coordinates)
        }
    }

    /**
     * Returns feature vertices' coordinates along with their indices
     * @return array of geometry parts of feature along with their coordinates
     */
    public getVertices(): GeometryItem[] {
        const srs = "EPSG:" + this.getLayer().getSRSId().toString();
        this.treeId = 1;
        const geometry = this.feature.getGeometry();
        if (geometry instanceof OlPoint || geometry instanceof OlLineString || geometry instanceof OlPolygon) {
            const geometryItems: GeometryItem[] = [];
            const coordsArr = this.getCoordinates(geometry, srs);
            coordsArr.forEach((coords: VertexCoordinate[]): void => {
                const geometryItem: GeometryItem = {
                    "id": this.treeId,
                    "name": geometry instanceof OlPoint ? "Point" : geometry instanceof OlLineString ? "LineString" : "Polygon",
                    "children": coords
                };
                geometryItems.push(geometryItem);
                this.featureParts.set(this.treeId, geometry);
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
                    const coords = this.getCoordinates(point, srs)[0];
                    const item: GeometryItem = {
                        "id": this.treeId,
                        "name": "Point",
                        "children": coords
                    };
                    geometryItems[0].children.push(<GeometryItem & VertexCoordinate> item);
                    this.featureParts.set(this.treeId, point);
                    this.treeId++;
                });
            }
            if (geometry instanceof OlMultiLineString) {
                (<OlMultiLineString> geometry).getLineStrings().forEach((linestring: OlLineString): void => {
                    const coords = this.getCoordinates(linestring, srs)[0];
                    const item: GeometryItem = {
                        "id": this.treeId,
                        "name": "LineString",
                        "children": coords
                    };
                    geometryItems[0].children.push(<GeometryItem & VertexCoordinate> item);
                    this.featureParts.set(this.treeId, linestring);
                    this.treeId++;
                });
            }
            if (geometry instanceof OlMultiPolygon) {
                (<OlMultiPolygon> geometry).getPolygons().forEach((polygon: OlPolygon): void => {
                    const coords = this.getCoordinates(polygon, srs)[0];
                    const item: GeometryItem = {
                        "id": this.treeId,
                        "name": "Polygon",
                        "children": coords
                    };
                    geometryItems[0].children.push(<GeometryItem & VertexCoordinate> item);
                    this.featureParts.set(this.treeId, polygon);
                    this.treeId++;
                });
            }
            return geometryItems;
        }
    }

    /**
     * Returns feature vertices' coordinates along with their indices
     * @param geometry - geometry
     * @param srs - srs to return coordinates in
     * @return array of feature vertices' coordinates along with their indices e.g. [ {idx1, x1, y1}, {idx2, x2, y2} ]
     */
    private getCoordinates(geometry: OlGeometry, srs: string): VertexCoordinate[][] {
        const returnCoordinates: VertexCoordinate[][] = [];
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
     * @param coordinates - array of coordinates
     * @param srs - srs to return coordinates in
     * @param index - index for unique id generation
     * @return array of feature vertices' coordinates along with their indices e.g. [ {idx1, x1, y1}, {idx2, x2, y2} ]
     */
    private iterateCoordinates(coordinates: OlCoordinate[], srs: string): VertexCoordinate[] {
        let indexCoord = 1;
        const returnCoordinates: VertexCoordinate[] = [];
        coordinates.forEach((coordinate: OlCoordinate): void => {
            coordinate = OlProj.transform(coordinate, Feature.DEFAULT_SRS, srs);
            returnCoordinates.push({"id": this.treeId, "coordinate_id": indexCoord, "name": "Coordinate", "x": coordinate[0], "y": coordinate[1]});
            this.treeId++;
            indexCoord++;
        });
        return returnCoordinates;
    }

    /**
     * Returns feature geometry as text
     * @param format - format to return in
     * @param srsId - SRS Id of returned feature text representation
     * @return text representing feature
     */
    public getGeometryAsText(format: GeometryFormat, srsId: number): string {
        const formatInstance = this.getFormatInstance(format);
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
     * @param text - feature text representation
     * @param format - format of feature text representation
     * @param srsId - SRS Id of feature text representation
     */
    public updateGeometryFromText(text: string, format: GeometryFormat, srsId: number): void {
        const formatInstance = this.getFormatInstance(format);
        if (formatInstance) {
            const tempFeature = formatInstance.readFeature(text, {
                dataProjection: "EPSG:" + srsId.toString(),
                featureProjection: this.layer ? "EPSG:" + this.layer.getSRSId() || Feature.DEFAULT_SRS : Feature.DEFAULT_SRS
            });
            this.feature.setGeometry(tempFeature.getGeometry());
            this.dirty = true;
        }
    }

    /**
     * Creates feature geometry from text
     * @param layer - layer to put a feature into
     * @param text - feature text representation
     * @param format - format of feature text representation
     * @param srsId - SRS Id of feature text representation
     * @return feature
     */
    public createGeometryFromText(layer:LayerInterface, text: string, format: GeometryFormat, srsId: number): Feature {
        const formatInstance = this.getFormatInstance(format);
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
     * @return boolean indicating whether feature is valid
     */
    public isValid(): boolean {
        const feature = this.getFeature();
        const geometry = feature.getGeometry();
        let coordinates: OlCoordinate | OlCoordinate[] | OlCoordinate[][];
        if (geometry instanceof OlPoint) {
            coordinates = (<OlPoint> geometry).getCoordinates();
            return coordinates.length == 2;
        }
        if (geometry instanceof OlLineString) {
            coordinates = (<OlLineString> geometry).getCoordinates();
            return !!coordinates.length;
        }
        if (geometry instanceof OlPolygon) {
            const linesFeature = this.polygonToLine();
            const coordinates = (<OlMultiLineString> linesFeature.getFeature().getGeometry()).getCoordinates();
            console.log(coordinates);
            for (let i = 0; i < coordinates.length; i++) {
                for (let j = 0; j < coordinates.length; j++) {
                    if (i != j) {
                        const line1 = turf.lineString(coordinates[i]);
                        const line2 = turf.lineString(coordinates[j]);
                        if (booleanIntersects(line1, line2)) {
                            return false;
                        }
                    }

                }
            }
            return true;
        }



        //return booleanValid(new OlGeoJSON().writeFeatureObject(this.feature));
    }

    /**
     * Converts line to polygon
     * @return feature representing a polygon
     */
    public lineToPolygon(): Feature {
        const coords = (<OlLineString | OlMultiLineString> this.feature.getGeometry()).getCoordinates();
        let turfPolygon: turf.Feature;
        try {
            turfPolygon = turf.lineToPolygon(turf.lineString(<turf.helpers.Position[]> coords));
        } catch {
            return null;
        }
        const olFeature = new OlGeoJSON().readFeature(turfPolygon);
        this.feature.setGeometry(olFeature.getGeometry());
        return this;
    }

    /**
     * Converts polygon to line
     * @return feature representing a line
     */
    public polygonToLine(): Feature {
        const coords = (<OlPolygon | OlMultiPolygon> this.feature.getGeometry()).getCoordinates();
        let turfLine: turf.Feature | turf.FeatureCollection;
        try {
            turfLine = turf.polygonToLine(turf.polygon(<turf.helpers.Position[][]> coords));
        } catch {
            return null;
        }
        const olFeature = new OlGeoJSON().readFeature(turfLine);
        this.feature.setGeometry(olFeature.getGeometry());
        return this;
    }

    /**
     * Splits geometry into simple geometries
     * @param geometry - geometry to split
     * @return simple geometries
     */
    public splitGeometry(geometry: OlGeometry): OlGeometry[] {
        const simpleGeometries: OlGeometry[] = [];
        if (geometry instanceof OlMultiPoint) {
            (<OlMultiPoint> geometry).getPoints().forEach((point: OlPoint): void => {
                simpleGeometries.push(point);
            });
        } else if (geometry instanceof OlMultiLineString) {
            (<OlMultiLineString> geometry).getLineStrings().forEach((linestring: OlLineString): void => {
                simpleGeometries.push(linestring);
            });
        } else if (geometry instanceof OlMultiPolygon) {
            (<OlMultiPolygon> geometry).getPolygons().forEach((polygon: OlPolygon): void => {
                simpleGeometries.push(polygon);
            });
        } else if (geometry instanceof OlGeometryCollection) {
            return [];
        } else { // geometry itself is a simple one
            simpleGeometries.push(geometry);
        }
        return simpleGeometries;
    }

    /**
     * Splits geometry collection into simple geometries
     * @param geometryCollection - geometry collection to split
     * @return simple geometries
     */
     public splitGeometryCollection(geometryCollection: OlGeometryCollection): OlGeometry[] {
        let simpleGeometries: OlGeometry[] = [];
        if (geometryCollection instanceof OlGeometryCollection) {
            geometryCollection.getGeometries().forEach((geometry: OlGeometry): void => {
                const subgeometries = this.splitGeometry(geometry);
                if (subgeometries.length) {
                    simpleGeometries = simpleGeometries.concat(subgeometries);
                }
            });
        }
        return simpleGeometries;
    }

    /**
     * Returns format instance based on format type
     * @param format - format
     * @return format instance
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