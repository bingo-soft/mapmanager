import * as turf from "@turf/turf"
import booleanIntersects from "@turf/boolean-intersects"
import VectorLayer from "ol/layer/Vector";
import { Coordinate as  OlCoordinate} from "ol/coordinate";
import OlFeature from "ol/Feature";
import {Geometry as OlGeometry, Point as OlPoint, MultiPoint as OlMultiPoint, LineString as OlLineString, MultiLineString as OlMultiLineString, 
    Polygon as OlPolygon, MultiPolygon as OlMultiPolygon, GeometryCollection as OlGeometryCollection} from "ol/geom"
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
import { OlVectorLayer } from "../Type/Type";

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
        const styleFunc = new StyleBuilder(HighlightFeatureStyle).build();
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
     * Creates feature from vertices
     * @param items - feature vertices along with their ids and coordinates
     * @param sourceSrsId - SRS Id of feature representation
     * @param targetSrsId - SRS Id of returned feature
     * @return resulting feature
     */
    public createFromVertices(items: GeometryItem[], sourceSrsId: number, targetSrsId: number): Feature {
        this.setEventBus(this.eventBus);
        this.updateFromVertices(items, sourceSrsId, targetSrsId);
        return this;
    }

    /**
     * Updates feature from vertices
     * @param items - vertices data
     * @param sourceSrsId - SRS Id of feature representation
     * @param targetSrsId - SRS Id of returned feature
     * @return OL geometry instance
     */
    public updateFromVertices(items: GeometryItem[], sourceSrsId: number, targetSrsId: number): Feature {
        if (items[0].name == "GeometryCollection") {
            const geometries: OlGeometry[] = [];
            (<GeometryItem[]> items[0].children).forEach((item: GeometryItem): void => {
                const geometry = this.createGeometry([item], sourceSrsId, targetSrsId);
                geometries.push(geometry);
            });
            this.getFeature().setGeometry(new OlGeometryCollection(geometries));
        } else {
            const geometry = this.createGeometry(items, sourceSrsId, targetSrsId);
            this.getFeature().setGeometry(geometry);
        }
        if (this.layer) {
            this.layer.setDirtyFeatures(new FeatureCollection([this]));
        }
        if (this.eventBus) {
            this.eventBus.dispatch(new SourceChangedEvent());
        }
        return this;
    }

    /**
     * Creates geometry based on geometry items tree
     * @param items - vertices data
     * @param sourceSrsId - SRS Id of feature representation
     * @param targetSrsId - SRS Id of returned feature
     * @return OL geometry instance
     */
    private createGeometry(items: GeometryItem[], sourceSrsId: number, targetSrsId: number): OlGeometry {
        if (!items.length) {
            return null;
        }
        const coordinates: OlCoordinate | OlCoordinate[] | OlCoordinate[][] = [];
        if (items[0].name == "Point") {
            const coordinate = <VertexCoordinate> items[0].children[0];
            return new OlPoint(<OlCoordinate> this.transformCoordinate([coordinate.x , coordinate.y], sourceSrsId, targetSrsId));
        }
        if (items[0].name == "LineString") {
            (<VertexCoordinate[]> items[0].children).forEach((coordinate: VertexCoordinate): void => {
                (<OlCoordinate[]> coordinates).push(this.transformCoordinate([coordinate.x , coordinate.y], sourceSrsId, targetSrsId));
            });
            return new OlLineString(<OlCoordinate[]> coordinates);
        }
        if (items[0].name == "Polygon") {
            (<GeometryItem[]> items).forEach((item: GeometryItem): void => {
                (<OlCoordinate[][]> coordinates).push([]);
                (<VertexCoordinate[]> item.children).forEach((coordinate: VertexCoordinate): void => {
                    (<OlCoordinate[]> coordinates[0]).push(this.transformCoordinate([coordinate.x , coordinate.y], sourceSrsId, targetSrsId));
                });
            });
            return new OlPolygon(<OlCoordinate[][]> coordinates);
        }
        if (items[0].name == "MultiPoint") {
            (<GeometryItem[]> items[0].children).forEach((item: GeometryItem): void => {
                (<VertexCoordinate[]> item.children).forEach((coordinate: VertexCoordinate): void => {
                    (<OlCoordinate[]> coordinates).push(this.transformCoordinate([coordinate.x , coordinate.y], sourceSrsId, targetSrsId));
                });
            });
            return new OlMultiPoint(<OlCoordinate[]> coordinates);
        }
        if (items[0].name == "MultiLineString") {
            (<GeometryItem[]> items[0].children).forEach((item: GeometryItem): void => {
                (<OlCoordinate[][]> coordinates).push([]);
                (<VertexCoordinate[]> item.children).forEach((coordinate: VertexCoordinate): void => {
                    (<OlCoordinate[]> coordinates[coordinates.length-1]).push(this.transformCoordinate([coordinate.x , coordinate.y], sourceSrsId, targetSrsId));
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
                    (<OlCoordinate[]> coordinates[i][0]).push(this.transformCoordinate([coordinate.x , coordinate.y], sourceSrsId, targetSrsId));
                });
                i++;
            });
            return new OlMultiPolygon(<number[] | (OlCoordinate[][] | OlPolygon)[]> coordinates)
        }
    }

    /**
     * Transforms coordinate from source projection to target one
     * @param coordinate - coordinate
     * @param sourceSrsId - SRS Id to transform from
     * @param targetSrsId - SRS Id to transform to
     * @return transformed coordinate
     */
    private transformCoordinate(coordinate: OlCoordinate, sourceSrsId: number, targetSrsId: number): OlCoordinate {
        coordinate = OlProj.transform(coordinate, "EPSG:" + sourceSrsId.toString(), "EPSG:" + targetSrsId.toString());
        return coordinate;
    }

    /**
     * Returns feature vertices' coordinates along with their indices
     * @param sourceSrsId - SRS Id of feature
     * @param targetSrsId - SRS Id of returned data
     * @return array of geometry parts of feature along with their coordinates
     */
    public getVertices(sourceSrsId: number, targetSrsId: number): GeometryItem[] {
        const sourceSrs = "EPSG:" + sourceSrsId;
        const targetSrs = "EPSG:" + targetSrsId;
        this.treeId = 1;
        const geometry = this.feature.getGeometry();
        const type = this.getType();
        //if (geometry instanceof OlPoint || geometry instanceof OlLineString || geometry instanceof OlPolygon) {
        if (type == "Point" || type == "LineString" || type == "Polygon") {
            const geometryItems: GeometryItem[] = [];
            const coordsArr = this.getCoordinates(geometry, sourceSrs, targetSrs);
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
                    const coords = this.getCoordinates(point, sourceSrs, targetSrs)[0];
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
                    const coords = this.getCoordinates(linestring, sourceSrs, targetSrs)[0];
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
                    const coords = this.getCoordinates(polygon, sourceSrs, targetSrs)[0];
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
        return [];
    }

    /**
     * Returns feature vertices' coordinates along with their indices
     * @param geometry - geometry
     * @param sourceSrs - SRS of geometry
     * @param targetSrs - SRS of returned data
     * @return array of feature vertices' coordinates along with their indices e.g. [ {idx1, x1, y1}, {idx2, x2, y2} ]
     */
    private getCoordinates(geometry: OlGeometry, sourceSrs: string, targetSrs: string): VertexCoordinate[][] {
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
            returnCoordinates.push(this.iterateCoordinates([coordinatesFlat], sourceSrs, targetSrs));
        } 
        if (coordinatesOneDim.length) {
            returnCoordinates.push(this.iterateCoordinates(coordinatesOneDim, sourceSrs, targetSrs));
        }
        if (coordinatesTwoDim.length) {
            coordinatesTwoDim.forEach((coordinate1: OlCoordinate[]): void => {
                returnCoordinates.push(this.iterateCoordinates(coordinate1, sourceSrs, targetSrs));
            });
        }
        if (coordinatesThreeDim.length) {
            coordinatesThreeDim.forEach((coordinate1: OlCoordinate[][]): void => {
                coordinate1.forEach((coordinate2: OlCoordinate[]): void => {
                    returnCoordinates.push(this.iterateCoordinates(coordinate2, sourceSrs, targetSrs));
                });
            });
        }
        return returnCoordinates;
    }

    /**
     * Iterates through array of coordinates and return them as array of objects
     * @param coordinates - array of coordinates
     * @param sourceSrs - SRS of coordinates
     * @param targetSrs - SRS of returned data
     * @return array of objects representing coordinates
     */
    private iterateCoordinates(coordinates: OlCoordinate[], sourceSrs: string, targetSrs: string): VertexCoordinate[] {
        let indexCoord = 1;
        const returnCoordinates: VertexCoordinate[] = [];
        coordinates.forEach((coordinate: OlCoordinate): void => {
            coordinate = OlProj.transform(coordinate, sourceSrs, targetSrs);
            returnCoordinates.push({"id": this.treeId, "coordinate_id": indexCoord, "name": "Coordinate", "x": coordinate[0], "y": coordinate[1]});
            this.treeId++;
            indexCoord++;
        });
        return returnCoordinates;
    }

    /**
     * Returns feature geometry as text
     * @param format - format to return in
     * @param sourceSrsId - SRS Id of feature geometry
     * @param targetSrsId - SRS Id of returned text
     * @return text representing feature
     */
    public getGeometryAsText(format: GeometryFormat, sourceSrsId: number, targetSrsId: number): string {
        const formatInstance = this.getFormatInstance(format);
        if (formatInstance) {
            return formatInstance.writeFeature(this.feature, {
                dataProjection: "EPSG:" + targetSrsId.toString(),
                featureProjection: "EPSG:" + sourceSrsId.toString()
            });
        }
        return "";
    }

    /**
     * Updates feature geometry from text
     * @param text - feature text representation
     * @param format - format of feature text representation
     * @param sourceSrsId - SRS Id of feature text representation
     * @param targetSrsId - SRS Id of returned feature
     * @return feature
     */
    public updateFromText(text: string, format: GeometryFormat, sourceSrsId: number, targetSrsId: number): Feature {
        if (format == GeometryFormat.Text) {
            text = this.getGeoJSONFromText(text, sourceSrsId);
            format = GeometryFormat.GeoJSON;
        }
        const formatInstance = this.getFormatInstance(format);
        if (formatInstance) {
            const tempFeature = formatInstance.readFeature(text, {
                dataProjection: "EPSG:" + sourceSrsId.toString(),
                featureProjection: "EPSG:" + targetSrsId.toString()
            });
            this.feature.setGeometry(tempFeature.getGeometry());
            if (this.layer) {
                this.layer.setDirtyFeatures(new FeatureCollection([this]));
            }
            if (this.eventBus) {
                this.eventBus.dispatch(new SourceChangedEvent());
            }
            return this;
        }
    }

    /**
     * Creates feature from text
     * @param text - feature text representation
     * @param format - format of feature text representation
     * @param sourceSrsId - SRS Id of feature text representation
     * @param targetSrsId - SRS Id of returned feature
     * @return feature
     */
    public createFromText(text: string, format: GeometryFormat, sourceSrsId: number, targetSrsId: number): Feature {
        if (format == GeometryFormat.Text) {
            text = this.getGeoJSONFromText(text, sourceSrsId);
            if (text == '') {
                return null;
            }
            format = GeometryFormat.GeoJSON;
        }
        const formatInstance = this.getFormatInstance(format);
        if (formatInstance) {
            this.feature = formatInstance.readFeature(text, {
                dataProjection: "EPSG:" + sourceSrsId.toString(),
                featureProjection: "EPSG:" + targetSrsId.toString()
            });
            this.setEventBus(this.eventBus);
            return this;
        }
        return null;
    }

    /**
     * Returns GeoJSON created from plain text
     * @param text - feature text representation
     * @param sourceSrsId - SRS Id of feature text representation
     * @return GeoJSON string
     */
    private getGeoJSONFromText(text: string, sourceSrsId: number): string {
        const pointsDecOrDMS: number[][] = Geometry.textPointsToArray(text);
        const points = [];
        let x = 0;
        let y = 0;
        for (let i = 0; i < pointsDecOrDMS.length; i++) {
            const point = pointsDecOrDMS[i];
            if (point.length == 0) {
                points.push([]);
                continue;   
            }
            if (point.length == 6) {
                x = point[0] + point[1] / 60 + point[2] / 3600;
                y = point[3] + point[4] / 60 + point[5] / 3600;
            } else {
                x = point[0];
                y = point[1];    
            }
            if (!x || !y) {
                return '';
            }
            points.push([x, y]);
        }
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
        return formatInstance.writeFeature(olFeature, {
            dataProjection: "EPSG:" + sourceSrsId.toString(),
            featureProjection: "EPSG:" + sourceSrsId.toString()
        });
    }

    /**
     * Checks whether feature valid
     * @param geometryType - geometry type of feature, if omitted then feature's own geometry type will be used
     * @return boolean indicating whether feature valid
     */
    public isValid(geometryType?: string): boolean {
        const geometry = this.getFeature().getGeometry();
        if (geometryType && geometry.getType() != geometryType) {
            return false;
        }
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
            const unkinked = turf.unkinkPolygon(<any> new OlGeoJSON().writeFeatureObject(this.feature));
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
            if (olLayer instanceof VectorLayer) {
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