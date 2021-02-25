import AccentMap from "./Map/Map"
import Regime from "./Map/Regime"
import LayerInterface from "./Layer/LayerInterface"
import VectorLayer from "./Layer/Impl/VectorLayer"
import LayerType from "./Layer/LayerType"
import LayerBuilder from "./Layer/LayerBuilder"
import SourceType from "./Source/SourceType"

/** @class MapManager */
export default class MapManager { 

    /**
     * Creates OpenLayers map object and controls.
     *
     * @function createMap
     * @memberof MapManager
     * @static
     * @param {String} targetDOMId - id of target DOM element
     * @return {AccentMap} - map instance
     */
    public static createMap(targetDOMId: string, centerX: number, centerY: number, zoom: number): AccentMap {
        let map : AccentMap = new AccentMap(targetDOMId);
        map.setCenter(centerX, centerY);
        map.setZoom(zoom);
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
     * @param {Number} x - x coordinate
     * @param {Number} y - y coordinate
     * @param {String} crs - coordinates' CRS. Defaults to "EPSG:3857" (WGS 84 / Pseudo-Mercator)
     */
    public static setCenter(map: AccentMap, x: number, y: number, crs = "EPSG:3857"): void {
        map.setCenter(x, y, crs);
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
     * @return {Regime} map regme
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
     * Creates new layer
     *
     * @function createLayer
     * @memberof MapManager
       @static
     * @param {LayerType} type - layer type
     * @param {object} opts - options
     * @return {LayerInterface} - layer
     */
    public static createLayer(type: LayerType, opts?: object): LayerInterface {
        let builder : LayerBuilder;
        switch (type) {
            case LayerType.Vector:
                builder = new LayerBuilder(new VectorLayer());
                builder.setSource(SourceType.Vector);                
                break;
            default:
                break;
        }
        if (typeof builder !== "undefined" && typeof opts !== "undefined") {
            if (opts.hasOwnProperty("url")) {
                builder.setUrl(opts["url"]["baseUrl"], opts["url"]["params"]);
            }

            if (opts.hasOwnProperty("style")) {
                builder.setStyle(opts["style"]);
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
     * @param {AccentMap} map - map instance
     * @param {ArrayBuffer|Document|Element|Object|string} features - features
     * @return {LayerInterface} - layer instance
     */
    public static createLayerFromFeatures(features: ArrayBuffer|Document|Element|Object|string, opts?: object): LayerInterface {
        let layer : LayerInterface = this.createLayer(LayerType.Vector, opts);
        layer.addFeatures(features);
        return layer;
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
}
