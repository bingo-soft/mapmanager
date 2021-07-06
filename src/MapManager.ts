import "../assets/style.css"
import Map from "./Domain/Model/Map/Map"
import LayerInterface from "./Domain/Model/Layer/LayerInterface"
import VectorLayer from "./Domain/Model/Layer/Impl/VectorLayer"
import TileLayer from "./Domain/Model/Layer/Impl/TileLayer"
import LayerBuilder from "./Domain/Model/Layer/LayerBuilder"
import SourceType from "./Domain/Model/Source/SourceType"
import VectorLayerFeaturesLoadQuery from "./Application/Query/VectorLayerFeaturesLoadQuery"
import VectorLayerRepository from "./Infrastructure/Repository/VectorLayerRepository"
import FeatureCollection from "./Domain/Model/Feature/FeatureCollection"
import Geometry from "./Infrastructure/Util/Geometry"
import InteractionType from "./Domain/Model/Interaction/InteractionType"
import EventType from "./Domain/Model/EventHandlerCollection/EventType"
import EventHandlerCollection from "./Domain/Model/EventHandlerCollection/EventHandlerCollection"
import Feature from "./Domain/Model/Feature/Feature"
import GeometryFormat from "./Domain/Model/Feature/GeometryFormat"
import InteractionInterface from "./Domain/Model/Interaction/InteractionInterface"
import StyleBuilder from "./Domain/Model/Style/StyleBuilder"
import StyleFunction from "./Domain/Model/Style/StyleFunctionType"
import GeometryItem from "./Domain/Model/Feature/GeometryItem"
import { CopyStyle, CutStyle } from "./Domain/Model/Style/ClipboardStyle"

/** @class MapManager */
export default class MapManager { 

    /**
     * Creates OpenLayers map object and controls.
     *
     * @function createMap
     * @memberof MapManager
     * @static
     * @param {String} targetDOMId - id of target DOM element
     * @param {Object} opts - options
     * @return {Map} map instance
     */
    public static createMap(targetDOMId: string, opts?: unknown): Map {
        const map : Map = new Map(targetDOMId, opts); 
        return map;
    }

    /**
     * Updates map size
     *
     * @function updateSize
     * @memberof MapManager
     * @static
     * @param {Map} map - map instance
     */
    public static updateSize(map: Map): void {
        map.updateSize();
    }

    /**
     * Sets center of the map. Notice: in case of degree-based CRS x is longitude, y is latitude.
     *
     * @function setCenter
     * @memberof MapManager
     * @static
     * @param {Map} map - map instance
     * @param {Object} opts - options
     */
    public static setCenter(map: Map, opts?: unknown): void {
        map.setCenter(opts);
    }

    /**
     * Sets zoom of the map.
     *
     * @function setZoom
     * @memberof MapManager
     * @static
     * @param {Map} map - map instance
     * @param {Number} zoom - zoom value
     */
    public static setZoom(map: Map, zoom: number): void {
        map.setZoom(zoom);
    }

    /**
     * Sets cursor of the map.
     *
     * @function setCursor
     * @memberof Map
     * @static
     * @param {Map} map - map instance
     * @param {String} cursor - cursor type
     */
    public static setCursor(map: Map, cursor: string): void {
        map.setCursor(cursor);
    }
   
    /**
     * Returns current map interaction type
     *
     * @function getInteraction
     * @memberof MapManager
     * @static
     * @param {Object} map - map instance
     * @return {String} current map interaction type
     */
    public static getInteractionType(map: Map): InteractionType {
        return map.getInteractionType();
    }

    /**
     * Sets map normal interaction
     *
     * @function setNormalInteraction
     * @memberof MapManager
     * @static
     * @param {Object} map - map instance
     */
    public static setNormalInteraction(map: Map): void {
        map.setNormalInteraction();
    }

    /**
     * Sets map draw interaction
     *
     * @function setDrawInteraction
     * @memberof MapManager
     * @static
     * @param {Object} map - map instance
     * @param {Object} layer - layer instance
     * @param {Object} opts - options
     */
    public static setDrawInteraction(map: Map, layer: LayerInterface, opts: unknown): void {
        map.setDrawInteraction(layer, opts["geometry_type"], opts["draw_callback"]);
        map.setModifyInteraction(layer);
    }

    /**
     * Sets map selection interaction
     *
     * @function setSelectInteraction
     * @memberof MapManager
     * @static
     * @param {Object} map - map instance
     * @param {Object} layer - layer instance
     * @param {Object} opts - options
     */
    public static setSelectInteraction(map: Map, opts: unknown): InteractionInterface {
        return map.setSelectInteraction(opts["selection_type"], opts["layers"], opts["multiple"], opts["select_callback"]);
    }

