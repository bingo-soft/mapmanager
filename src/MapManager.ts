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
    public static setSelectInteraction(map: Map, opts: unknown): void {
        map.setSelectInteraction(opts["selection_type"], opts["layers"], opts["multiple"], opts["select_callback"]);
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
        map.setTransformInteraction(opts["transform_callback"]);
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
     * @param {Object} map - map instance
     * @param {Array} types - types of interaction to clear, all if not set
     * @memberof Map
     */ 
    public static clearInteractions(map: Map, types?: InteractionType[]): void {
        map.clearInteractions(types);
    }

    /**
     * Clears map modify interactions
     *
     * @function clearMeasureResult
     * @memberof MapManager
     * @param {Object} map - map instance
     * @static
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
                builder = new LayerBuilder(new VectorLayer(opts));
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
                    }/* , opts */);
            }
            if (type == SourceType.Vector) {
                builder.setStyle(opts["style"]);
            }
            if ((/* type == SourceType.Vector ||  */type == SourceType.XYZ || type == SourceType.TileArcGISRest || type == SourceType.TileWMS) && Object.prototype.hasOwnProperty.call(opts, "url")) { 
                builder.setUrl(opts["url"]);
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

    // TODO: выяснить, что это и зачем
    public static getFeatureCollection(layer: VectorLayer): FeatureCollection {
        return layer.getFeatureCollection();
    }

    /**
     * Returns features of the layer as single geometry GeoJSON
     *
     * @function getFeaturesAsSingleGeometry
     * @memberof MapManager
     * @static
     * @param {Object} layer - layer instance
     * @return {String} GeoJSON representing features as single geometry
     */
    public static getFeaturesAsSingleGeometry(features: FeatureCollection): string {
        return features.getAsSingleGeometry();
    }

    /**
     * Returns features of the layer as multi geometry GeoJSON
     *
     * @function getFeaturesAsMultiGeometry
     * @memberof MapManager
     * @static
     * @param {Object} layer - layer instance
     * @return {String} GeoJSON representing features as multi geometry
     */
    public static getFeaturesAsMultiGeometry(features: FeatureCollection): string {
        return features.getAsMultiGeometry();
    }

    /**
     * Returns features of the layer as GeometryCollection GeoJSON
     *
     * @function getFeaturesAsGeometryCollection
     * @memberof MapManager
     * @static
     * @param {Object} layer - layer instance
     * @return {String} GeoJSON representing features as GeometryCollection
     */
    public static getFeaturesAsGeometryCollection(features: FeatureCollection): string {
        return features.getAsGeometryCollection();
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
     * @param {String} handlerName - handler id
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
     * @param {Object} map - map instance
     * @return {Object} dirty features
     */
    public static getDirtyFeatures(map: Map): FeatureCollection {
        return map.getDirtyFeatures();
    }

    /**
     * Sets map's dirty (added or modified) features
     *
     * @function setDirtyFeatures
     * @memberof MapManager
     * @param {Object} map - map instance
     * @param {Object} features - features to be set
     * @param {Boolean} dirty - dirty flag
     * @return {Object} feature collection with given dirty flag set
     */
    public static setDirtyFeatures(map: Map, features: FeatureCollection, dirty: boolean): FeatureCollection {
        return map.setDirtyFeatures(features, dirty);
    }

    /**
     * Returns feature vertices' coordinates along with their indices
     *
     * @function getVertexCoordinates
     * @memberof MapManager
     * @param {Object} feature - feature
     * @return {Array} array of feature vertices' coordinates along with their indices e.g. [ [idx1, x1, y1], [idx2, x2, y2] ]
     */
    public static getVertexCoordinates(feature: Feature): number[][] {
        return feature.getCoordinates();
    }

    /**
     * Edits feature vertex coordinate at given index
     *
     * @function editVertexCoordinate
     * @memberof MapManager
     * @param {Object} feature - feature
     * @param {Number} index - vertice index to edit
     * @param {Array} coordinate - feature vertex coordinate
     */
    public static editVertexCoordinate(feature: Feature, index: number, coordinate: number[]): void {
        feature.modifyCoordinate("edit", [index, coordinate[0], coordinate[1]]);
    }

    /**
     * Deletes feature vertex coordinate at given index
     *
     * @function deleteVertexCoordinate
     * @memberof MapManager
     * @param {Object} feature - feature
     * @param {Number} index - vertex index to delete
     */
     public static deleteVertexCoordinate(feature: Feature, index: number): void {
        feature.modifyCoordinate("delete", [index]);
    }

}
