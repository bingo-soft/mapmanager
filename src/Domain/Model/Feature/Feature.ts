import * as turf from "@turf/turf"
import booleanIntersects from "@turf/boolean-intersects"
import OlVectorLayer from "ol/layer/Vector";
import { Coordinate as  OlCoordinate} from "ol/coordinate";
import OlFeature from "ol/Feature";
import {Geometry as OlGeometry, Point as OlPoint, MultiPoint as OlMultiPoint, LineString as OlLineString, MultiLineString as OlMultiLineString, 
    Polygon as OlPolygon, MultiPolygon as OlMultiPolygon, GeometryCollection as OlGeometryCollection} from "ol/geom"
import OlVectorSource from "ol/source/Vector";
import { WKT as OlWKT, GeoJSON as OlGeoJSON }  from "ol/format";
import * as OlProj from 'ol/proj';
import {Style as OlStyle} from "ol/style";
import * as OlSphere from "ol/sphere";
import GeometryFormat from "./GeometryFormat";
import LayerInterface from "../Layer/LayerInterface";
import StyleFunction from "../Style/StyleFunctionType";
import GeometryItem from "./GeometryItem";
import VertexCoordinate from "./VertexCoordinate";
import { HighlightFeatureStyle } from "../Style/HighlightFeatureStyle";
import StyleBuilder from "../Style/StyleBuilder";
import EventBus from "../EventHandlerCollection/EventBus";
import SourceChangedEvent from "../Source/SourceChangedEvent";
import FeatureCollection from "./FeatureCollection";
import Units from "./Units";
import Geometry from "../../../Infrastructure/Util/Geometry";

/** Feature */
export default class Feature { 
    
    private eventBus: EventBus;
    private feature: OlFeature;
    private layer: LayerInterface;
    private treeId: number;
    private featureParts: Map<number, OlGeometry> = new Map();
    private featureStyle: OlStyle;

    private static readonly DEFAULT_SRS_ID = 3857;

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

    public setEventBus(eventBus: EventBus): void
    {
        this.eventBus = eventBus;
    }