    /**
     * Sets zoom interaction
     *
     * @function setZoomInteraction
     * @memberof MapManager
     * @static
     * @param {Map} map - map instance
     * @param {Object} opts - options
     */
     public static setZoomInteraction(map: Map, opts: unknown): void {
        map.setZoomInteraction(opts["zoom_type"]);
    }

    /**
     * Sets map modify interaction
     *
     * @function setModifyInteraction
     * @memberof MapManager
     * @static
     * @param {Object} map - map instance
     * @param {Object} opts - options
     */
    public static setModifyInteraction(map: Map, opts: unknown): void {
        map.setModifyInteraction(opts["source"], opts["modify_callback"]);
    }

    /**
     * Sets map transform interaction
     *
     * @function setTransformInteraction
     * @memberof MapManager
     * @static
     * @param {Object} map - map instance
     * @param {Object} opts - options
     */
    public static setTransformInteraction(map: Map, opts: unknown): void {
        map.setTransformInteraction(opts["source"], opts["transform_callback"]);
    }

    /**
     * Sets map measure interaction
     *
     * @function setMeasureInteraction
     * @memberof MapManager
     * @static
     * @param {Object} map - map instance
     * @param {Object} opts - options
     */
    public static setMeasureInteraction(map: Map, opts: unknown): void { 
       map.setMeasureInteraction(opts["measure_type"], opts["measure_units"]/* , opts["measure_callback"] */);
    }

    /**
     * Clears interactions
     *
     * @function clearInteractions
     * @memberof Map
     * @static
     * @param {Object} map - map instance
     * @param {Array} types - types of interaction to clear, all if not set
     */ 
    public static clearInteractions(map: Map, types?: InteractionType[]): void {
        map.clearInteractions(types);
    }

    /**
     * Clears map modify interactions
     *
     * @function clearMeasureResult
     * @memberof MapManager
     * @static
     * @param {Object} map - map instance
     */
    public static clearMeasureResult(map: Map): void {
        map.clearMeasureLayer();
        map.clearMeasureOverlays();
        map.setNormalInteraction();
    }

    /**
     * Creates new layer
     *
     * @function createLayer
     * @memberof MapManager
     * @static
     * @param {String} type - layer's source type
     * @param {Object} opts - options
     * @param {Function} callback - callback to run on complete layer load
     * @return {Object} created layer instance
     */
    public static createLayer(type: SourceType, opts?: unknown): LayerInterface { 
        let builder: LayerBuilder;
        switch (type) {
            case SourceType.Vector:
                builder = new LayerBuilder(new VectorLayer(null, opts));
                builder.setSource(SourceType.Vector);       
                break;
            case SourceType.TileWMS:
                builder = new LayerBuilder(new TileLayer());
                builder.setSource(SourceType.TileWMS); 
                break;
            case SourceType.XYZ:
                builder = new LayerBuilder(new TileLayer());
                builder.setSource(SourceType.XYZ); 
                break;
            case SourceType.TileArcGISRest:
                builder = new LayerBuilder(new TileLayer());
                builder.setSource(SourceType.TileArcGISRest);  
                break;
            default:
                break;
        }
        if (typeof builder !== "undefined" && typeof opts !== "undefined") { 
            if (typeof opts["properties"] !== "undefined") { 
                builder.setProperties(opts["properties"]);
            }
            if (type == SourceType.Vector && Object.prototype.hasOwnProperty.call(opts, "request")) { 
                    builder.setLoader(async (): Promise<string> => {
                        const query = new VectorLayerFeaturesLoadQuery(new VectorLayerRepository());
                        return await query.execute(opts["request"]);
                    });
            }
            if (type == SourceType.Vector && Object.prototype.hasOwnProperty.call(opts, "style")) {
                builder.setStyle(opts["style"]);
            }
            if (Object.prototype.hasOwnProperty.call(opts, "url")) { 
                builder.setUrl(opts["url"]);
            }
            if (type == SourceType.TileWMS && Object.prototype.hasOwnProperty.call(opts, "params")) { 
                builder.setParams(opts["params"]);
            }
            if (Object.prototype.hasOwnProperty.call(opts, "load_callback")) {
                builder.setLoadCallback(opts["load_callback"]);
            }
        }
        return builder.build();
    }

