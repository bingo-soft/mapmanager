import OlMap from "ol/Map"
import View from "ol/View"
import { OverviewMap, defaults as defaultControls } from 'ol/control'
import { OSM } from "ol/source"
import { Tile as TileLayer } from "ol/layer"
import * as Coordinate from "ol/coordinate"
import * as Proj from "ol/proj"
import Interaction from "ol/interaction/Interaction"
import { mapCenterX, mapCenterY, mapZoom, geomStyles } from "./config"
import AccentLayer from "./layer"
import LayerType from "./layer-type"
import Regime from "./regime"
import Draw from "ol/interaction/Draw"
import GeometryType from "ol/geom/GeometryType";
import "ol-ext/dist/ol-ext.css"
import "ol/ol.css"

export default class Map { 
    private map: OlMap;
    private regime: Regime = Regime.None;
    private interactions: Interaction[];
    private lastInteraction: Interaction;    

    constructor(targetDOMId: string) {
        const source: OSM = new OSM();
        const overviewMapControl: OverviewMap = new OverviewMap({
            layers: [
                new TileLayer({
                    source: source,
                })
            ],
        });
        this.map = new OlMap({
            controls: defaultControls().extend([overviewMapControl]),
            layers: [
                new TileLayer({
                    source: source
                })
            ],
            target: targetDOMId,
            view: new View({
                center: [mapCenterX, mapCenterY],
                zoom: mapZoom
            })
        });
    }

    /**
     * Sets center of the map. Notice: in case of degree-based CRS x is longitude, y is latitude.
     *
     * @function setCenter
     * @memberof Map
     * @param {Number} x - x coordinate
     * @param {Number} y - y coordinate
     * @param {String} crs - coordinates' CRS. Defaults to "EPSG:3857" (WGS 84 / Pseudo-Mercator)
     */
    public setCenter(x: number, y: number, crs = "EPSG:3857"): void {
        let coordinate: Coordinate.Coordinate = [x, y];
        coordinate = Proj.transform(coordinate, crs, "EPSG:3857");
        this.map.getView().setCenter(coordinate);
    }

    /**
     * Sets zoom of the map.
     *
     * @function setZoom
     * @memberof Map
     * @param {Number} zoom - zoom value
     */
    public setZoom(zoom: number): void {
        this.map.getView().setZoom(zoom);
    }

    /**
     * Creates new layer
     *
     * @function createLayer
     * @memberof Map
     * @param {LayerType} type - layer type
     * @return {AccentLayer} - layer
     */
    public createLayer(type: LayerType): AccentLayer {
        return new AccentLayer(type);
    }

    /**
     * Adds layer to the map.
     *
     * @function addLayer
     * @memberof Map
     * @param {AccentLayer} layer - layer instance
     */
    public addLayer(layer: AccentLayer): void {
        this.map.addLayer(layer.getLayer());
    }

    /**
     * Creates layer from features
     *
     * @function createLayerFromFeatures
     * @memberof Map
     * @param {ArrayBuffer|Document|Element|Object|string} features - features
     */
    public createLayerFromFeatures(features: ArrayBuffer|Document|Element|Object|string): AccentLayer {
        let layer: AccentLayer = this.createLayer(LayerType.Vector);
        layer.addFeatures(features);
        this.addLayer(layer);        
        return layer;
    }

    /**
     * Sets map interaction regime
     *
     * @function setRegime
     * @memberof Map
     * @param {AccentLayer} layer - layer instance
     * @param {string} featureType - feature type
     * @param {Function} callback - callback
     */
    public setDrawRegime(layer: AccentLayer, featureType: string, callback: Function): void {
        this.clearInteractions();
        this.regime = Regime.Draw;
        const draw: Draw = new Draw({
            source: layer.getLayer().getSource(),
            type: <GeometryType>featureType,
        });
        draw.on("drawend", (e) => {
            callback(e.feature);
        });
        this.map.addInteraction(draw);
        this.interactions.push(draw);
        this.lastInteraction = draw;
    }

    /**
     * Clears all interactions
     *
     * @function clearInteractions
     * @memberof Map
     */
    private clearInteractions(): void {
        for (let i in this.interactions) {
            this.map.removeInteraction(this.interactions[i]);
        }
    }
}