    public getEventBus(): EventBus | null
    {
        return this.eventBus;
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
     * Sets properties of the feature
     * @param props - properties
     */
    public setProperties(props: {[key: string]: any}): void {
        this.feature.setProperties(props);
    }

    /**
     * Returns feature properties
     * @return feature properties
     */
    public getProperties(): any {
        return this.feature.getProperties();
    }

    /**
     * Highlights feature
     */
    public highlight(): void {
        this.featureStyle = (<OlStyle> this.feature.getStyle());
        const styleFunc = new StyleBuilder(HighlightFeatureStyle).build(false);
        this.setStyle(styleFunc);
    }

    /**
     * Unhighlights feature
     * @param feature - feature to unhighlight
     */
    public unhighlight(): void {
        this.feature.setStyle(this.featureStyle);
    }

    /**
     * Updates geometry based on geometry items tree
     * @param items - vertices data
     * @param srsId - SRS Id of geometry items, defaults to feature's layer SRS Id
     * @return OL geometry instance
     */
    public updateFromVertices(items: GeometryItem[], srsId?: number): Feature {
        srsId = srsId || this.layer.getSRSId();
        if (items[0].name == "GeometryCollection") {
            const geometries: OlGeometry[] = [];
            (<GeometryItem[]> items[0].children).forEach((item: GeometryItem): void => {
                const geometry = this.createGeometry([item], srsId);
                geometries.push(geometry);
            });
            this.getFeature().setGeometry(new OlGeometryCollection(geometries));
        } else {
            const geometry = this.createGeometry(items, srsId);
            this.getFeature().setGeometry(geometry);
        }
        this.layer.setDirtyFeatures(new FeatureCollection([this]));
        if (this.eventBus) {
            this.eventBus.dispatch(new SourceChangedEvent());
        }
        return this;
    }

    /**
     * Creates geometry based on geometry items tree
     * @param items - vertices data
     * @param srsId - SRS Id of geometry items, defaults to feature's layer SRS Id
     * @return OL geometry instance
     */
    private createGeometry(items: GeometryItem[], srsId: number): OlGeometry {
        if (!items.length) {
            return null;
        }
        let coordinates: OlCoordinate | OlCoordinate[] | OlCoordinate[][] = [];
        if (items[0].name == "Point") {
            const coordinate = <VertexCoordinate> items[0].children[0];
            return new OlPoint(<OlCoordinate> this.transformCoordinateToMapSRS([coordinate.x , coordinate.y], srsId));
        }
        if (items[0].name == "LineString") {
            (<VertexCoordinate[]> items[0].children).forEach((coordinate: VertexCoordinate): void => {
                (<OlCoordinate[]> coordinates).push(this.transformCoordinateToMapSRS([coordinate.x , coordinate.y], srsId));
            });
            return new OlLineString(<OlCoordinate[]> coordinates);
        }
        if (items[0].name == "Polygon") {
            (<GeometryItem[]> items).forEach((item: GeometryItem): void => {
                (<OlCoordinate[][]> coordinates).push([]);
                (<VertexCoordinate[]> item.children).forEach((coordinate: VertexCoordinate): void => {
                    (<OlCoordinate[]> coordinates[0]).push(this.transformCoordinateToMapSRS([coordinate.x , coordinate.y], srsId));
                });
            });
            return new OlPolygon(<OlCoordinate[][]> coordinates);
        }
        if (items[0].name == "MultiPoint") {
            (<GeometryItem[]> items[0].children).forEach((item: GeometryItem): void => {
                (<VertexCoordinate[]> item.children).forEach((coordinate: VertexCoordinate): void => {
                    (<OlCoordinate[]> coordinates).push(this.transformCoordinateToMapSRS([coordinate.x , coordinate.y], srsId));
                });
            });
            return new OlMultiPoint(<OlCoordinate[]> coordinates);
        }
        if (items[0].name == "MultiLineString") {
            (<GeometryItem[]> items[0].children).forEach((item: GeometryItem): void => {
                (<OlCoordinate[][]> coordinates).push([]);
                (<VertexCoordinate[]> item.children).forEach((coordinate: VertexCoordinate): void => {
                    (<OlCoordinate[]> coordinates[coordinates.length-1]).push(this.transformCoordinateToMapSRS([coordinate.x , coordinate.y], srsId));
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
                    (<OlCoordinate[]> coordinates[i][0]).push(this.transformCoordinateToMapSRS([coordinate.x , coordinate.y], srsId));
                });
                i++;
            });
            return new OlMultiPolygon(<number[] | (OlCoordinate[][] | OlPolygon)[]> coordinates)
        }
    }

    /**
     * Transforms coordinates to map projection
     * @param coordinate - coordinate
     * @param srsId - projection to transform from
     * @return coordinate transformed into map projection
     */
    private transformCoordinateToMapSRS(coordinate: OlCoordinate, srsId: number): OlCoordinate {
        if (srsId) {
            coordinate = OlProj.transform(coordinate, "EPSG:" + srsId.toString(), "EPSG:" + this.layer.getMap().getSRSId().toString());
        }
        return coordinate;
    }

    /**
     * Returns feature vertices' coordinates along with their indices
     * @param srsId - SRS Id to return vertices in, defaults to feature's layer SRS Id
     * @return array of geometry parts of feature along with their coordinates
     */
    public getVertices(srsId?: number): GeometryItem[] {
        const srs = srsId ? 
            "EPSG:" + srsId : 
            "EPSG:" + (this.layer ? this.layer.getSRSId().toString() : Feature.DEFAULT_SRS_ID);
        this.treeId = 1;
        const geometry = this.feature.getGeometry();
        const type = this.getType();
        //if (geometry instanceof OlPoint || geometry instanceof OlLineString || geometry instanceof OlPolygon) {
        if (type == "Point" || type == "LineString" || type == "Polygon") {
            const geometryItems: GeometryItem[] = [];
            const coordsArr = this.getCoordinates(geometry, srs);
            coordsArr.forEach((coords: VertexCoordinate[]): void => {
                const geometryItem: GeometryItem = {
                    "id": this.treeId,
                    "name": type,
                    "children": coords
                };
                geometryItems.push(geometryItem);
                this.featureParts.set(this.treeId, geometry);
                this.treeId++;
            });
            return geometryItems;
        }
        if (type == "MultiPoint" || type == "MultiLineString" || type == "MultiPolygon") {
            const geometryItems: GeometryItem[] = [{
                "id": this.treeId,
                "name": type,
                "children": []
            }];
            this.treeId++;
            if (type == "MultiPoint") {
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
            if (type == "MultiLineString") {
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
            if (type == "MultiPolygon") {
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
        const type = geometry.getType();
        if (type == "Point") {
            coordinatesFlat = (<OlPoint> geometry).getCoordinates();
        } 
        if (type == "MultiPoint") {
            coordinatesOneDim = (<OlMultiPoint> geometry).getCoordinates();
        } 
        if (type == "LineString") {
            coordinatesOneDim = (<OlLineString> geometry).getCoordinates();
        } 
        if (type == "MultiLineString") {
            coordinatesTwoDim = (<OlMultiLineString> geometry).getCoordinates();
        } 
        if (type == "Polygon") {
            coordinatesTwoDim = (<OlPolygon> geometry).getCoordinates();
        } 
        if (type == "MultiPolygon") {
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
        const mapSRS = "EPSG:" + (this.layer ? this.layer.getMap().getSRSId() : Feature.DEFAULT_SRS_ID);
        coordinates.forEach((coordinate: OlCoordinate): void => {
            coordinate = OlProj.transform(coordinate, mapSRS, srs);
            returnCoordinates.push({"id": this.treeId, "coordinate_id": indexCoord, "name": "Coordinate", "x": coordinate[0], "y": coordinate[1]});
            this.treeId++;
            indexCoord++;
        });
        return returnCoordinates;
    }

    /**
     * Returns feature geometry as text
     * @param format - format to return in
     * @param srsId - SRS Id of returning feature text representation
     * @return text representing feature
     */
    public getGeometryAsText(format: GeometryFormat, srsId: number): string {
        const formatInstance = this.getFormatInstance(format);
        if (formatInstance) {
            return formatInstance.writeFeature(this.feature, {
                dataProjection: "EPSG:" + srsId.toString(),
                //featureProjection: this.layer ? "EPSG:" + this.layer.getSRSId() || Feature.DEFAULT_SRS : Feature.DEFAULT_SRS
                featureProjection: "EPSG:" + this.layer.getMap().getSRSId()
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
    public updateFeatureFromText(text: string, format: GeometryFormat, srsId: number): void {
        const formatInstance = this.getFormatInstance(format);
        if (formatInstance) {
            const tempFeature = formatInstance.readFeature(text, {
                dataProjection: "EPSG:" + srsId.toString(),
                //featureProjection: this.layer ? "EPSG:" + this.layer.getSRSId() || Feature.DEFAULT_SRS : Feature.DEFAULT_SRS
                featureProjection: "EPSG:" + this.layer.getMap().getSRSId()
            });
            this.feature.setGeometry(tempFeature.getGeometry());
            if (this.eventBus) {
                this.eventBus.dispatch(new SourceChangedEvent());
            }
        }
    }

    /**
     * Creates feature from text
     * @param text - feature text representation
     * @param format - format of feature text representation
     * @param sourceSrsId - SRS Id of feature text representation
     * @param targetSrsId - SRS Id of returned feature, equals to sourceSrsId if omitted
     * @return feature
     */
    public createFeatureFromText(text: string, format: GeometryFormat, sourceSrsId: number, targetSrsId: number): Feature {
        if (format == GeometryFormat.Text) {
            const points: number[][] = Geometry.textPointsToArray(text);
            let olFeature;
            const subGeometries = [];
            const subGeometryTypes = [];
            let subGeometry = [];
            for (let i = 0; i < points.length; i++) {
                if (points[i].length == 0 || i == points.length - 1) {
                    if (i == points.length - 1) {
                        subGeometry.push(points[i]);   
                    }
                    if (subGeometry.length == 1) {
                        subGeometryTypes.push("Point");
                        subGeometries.push(subGeometry);
                    } else {
                        const firstPoint = subGeometry[0];
                        const lastPoint = subGeometry[subGeometry.length-1];
                        if (firstPoint[0] == lastPoint[0] && firstPoint[1] == lastPoint[1]) {
                            subGeometryTypes.push("Polygon");
                            subGeometries.push(subGeometry);
                        } else {
                            subGeometryTypes.push("LineString");
                            subGeometries.push(subGeometry);
                        }
                    }
                    subGeometry = [];
                } else {
                    subGeometry.push(points[i]);
                }
            }
            let geometryType;
            if (subGeometries.length == 1) {
                geometryType = "SimpleGeometry";
            } else {
                const multiGeometry = subGeometryTypes.every( (val, i, arr) => val === arr[0] ); 
                geometryType =  multiGeometry ? "MultiGeometry" : "GeometryCollection";
            }
            if (geometryType == "SimpleGeometry") {
                switch (subGeometryTypes[0]) {
                    case "Point":
                        olFeature = new OlFeature({
                            geometry: new OlPoint(
                                subGeometries[0][0]
                            )
                        });
                        break;
                    case "LineString":
                        olFeature = new OlFeature({
                            geometry: new OlLineString(
                                subGeometries[0]
                            )
                        });
                        break;
                    case "Polygon":
                        olFeature = new OlFeature({
                            geometry: new OlPolygon([
                                subGeometries[0]
                            ])
                        });
                        break;
                }
            } else if (geometryType == "MultiGeometry") {
                const points = [];
                switch (subGeometryTypes[0]) {
                    case "Point":
                        subGeometries.forEach((item) => {
                            points.push(item[0]);
                        });
                        olFeature = new OlFeature({
                            geometry: new OlMultiPoint(
                                points
                            )
                        });
                        break;
                    case "LineString":
                        olFeature = new OlFeature({
                            geometry: new OlMultiLineString(
                                subGeometries
                            )
                        });
                        break;
                    case "Polygon":
                        subGeometries.forEach((item) => {
                            points.push([item]);
                        });
                        olFeature = new OlFeature({
                            geometry: new OlMultiPolygon(
                                points
                            )
                        });
                        break;
                }
            } else if (geometryType == "GeometryCollection") {
                const gc = new OlGeometryCollection();
                const gcGeometries = [];
                subGeometries.forEach((item, idx) => {
                    let geometry;
                    switch (subGeometryTypes[idx]) {
                        case "Point":
                            geometry = new OlPoint(
                                item[0]
                            )
                            break;
                        case "LineString":
                            geometry = new OlLineString(
                                item
                            )
                            break;
                        case "Polygon":
                            geometry = new OlPolygon([
                                item
                            ])
                            break;
                    }
                    gcGeometries.push(geometry);
                });
                gc.setGeometries(gcGeometries);
                olFeature = new OlFeature({
                    geometry: gc
                });
            }
            const formatInstance = this.getFormatInstance(GeometryFormat.GeoJSON);
            const textFeature = formatInstance.writeFeature(olFeature, {
                dataProjection: "EPSG:" + sourceSrsId.toString(),
                featureProjection: "EPSG:" + sourceSrsId.toString()
            });
            olFeature = formatInstance.readFeature(textFeature, {
                dataProjection: "EPSG:" + sourceSrsId.toString(),
                featureProjection: "EPSG:" + targetSrsId.toString()
            });
            this.feature = olFeature;
            return this;
        } else {
            const formatInstance = this.getFormatInstance(format);
            if (formatInstance) {
                this.feature = formatInstance.readFeature(text, {
                    dataProjection: "EPSG:" + sourceSrsId.toString(),
                    featureProjection: "EPSG:" + targetSrsId.toString()
                });
                return this;
            }
            return null;
        }
    }

    /**
     * Checks whether feature valid
     * @return boolean indicating whether feature valid
     */
    public isValid(): boolean {
        const geometry = this.getFeature().getGeometry();
        let invalid: OlPoint[] | OlLineString[];
        if (geometry instanceof OlPoint) {
            return (<OlPoint> geometry).getCoordinates().length == 2;
        } else if (geometry instanceof OlMultiPoint) {
            invalid = (<OlMultiPoint> geometry).getPoints().filter(point => point.getCoordinates().length != 2);
            return invalid.length == 0;
        } else if (geometry instanceof OlLineString) {
            return !!(<OlLineString> geometry).getCoordinates().length;
        } else if (geometry instanceof OlMultiLineString) { 
            invalid = (<OlMultiLineString> geometry).getLineStrings().filter(linestring => linestring.getCoordinates().length == 0);
            return invalid.length == 0;
        } else if (geometry instanceof OlPolygon || geometry instanceof OlMultiPolygon) {
            var unkinked = turf.unkinkPolygon(<any> new OlGeoJSON().writeFeatureObject(this.feature));
            return unkinked && unkinked.features && unkinked.features.length == 1;
        } else {
            return false;
        }
    }

    /**
     * Returns an array of layers where feature intersects layer's feature(s)
     * @return an array of intersected layers
     */
    public getIntersectedLayers(): LayerInterface[] {
        const intersectedLayers: LayerInterface[] = [];
        const thisFeature = this.getFeature();
        const thisFeatureGeometryTurf = new OlGeoJSON().writeFeatureObject(thisFeature).geometry;
        const layers = this.layer.getMap().getLayers();
        for (let i = 0; i < layers.length; ++i) {
            const olLayer = layers[i].getLayer();
            if (olLayer instanceof OlVectorLayer) {
                const olFeatures = (<OlVectorLayer> olLayer).getSource().getFeatures();
                for (let j = 0; j < olFeatures.length; ++j) {
                    const featureGeometryTurf = new OlGeoJSON().writeFeatureObject(olFeatures[j]).geometry;
                    // if it's not an original feature and there is an intersection
                    if (olFeatures[j] !== thisFeature && booleanIntersects(turf.feature(thisFeatureGeometryTurf), turf.feature(featureGeometryTurf))) {
                        intersectedLayers.push(layers[i]);
                        break;
                    } 
                }
            }    
        }
        return intersectedLayers;
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
        if (this.eventBus) {
            this.eventBus.dispatch(new SourceChangedEvent());
        }
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
        if (this.eventBus) {
            this.eventBus.dispatch(new SourceChangedEvent());
        }
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
     * Returns the length of linestring or multilinestring, 
     * the perimeter of polygon or multipolygon in given units
     * @param units - units, "meters" or "kilometers"
     * @param srsId - srs id of projection, defaults to 3857
     * @return length of linestring or multilinestring
     */
    public getLength(units: Units, srsId = 3857): number {
        let length = OlSphere.getLength(this.feature.getGeometry(), {"projection": "EPSG:" + srsId.toString()});
        if (units == Units.kilometers) {
            length = length / 1000;
        }
        return length;
    }

    /**
     * Returns the area of polygon or multipolygon in given units
     * @param units - units, "meters" or "kilometers"
     * @param srsId - srs id of projection, defaults to 3857
     * @return area of polygon or multipolygon
     */
    public getArea(units: Units, srsId = 3857): number {
        let area = OlSphere.getArea(this.feature.getGeometry(), {"projection": "EPSG:" + srsId.toString()});
        if (units == Units.kilometers) {
            area = area / 1000000;
        }
        return area;
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