    /**
     * Creates layer from features
     *
     * @function createLayerFromGeoJSON
     * @memberof MapManager
     * @static
     * @param {String} geoJSON - a string representing features
     * @param {Object} opts - options
     * @return {Object} created layer instance
     */
    public static createLayerFromGeoJSON(geoJSON: string, opts?: unknown): LayerInterface {
        const layer: VectorLayer = <VectorLayer> this.createLayer(SourceType.Vector, opts);
        if (geoJSON) {
            geoJSON = Geometry.flattenGeometry(geoJSON);
            layer.addFeatures(geoJSON);
        }
        return layer;
    }

    /**
     * Returns features of the layer as FeatureCollection
     *
     * @function getFeatureCollection
     * @memberof MapManager
     * @static
     * @param {Object} layer - layer instance
     * @return {Object} feature collection 
     */
    public static getFeatures(layer: VectorLayer): FeatureCollection {
        return layer.getFeatures();
    }

    /**
     * Returns features of the layer as single geometry GeoJSON
     *
     * @function getFeaturesAsSingleGeometry
     * @memberof MapManager
     * @static
     * @param {Object} layer - layer instance
     * @param {Number} srsId - SRS Id of returned features
     * @return {String} GeoJSON representing features as single geometry
     */
    public static getFeaturesAsSingleGeometry(features: FeatureCollection, srsId: number): string {
        return features.getAsSingleGeometry(srsId);
    }

    /**
     * Returns features of the layer as multi geometry GeoJSON
     *
     * @function getFeaturesAsMultiGeometry
     * @memberof MapManager
     * @static
     * @param {Object} layer - layer instance
     * @param {Number} srsId - SRS Id of returned features
     * @return {String} GeoJSON representing features as multi geometry
     */
    public static getFeaturesAsMultiGeometry(features: FeatureCollection, srsId: number): string {
        return features.getAsMultiGeometry(srsId);
    }

    /**
     * Returns features of the layer as GeometryCollection GeoJSON
     *
     * @function getFeaturesAsGeometryCollection
     * @memberof MapManager
     * @static
     * @param {Object} layer - layer instance
     * @param {Number} srsId - SRS Id of returned features
     * @return {String} GeoJSON representing features as GeometryCollection
     */
    public static getFeaturesAsGeometryCollection(features: FeatureCollection, srsId: number): string {
        return features.getAsGeometryCollection(srsId);
    }

    /**
     * Adds features to map
     *
     * @function addFeatures
     * @memberof MapManager
     * @static
     * @param {Object} map - map instance
     * @param {Object} layer - layer to add to
     * @param {Object} features - features to add
     */
    public static addFeatures(map: Map, layer: LayerInterface, features: FeatureCollection): void {
        map.addFeatures(layer, features);
    }

    /**
     * Removes features from map
     *
     * @function removeFeatures
     * @memberof MapManager
     * @static
     * @param {Object} map - map instance
     * @param {Object} features - features to remove
     */
    public static removeFeatures(map: Map, features: FeatureCollection): void {
        map.removeFeatures(features);
    }

    /**
     * Adds layer to the map.
     *
     * @function addLayer
     * @memberof MapManager
     * @static
     * @param {Object} map - map instance
     * @param {Object} layer - layer instance
     */
    public static addLayer(map: Map, layer: LayerInterface): void {
        map.addLayer(layer);
    }

    /**
     * Removes layer from the map.
     *
     * @function removeLayer
     * @memberof MapManager
     * @static
     * @param {Object} map - map instance
     * @param {Object} layer - layer instance
     */
    public static removeLayer(map: Map, layer: LayerInterface): void {
        map.removeLayer(layer);
    }

     /**
     * Returns map layers.
     *
     * @function getLayers
     * @memberof Map
     * @static
     * @param {Object} map - map instance
     * @param {String} type - type
     * @return {Array} map layers
     */
    public static getLayers(map: Map, type?: SourceType): LayerInterface[] {
        return map.getLayers(type);
    }

    /**
     * Returns active layer of the map.
     *
     * @function getActiveLayer
     * @memberof MapManager
     * @static
     * @param {Object} map - map instance
     * @return {Object} active layer instance
     */
    public static getActiveLayer(map: Map): LayerInterface | null {
        return map.getActiveLayer();
    }

    /**
     * Sets active layer for the map.
     *
     * @function setActiveLayer
     * @memberof MapManager
     * @static
     * @param {Object} map - map instance
     * @param {Object} layer - layer instance
     */
    public static setActiveLayer(map: Map, layer: LayerInterface | null): void {
        map.setActiveLayer(layer);
    }

