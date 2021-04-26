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
     * Gets map regime
     *
     * @function getMapRegime
     * @memberof MapManager
     * @static
     * @param {Map} map - map instance
     * @return {Regime} map regime
     */
    public static getInteraction(map: Map): InteractionType {
        return map.getInteraction();
    }

    /**
     * Sets map normal regime
     *
     * @function setDrawRegime
     * @memberof MapManager
     * @static
     * @param {Map} map - map instance
     */
    public static setNormalInteraction(map: Map): void {
        map.setNormalInteraction();
    }

    /**
     * Sets map draw regime
     *
     * @function setDrawRegime
     * @memberof MapManager
     * @static
     * @param {Map} map - map instance
     * @param {LayerInterface} layer - layer instance
     * @param {Object} opts - options
     */
    public static setDrawInteraction(map: Map, layer: LayerInterface, opts: unknown): void {
        map.setDrawInteraction(layer, opts["geometry_type"], opts["draw_callback"]);
    }

    /**
     * Sets map draw regime
     *
     * @function setDrawRegime
     * @memberof MapManager
     * @static
     * @param {Map} map - map instance
     * @param {LayerInterface} layer - layer instance
     * @param {Object} opts - options
     */
    public static setSelectInteraction(map: Map, opts: unknown): void {
        map.setSelectInteraction(opts["selection_type"], opts["layers"], opts["select_callback"]);
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
        map.setZoomInteraction(opts["type"]);
    }

    /**
     * Creates new layer
     *
     * @function createLayer
     * @memberof MapManager
     * @static
     * @param {SourceType} type - layer's source type
     * @param {Object} opts - options
     * @param {Function} callback - callback to run on complete layer load
     * @return {LayerInterface} created layer instance
     */
    public static createLayer(type: SourceType, opts?: unknown): LayerInterface { 
        let builder: LayerBuilder;
        switch (type) {
            case SourceType.Vector:
                builder = new LayerBuilder(new VectorLayer(opts));
                builder.setSource(SourceType.Vector);       
                break;
            /* case SourceType.Tile:
                builder = new LayerBuilder(new TileLayer());
                builder.setSource(SourceType.Tile); 
                break;   */
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
            /* if (typeof opts["properties"] !== "undefined") { 
                builder.setProperties(opts["properties"]);
            } */
            if (type == SourceType.Vector && Object.prototype.hasOwnProperty.call(opts, "request")) { 
                    builder.setLoader(async (): Promise<string> => {
                        const query = new VectorLayerFeaturesLoadQuery(new VectorLayerRepository());
                        return await query.execute(opts["request"]);
                    }/* , opts */);
            }
            if (type == SourceType.Vector) {
                builder.setStyle(opts["style"]);
            }
            if ((type == SourceType.XYZ || type == SourceType.TileArcGISRest) && Object.prototype.hasOwnProperty.call(opts, "url")) { 
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
     * @function createLayerFromFeatures
     * @memberof MapManager
     * @static
     * @param {String} features - a string representing features
     * @param {Object} opts - options
     * @return {LayerInterface} created layer instance
     */
    public static createLayerFromGeoJSON(geoJSON: string, opts?: unknown): LayerInterface {
        const layer: VectorLayer = <VectorLayer> this.createLayer(SourceType.Vector, opts);
        if (geoJSON) {
            geoJSON = Geometry.flattenGeometry(geoJSON);
            layer.addFeatures(geoJSON);
        }
        return layer;
    }

    public static getFeatureCollection(layer: VectorLayer): FeatureCollection {
        return layer.getFeatureCollection();
    }

    /**
     * Gets features of the layer as FeatureCollection GeoJSON
     *
     * @function getFeaturesAsFeatureCollection
     * @memberof MapManager
     * @static
     * @param {LayerInterface} layer - layer instance
     * @return {String} GeoJSON representing features as FeatureCollection
     */
    /* public static getFeaturesAsFeatureCollection(layer: VectorLayer): string {
        return layer.getFeaturesAsFeatureCollection();
    } */

    /**
     * Gets features of the layer as single geometry GeoJSON
     *
     * @function getFeaturesAsSingleGeometry
     * @memberof MapManager
     * @static
     * @param {LayerInterface} layer - layer instance
     * @return {String} GeoJSON representing features as single geometry
     */
    public static getFeaturesAsSingleGeometry(features: FeatureCollection): string {
        return features.getAsSingleGeometry();
    }

    /**
     * Gets features of the layer as multi geometry GeoJSON
     *
     * @function getFeaturesAsMultiGeometry
     * @memberof MapManager
     * @static
     * @param {LayerInterface} layer - layer instance
     * @return {String} GeoJSON representing features as multi geometry
     */
    public static getFeaturesAsMultiGeometry(features: FeatureCollection): string {
        return features.getAsMultiGeometry();
    }

    /**
     * Gets features of the layer as GeometryCollection GeoJSON
     *
     * @function getFeaturesAsGeometryCollection
     * @memberof MapManager
     * @static
     * @param {LayerInterface} layer - layer instance
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
     * @param {LayerInterface} layer - layer instance
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
     * @param {Map} map - map instance
     * @param {LayerInterface} layer - layer instance
     */
    public static removeLayer(map: Map, layer: LayerInterface): void {
        map.removeLayer(layer);
    }

    /**
     * Gets active layer of the map.
     *
     * @function getActiveLayer
     * @memberof MapManager
     * @static
     * @param {Map} map - map instance
     * @param {LayerInterface} layer - layer instance
     * @return {LayerInterface} active layer instance
     */
    public static getActiveLayer(map: Map): LayerInterface {
        return map.getActiveLayer();
    }

    /**
     * Sets active layer for the map.
     *
     * @function setActiveLayer
     * @memberof MapManager
     * @static
     * @param {Map} map - map instance
     * @param {LayerInterface} layer - layer instance
     */
    public static setActiveLayer(map: Map, layer: LayerInterface): void {
        map.setActiveLayer(layer);
    }

    /**
     * Fits map to all layer's features extent
     *
     * @function fitLayer
     * @memberof Map
     * @param {Map} map - map instance
     * @param {LayerInterface} layer - layer instance
     * @param {Number} zoom - zoom after fit
     */
    public static fitLayer(map: Map, layer: LayerInterface, zoom?: number): void { 
        map.fitLayer(layer, zoom);
    }

    /**
     * Sets zIndex of layer
     *
     * @function setZIndex
     * @memberof MapManager
     * @static
     * @param {LayerInterface} layer - layer instance
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
     * @param {LayerInterface} layer - layer instance
     * @param {Number} opacity - opacity to set (from 0 to 100)
     */
    public static setOpacity(layer: LayerInterface, opacity: number): void { 
        layer.setOpacity(opacity);
    }
}
