import AccentMap from "./map"
import AccentLayer from "./layer"
import LayerType from "./layer-type"
import Regime from "./regime"


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
    public static createMap(targetDOMId: string): AccentMap {
        return new AccentMap(targetDOMId);
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
     * Creates new layer
     *
     * @function createLayer
     * @memberof MapManager
       @static
     * @param {AccentMap} map - map instance
     * @param {LayerType} type - layer type
     * @return {AccentLayer} - layer
     */
    public static createLayer(map: AccentMap, type: LayerType): AccentLayer {
        return map.createLayer(type);
    }

    /**
     * Adds layer to the map.
     *
     * @function addLayer
     * @memberof MapManager
     * @static
     * @param {AccentMap} map - map instance
     * @param {AccentLayer} layer - layer instance
     */
    public static addLayer(map: AccentMap, layer: AccentLayer): void {
        map.addLayer(layer);
    }

    /**
     * Creates layer from features
     *
     * @function createLayerFromFeatures
     * @memberof MapManager
     * @static
     * @param {AccentMap} map - map instance
     * @param {ArrayBuffer|Document|Element|Object|string} features - features
     * @return {AccentLayer} layer instance
     */
    public static createLayerFromFeatures(map: AccentMap, features: ArrayBuffer|Document|Element|Object|string): AccentLayer {
        return map.createLayerFromFeatures(features);
    }

    /**
     * Gets features of the layer as GeoJSON
     *
     * @function getFeaturesAsGeoJSON
     * @memberof MapManager
     * @static
     * @param {AccentLayer} layer - layer instance
     * @return {String} GeoJSON
     */
    public static getFeaturesAsGeoJSON(layer: AccentLayer): string {
        return layer.getFeaturesAsGeoJSON();
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
     * Sets map draw regime
     *
     * @function setDrawRegime
     * @memberof MapManager
     * @static
     * @param {AccentMap} map - map instance
     * @param {AccentLayer} layer - layer instance
     * @param {String} geometryType - feature type
     * @param {Function} callback - callback
     */
    public static setDrawRegime(map: AccentMap, layer: AccentLayer, geometryType: string/* , callback: (geoJSON: string) => void */): void {
        map.setDrawRegime(layer, geometryType/* , callback */);
    }
}