    /**
     * Fits map to all layer's features extent
     *
     * @function fitLayer
     * @memberof Map
     * @static
     * @param {Object} map - map instance
     * @param {Object} layer - layer instance
     * @param {Number} zoom - zoom after fit
     */
    public static fitLayer(map: Map, layer: LayerInterface, zoom?: number): void { 
        map.fitLayer(layer, zoom);
    }

    /**
     * Fits map to given features extent
     *
     * @function fitFeatures
     * @memberof Map
     * @static
     * @param {Object} map - map instance
     * @param {Object} features - features
     * @param {Number} zoom - zoom after fit
     */
     public static fitFeatures(map: Map, features: FeatureCollection, zoom?: number): void { 
        map.fitFeatures(features, zoom);
    }

    /**
     * Sets zIndex of layer
     *
     * @function setZIndex
     * @memberof MapManager
     * @static
     * @param {Object} layer - layer instance
     * @param {Number} zIndex - zIndex to set
     */
    public static setZIndex(layer: LayerInterface, zIndex: number): void {
        layer.setZIndex(zIndex);
    }

    /**
     * Sets opacity of layer
     *
     * @function setOpacity
     * @memberof MapManager
     * @static
     * @param {Object} layer - layer instance
     * @param {Number} opacity - opacity to set (from 0 to 100)
     */
    public static setOpacity(layer: LayerInterface, opacity: number): void { 
        layer.setOpacity(opacity);
    }

    /**
     * Return layer's SRS Id
     *
     * @function getSRSId
     * @memberof MapManager
     * @static
     * @param {Object} layer - layer instance
     * @return {Number} SRS Id
     */
    public static getSRSId(layer: LayerInterface): number { 
        return layer.getSRSId();
    }

    /**
     * Returns map's selected features
     *
     * @function getSelectedFeatures
     * @memberof MapManager
     * @static
     * @param {Object} map - map instance
     * @return {Object} selected features
     */
    public static getSelectedFeatures(map: Map): FeatureCollection { 
        return map.getSelectedFeatures();
    }

    /**
     * Clears map's selection
     *
     * @function clearSelection
     * @memberof MapManager
     * @static
     * @param {Object} map - map instance
     */
    public static clearSelection(map: Map): void { 
        map.clearSelectedFeatures();
    }

    /**
     * Sets an event handler on map
     *
     * @function setEventHandler
     * @memberof MapManager
     * @static
     * @param {Object} map - map instance
     * @param {String} eventType - event type
     * @param {String} handlerId - handler id
     * @param {Function} callback - callback function to call when an event is triggered
     */
    public static setEventHandler(map: Map, eventType: EventType, handlerId: string, callback: (data: unknown) => void): void {
        map.setEventHandler(eventType, handlerId, callback);
    }

    /**
     * Returns map's event handlers
     *
     * @function getEventHandlers
     * @memberof MapManager
     * @static
     * @param {Object} map - map instance
     * @return {Object} event handlers collection
     */
    public static getEventHandlers(map: Map): EventHandlerCollection {
        return map.getEventHandlers();
    }

    /**
     * Returns map's dirty (added or modified) features
     *
     * @function getDirtyFeatures
     * @memberof MapManager
     * @static
     * @param {Object} layer - layer instance
     * @return {Object} dirty features
     */
    public static getDirtyFeatures(layer: LayerInterface): FeatureCollection {
        return layer.getDirtyFeatures();
    }

    /**
     * Returns map's dirty (containing added or modified features) layers
     *
     * @function getDirtyLayers
     * @memberof MapManager
     * @return {Array} dirty layers
     */
    public getDirtyLayers(map: Map): LayerInterface[] {
        return map.getDirtyLayers();
    }

    /**
     * Returns feature vertices' coordinates along with their indices
     *
     * @function getVertices
     * @memberof MapManager
     * @static
     * @param {Object} feature - feature
     * @return {Array} array of feature vertices' along with their ids and coordinates
     */
    public static getVertices(feature: Feature): GeometryItem[] {
        return feature.getVertices();
    }

    /**
     * Edits feature vertex coordinate at given index
     *
     * @function setVertices
     * @memberof MapManager
     * @static
     * @param {Array} array of feature vertices' along with their ids and coordinates
     * @param {Object} feature - feature to set vertices to. If not specified, a new feature will be created and added to map
     */
    public static setVertices(geometryItems: GeometryItem[], feature?: Feature): void {
        feature.setVertices(geometryItems);
    }

