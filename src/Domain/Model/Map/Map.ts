import OlMap from "ol/Map"
import View from "ol/View"
import { Extent as olExtent } from "ol/extent"
import { OverviewMap, defaults as defaultControls } from "ol/control"
import TileSource from "ol/source/Tile";
import { OSM } from "ol/source"
import { Tile as TileLayer } from "ol/layer"
import * as Coordinate from "ol/coordinate"
import * as Proj from "ol/proj"
import Interaction from "ol/interaction/Interaction"
import LayerInterface from "../Layer/LayerInterface"
import Regime from "./Regime"
import Draw, { DrawEvent } from "ol/interaction/Draw"
import GeometryType from "ol/geom/GeometryType";
import VectorLayer from "ol/layer/Vector"
import GeoJSON from "ol/format/GeoJSON"
/* import Projection from "ol/proj/Projection"  */
import "ol-ext/dist/ol-ext.css"
import "ol/ol.css"
import SourceType from "../Source/SourceType"

/** @class Map */
export default class Map { 
    private map: OlMap;
    private activeLayer: LayerInterface;
    private regime: Regime = Regime.Normal;
    private interactions: Interaction[] = [];
    private lastInteraction: Interaction;    

    /**
     * @constructor
     * @memberof Map
     * @param {String} targetDOMId - id of target DOM element 
     */
    constructor(targetDOMId: string, opts?: unknown) {
        let baseLayer = "osm", 
            srsId = 3857,
            centerX = 0,
            centerY = 0,
            centerSRSId = 3857,
            zoom = 14;
        if (typeof opts != "undefined") {
            if (Object.prototype.hasOwnProperty.call(opts, "base_layer")) {
                baseLayer = opts["base_layer"];
            }
            if (Object.prototype.hasOwnProperty.call(opts, "declared_coordinate_system_id")) {
                srsId = opts["declared_coordinate_system_id"];
            }
            if (Object.prototype.hasOwnProperty.call(opts, "center")) {
                centerX = opts["center"]["x"];
                centerY = opts["center"]["y"];
                centerSRSId = opts["center"]["declared_coordinate_system_id"];
            }
            if (Object.prototype.hasOwnProperty.call(opts, "zoom")) {
                zoom = opts["zoom"];
            }
        }
        let center: Coordinate.Coordinate = [centerX, centerY];
        if (centerSRSId != srsId) {
            center = Proj.transform(center, "EPSG:" + centerSRSId, "EPSG:" + srsId);
        }
        let source: TileSource = null;
        if (baseLayer == "osm") {
             source = new OSM();
        } /* else if (...) {
            TODO
        } */
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
                projection: "EPSG:" + srsId,
                center: center,
                zoom: zoom
            })
        });
    }

    /**
     * Updates map size
     *
     * @function updateSize
     * @memberof Map
     */
    public updateSize(): void {
        this.map.updateSize();
    }

    /**
     * Gets current regime.
     *
     * @function getRegime
     * @memberof Map
     * @return {Regime} current regime
     */
    public getRegime(): Regime {
        return this.regime;
    }

    /**
     * Sets center of the map. Notice: in case of degree-based CRS x is longitude, y is latitude.
     *
     * @function setCenter
     * @memberof Map
     * @param {Object} opts - options
     */
    public setCenter(opts?: unknown): void {
        let centerX = 0,
            centerY = 0,
            centerSRSId = 3857;
        if (typeof opts != "undefined") {
            if (Object.prototype.hasOwnProperty.call(opts, "x")) {
                centerX = opts["x"];
            }
            if (Object.prototype.hasOwnProperty.call(opts, "y")) {
                centerY = opts["y"];
            }
            if (Object.prototype.hasOwnProperty.call(opts, "declared_coordinate_system_id")) {
                centerSRSId = opts["declared_coordinate_system_id"];
            }
        }
        const mapProj: string = this.map.getView().getProjection().getCode();
        let coordinate: Coordinate.Coordinate = [centerX, centerY];
        if (mapProj != "EPSG:" + centerSRSId) {
            coordinate = Proj.transform(coordinate, "EPSG:" + centerSRSId, mapProj);
        }
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
     * Sets map draw regime
     *
     * @function setRegime
     * @memberof Map
     * @param {LayerInterface} layer - layer instance
     * @param {string} geometryType - feature type
     * @param {Function} callback - callback
     */
    public setDrawRegime(layer: LayerInterface, geometryType: string, callback: (geoJSON: string) => void): void {
        if (layer.getType() != SourceType.Vector) {
            return;
        }
        /* const proj: Projection = layer.getSource().getProjection();
        console.log(proj); */
        this.clearInteractions();
        this.regime = Regime.Draw;
        const draw: Draw = new Draw({
            source: (<VectorLayer>layer.getLayer()).getSource(),
            type: <GeometryType>geometryType,
        });
        draw.on("drawend", (e: DrawEvent) => {
            callback(new GeoJSON().writeFeature(e.feature));
        });
        this.map.addInteraction(draw);
        this.interactions.push(draw);
        this.lastInteraction = draw;
    }
    
    /**
     * Sets map normal regime
     *
     * @function setNormalRegime
     * @memberof Map
     */
    public setNormalRegime(): void {
        this.clearInteractions();
        this.regime = Regime.Normal;
    }

    /**
     * Clears all interactions
     *
     * @function clearInteractions
     * @memberof Map
     */
    private clearInteractions(): void {
        for (const i in this.interactions) {
            this.map.removeInteraction(this.interactions[i]);
        }
    }

    /**
     * Gets active layer
     *
     * @function getActiveLayer
     * @memberof Map
     * @return {LayerInterface} active layer instance
     */
    public getActiveLayer(): LayerInterface {
        return this.activeLayer;
    }

    /**
     * Sets active layer
     *
     * @function setActiveLayer
     * @memberof Map
     * @param {LayerInterface} layer layer instance
     */
    public setActiveLayer(layer: LayerInterface): void {
        this.activeLayer = layer;
    }

    /**
     * Adds layer to the map.
     *
     * @function addLayer
     * @memberof Map
     * @param {LayerInterface} layer - layer instance
     */
    public addLayer(layer: LayerInterface): void {
        this.map.addLayer(layer.getLayer());
    }

    /**
     * Removes layer from the map.
     *
     * @function removeLayer
     * @memberof Map
     * @param {LayerInterface} layer - layer instance
     */
    public removeLayer(layer: LayerInterface): void {
        this.map.removeLayer(layer.getLayer());
    }

    /**
     * Fits map to extent
     *
     * @function fitExtent
     * @memberof Map
     * @param {Extent} extent - extent to fit to
     */
    public fitExtent(extent: olExtent): void {
        this.map.getView().fit(extent);
    }

    /**
     * Fits map to all layer's features extent
     *
     * @function fitLayer
     * @memberof Map
     * @param {LayerInterface} layer - layer instance
     */
    public fitLayer(layer: LayerInterface): void {
        const extent = layer.getSource().getExtent();
        if (extent[0] !== Infinity && extent[1] !== Infinity && extent[2] !== -Infinity && extent[3] !== -Infinity) {
            this.map.getView().fit(extent);
        }
    }
}