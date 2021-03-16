import AccentMap from "../Domain/Model/Map/Map"
import Regime from "../Domain/Model/Map/Regime"
import LayerInterface from "../Domain/Model/Layer/LayerInterface"
import VectorLayer from "../Domain/Model/Layer/Impl/VectorLayer"
import TileLayer from "../Domain/Model/Layer/Impl/TileLayer"
import LayerBuilder from "../Domain/Model/Layer/LayerBuilder"
import SourceType from "../Domain/Model/Source/SourceType"
import VectorLayerFeaturesLoadQuery from "../Application/Query/VectorLayerFeaturesLoadQuery"
import VectorLayerRepository from "./Repository/VectorLayerRepository"

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
     * @return {AccentMap} map instance
     */
    public static createMap(targetDOMId: string, opts?: unknown): AccentMap {
        const map : AccentMap = new AccentMap(targetDOMId, opts); 
        return map;
    }

    /**
     * Updates map size
     *
     * @function updateSize
     * @memberof MapManager
     * @static
     * @param {AccentMap} map - map instance
     */
    public static updateSize(map: AccentMap): void {
        map.updateSize();
    }

    /**
     * Sets center of the map. Notice: in case of degree-based CRS x is longitude, y is latitude.
     *
     * @function setCenter
     * @memberof MapManager
     * @static
     * @param {AccentMap} map - map instance
     * @param {Object} opts - options
     */
    public static setCenter(map: AccentMap, opts?: unknown): void {
        map.setCenter(opts);
    }

    /**
     * Sets zoom of the map.
     *
     * @function setZoom
     * @memberof MapManager
     * @static
     * @param {AccentMap} map - map instance
     * @param {Number} zoom - zoom value
     */
    public static setZoom(map: AccentMap, zoom: number): void {
        map.setZoom(zoom);
    }
   
    /**
     * Gets map regime
     *
     * @function getMapRegime
     * @memberof MapManager
     * @static
     * @param {AccentMap} map - map instance
     * @return {Regime} map regime
     */
    public static getRegime(map: AccentMap): Regime {
        return map.getRegime();
    }

    /**
     * Sets map normal regime
     *
     * @function setDrawRegime
     * @memberof MapManager
     * @static
     * @param {AccentMap} map - map instance
     */
    public static setNormalRegime(map: AccentMap): void {
        map.setNormalRegime();
    }

    /**
     * Sets map draw regime
     *
     * @function setDrawRegime
     * @memberof MapManager
     * @static
     * @param {AccentMap} map - map instance
     * @param {LayerInterface} layer - layer instance
     * @param {Object} opts - feature type
     */
    public static setDrawRegime(map: AccentMap, layer: LayerInterface, opts: unknown): void {
        map.setDrawRegime(layer, opts["geometry_type"], opts["draw_callback"]);
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
                builder = new LayerBuilder(new VectorLayer());
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
            if (Object.prototype.hasOwnProperty.call(opts, "request")) { 
                    builder.setLoader(async (): Promise<string> => {
                        const query = new VectorLayerFeaturesLoadQuery(new VectorLayerRepository());
                        return await query.execute(opts["request"]);
                    }, opts);
            }
            if (Object.prototype.hasOwnProperty.call(opts, "url")) { 
                builder.setUrl(opts["url"]);
            }
            if (Object.prototype.hasOwnProperty.call(opts, "style")) {
                builder.setStyle(opts["style"]);
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
    public static createLayerFromFeatures(features: string, opts?: unknown): LayerInterface {
        const layer: VectorLayer = <VectorLayer>this.createLayer(SourceType.Vector, opts);
        layer.addFeatures(features, opts);
        return layer;
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
    public static getFeaturesAsFeatureCollection(layer: VectorLayer): string {
        return layer.getFeaturesAsFeatureCollection();
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
    public static getFeaturesAsGeometryCollection(layer: VectorLayer): string {
        return layer.getFeaturesAsGeometryCollection();
    }
    
    /**
     * Adds layer to the map.
     *
     * @function addLayer
     * @memberof MapManager
     * @static
     * @param {AccentMap} map - map instance
     * @param {LayerInterface} layer - layer instance
     */
    public static addLayer(map: AccentMap, layer: LayerInterface): void {
        map.addLayer(layer);
    }

    /**
     * Removes layer from the map.
     *
     * @function removeLayer
     * @memberof MapManager
     * @static
     * @param {AccentMap} map - map instance
     * @param {LayerInterface} layer - layer instance
     */
    public static removeLayer(map: AccentMap, layer: LayerInterface): void {
        map.removeLayer(layer);
    }

    /**
     * Gets active layer of the map.
     *
     * @function getActiveLayer
     * @memberof MapManager
     * @static
     * @param {AccentMap} map - map instance
     * @param {LayerInterface} layer - layer instance
     * @return {LayerInterface} active layer instance
     */
    public static getActiveLayer(map: AccentMap): LayerInterface {
        return map.getActiveLayer();
    }

    /**
     * Sets active layer for the map.
     *
     * @function setActiveLayer
     * @memberof MapManager
     * @static
     * @param {AccentMap} map - map instance
     * @param {LayerInterface} layer - layer instance
     */
    public static setActiveLayer(map: AccentMap, layer: LayerInterface): void {
        map.setActiveLayer(layer);
    }

    /**
     * Fits map to all layer's features extent
     *
     * @function fitLayer
     * @memberof Map
     * @param {AccentMap} map - map instance
     * @param {LayerInterface} layer - layer instance
     */
    public static fitLayer(map: AccentMap, layer: LayerInterface): void { 
        map.fitLayer(layer);
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