    /**
     * Returns feature geometry as text
     *
     * @function getGeometryAsText
     * @memberof MapManager
     * @static
     * @param {Object} feature - feature
     * @param {String} format - format to return in
     * @param {Number} srsId - SRS Id of returned feature text representation
     * @return {String} text representing feature
     */
    public static getGeometryAsText(feature: Feature, format: GeometryFormat, srsId: number): string {
       return feature.getGeometryAsText(format, srsId);
    }

    /**
     * Updates feature geometry from text
     *
     * @function updateGeometryFromText
     * @memberof MapManager
     * @static
     * @param {Object} feature - feature
     * @param {String} text - feature text representation
     * @param {String} format - format of feature text representation
     * @param {Number} srsId - SRS Id of feature text representation
     */
    public static updateGeometryFromText(feature: Feature, text: string, format: GeometryFormat, srsId: number): void {
        feature.updateGeometryFromText(text, format, srsId);
    }

    /**
     * Creates feature geometry from text
     *
     * @function createGeometryFromText
     * @memberof MapManager
     * @static
     * @param {Object} layer - layer to put a feature into
     * @param {String} text - feature text representation
     * @param {String} format - format of feature text representation
     * @param {Number} srsId - SRS Id of feature text representation
     */
    public static createGeometryFromText(layer: LayerInterface, text: string, format: GeometryFormat, srsId: number): Feature {
        const feature: Feature = new Feature();
        return feature.createGeometryFromText(layer, text, format, srsId);
    }

    /**
     * Copies features into clipboard
     *
     * @function copyFeatures
     * @memberof MapManager
     * @static
     * @param {Object} map - map instance
     * @param {Object} features - features to cut
     */
    public static copyFeatures(map: Map, features: FeatureCollection): void {
        MapManager.setStyle(features, CopyStyle);
        map.copyToClipBoard(features);
    }

    /**
     * Cuts features into clipboard
     *
     * @function cutFeatures
     * @memberof MapManager
     * @static
     * @param {Object} map - map instance
     * @param {Object} features - features to cut
     */
    public static cutFeatures(map: Map, features: FeatureCollection): void {
        MapManager.setStyle(features, CutStyle);
        map.cutToClipBoard(features);
    }

    /**
     * Pastes features from clipboard
     *
     * @function pasteFeatures
     * @memberof MapManager
     * @static
     * @param {Object} map - map instance
     * @param {Object} map - layer instance to paste to
     */
    public static pasteFeatures(map: Map, layer: LayerInterface): void {
        map.pasteFromClipboard(layer);
    }

    /**
     * Sets style of features 
     *
     * @function setStyle
     * @memberof MapManager
     * @static
     * @param {Object} features - features
     * @param {Object} style - style
     */
    public static setStyle(features: FeatureCollection, style: unknown): void {
        if (features && features.getLength()) {
            const styleFunc: StyleFunction = new StyleBuilder(style).build();
            features.forEach((feature: Feature): void => {
                feature.setStyle(styleFunc);
            });
        }
    }

    /**
     * Highlights vertex
     *
     * @function highlightVertex
     * @memberof MapManager
     * @param {Array} coordinate - coordinate
     * @param {Number} srsId - SRS Id of coordinate
     */
     public static highlightVertex(map: Map, coordinate: number[], srsId: number): void {
        map.highlightVertex(coordinate, srsId);
    }

    /**
     * Clears vertex highlight
     *
     * @function unHighlightVertex
     * @memberof MapManager
     */
    public static clearVertexHighlight(map: Map): void {
        map.clearVertexHighlight();
    }

    /**
     * Checks whether feature is valid
     *
     * @function isValid
     * @memberof MapManager
     * @param {Object} feature - representing a line
     * @return {Boolean} boolean indicating whether feature is valid
     */
     public static isValid(feature: Feature): boolean {
        return feature.isValid();
    }

    /**
     * Converts line to polygon
     *
     * @function lineToPolygon
     * @memberof MapManager
     * @param {Object} feature - representing a line
     * @return {Object} feature representing a polygon
     */
    public static lineToPolygon(feature: Feature): Feature {
        return feature.lineToPolygon();
    }

    /**
     * Converts polygon to line
     *
     * @function polygonToLine
     * @memberof MapManager
     * @param {Object} feature - representing a polygon
     * @return {Object} feature representing a line
     */
     public static polygonToLine(feature: Feature): Feature {
        return feature.polygonToLine();
    }



}
