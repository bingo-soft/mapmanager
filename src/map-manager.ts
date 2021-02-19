import AccentMap from "./map"
import AccentLayer from "./layer"
import LayerType from "./layer-type"

/** @class MapManager */
export default class MapManager { 

    /**
     * Creates OpenLayers map object and controls.
     *
     * @function createMap
     * @memberof MapManager
     * @param {String} targetDOMId - id of target DOM element
     * @return {AccentMap} - map instance
     */
    public static createMap(targetDOMId: string): AccentMap {
        return new AccentMap(targetDOMId);
    }

    /**
    * Sets center of the map. Notice: in case of degree-based CRS x is longitude, y is latitude.
    *
    * @function setCenter
    * @memberof MapManager
    * @param {AccentMap} map - map instance
    * @param {Number} x - x coordinate
    * @param {Number} y - y coordinate
    * @return {Boolean} true on success, false otherwise
    */
    public static setCenter(map: AccentMap, x: number, y: number): void {
        map.setCenter(x, y);
    }


    /**
    * Sets zoom of the map.
    *
    * @function setZoom
    * @memberof MapManager
    * @param {AccentMap} map - map instance
    * @param {Number} zoom - zoom value
    */
    public static setZoom(map: AccentMap, zoom: number): void {
        map.setZoom(zoom);
    }

    /**
     * Creates new layer
     *
     * @function addLayer
     * @memberof MapManager
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
     * @param {AccentMap} map - map instance
     * @param {ArrayBuffer|Document|Element|Object|string} features - features
     */
    public static createLayerFromFeatures(map: AccentMap, features: ArrayBuffer|Document|Element|Object|string): AccentLayer {
        return map.createLayerFromFeatures(features);
    }

    /**
     * Sets map interaction regime
     *
     * @function setRegime
     * @memberof MapManager
     * @param {AccentMap} map - map instance
     * @param {AccentLayer} layer - layer instance
     * @param {string} featureType - feature type
     * @param {Function} callback - callback
     */
    public static setDrawRegime(map: AccentMap, layer: AccentLayer, featureType: string, callback: Function = () => {}): void {
        map.setDrawRegime(layer, featureType, callback);
    }
}
