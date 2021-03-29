import "ol-ext/dist/ol-ext.css";
import "ol/ol.css";
import OlMap from "ol/Map";
import OlView from "ol/View";
import { Extent as OlExtent } from "ol/extent";
import { OverviewMap as OlOverviewMap, defaults as OlDefaultControls } from "ol/control";
import OlVectorSource, { VectorSourceEvent as OlVectorSourceEvent} from "ol/source/Vector";
import OlTileSource from "ol/source/Tile";
import { OSM as OlOSM } from "ol/source";
import { Tile as OlTileLayer } from "ol/layer";
import * as OlCoordinate from "ol/coordinate";
import * as OlProj from "ol/proj";
import OlInteraction from "ol/interaction/Interaction";
import OlDraw, { DrawEvent as OlDrawEvent } from "ol/interaction/Draw";
import OlGeometryType from "ol/geom/GeometryType";
import OlVectorLayer from "ol/layer/Vector";
import OlFeature from "ol/Feature";
//import OlGeoJSON from "ol/format/GeoJSON";
import OlCollection from 'ol/Collection';
import { MapBrowserEvent as OlMapBrowserEvent } from "ol";
import { EventsKey as OlEventsKey } from "ol/events";
import LayerInterface from "../Layer/LayerInterface"
import BaseLayer from "./BaseLayer";
import Regime from "./Regime";
import SourceType from "../Source/SourceType";
import Feature from "../Feature/Feature";
import FeatureCollection from "../Feature/FeatureCollection";
/* import Projection from "ol/proj/Projection";  */


/** @class Map */
export default class Map { 
    private map: OlMap;
    private activeLayer: LayerInterface;
    //private visibleLayers: OlCollection<string> = new OlCollection();
    private regime: Regime = Regime.Normal;
    private interactions: OlInteraction[] = [];
    private lastInteraction: OlInteraction;    

    private static readonly BASE_LAYER = BaseLayer.OSM;
    private static readonly SRS_ID = 3857;
    private static readonly CENTER_X = 0;
    private static readonly CENTER_Y = 0;
    private static readonly ZOOM = 14;

    /**
     * @constructor
     * @memberof Map
     * @param {String} targetDOMId - id of target DOM element 
     * @param {Object} opts - options 
     */
    constructor(targetDOMId: string, opts?: unknown) {
        let baseLayer = Map.BASE_LAYER, 
            srsId = Map.SRS_ID,
            centerX = Map.CENTER_X,
            centerY = Map.CENTER_Y,
            centerSRSId = Map.SRS_ID,
            zoom = Map.ZOOM;
        if (typeof opts !== "undefined") {
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
        let center: OlCoordinate.Coordinate = [centerX, centerY];
        if (centerSRSId != srsId) {
            center = OlProj.transform(center, "EPSG:" + centerSRSId, "EPSG:" + srsId);
        }
        let source: OlTileSource = null;
        if (baseLayer == BaseLayer.OSM) {
             source = new OlOSM();
        } /* else if (...) {
            TODO
        } */
        const overviewMapControl: OlOverviewMap = new OlOverviewMap({
            layers: [
                new OlTileLayer({
                    source: source,
                })
            ],
        });
        this.map = new OlMap({
            controls: OlDefaultControls().extend([overviewMapControl]),
            layers: [
                new OlTileLayer({
                    source: source
                })
            ],
            target: targetDOMId,
            view: new OlView({
                projection: "EPSG:" + srsId,
                center: center,
                zoom: zoom
            })
        });
        this.map.on("click", ((e: OlMapBrowserEvent): void => {
            const fc: FeatureCollection = this.pin(e);
            if (Object.prototype.hasOwnProperty.call(opts, "select_callback") && typeof opts["select_callback"] === "function") {
                opts["select_callback"](fc);
            }
        }));
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
        let centerX = Map.CENTER_X,
            centerY = Map.CENTER_Y,
            centerSRSId = Map.SRS_ID;
        if (typeof opts !== "undefined") {
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
        let coordinate: OlCoordinate.Coordinate = [centerX, centerY];
        if (mapProj != "EPSG:" + centerSRSId) {
            coordinate = OlProj.transform(coordinate, "EPSG:" + centerSRSId, mapProj);
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
    public setDrawRegime(layer: LayerInterface, geometryType: string, callback: (feature: Feature) => void): void {
        if (layer.getType() != SourceType.Vector) {
            return;
        }
        /* const proj: Projection = layer.getSource().getProjection().getCode();
        console.log(proj); */
        this.clearInteractions();
        this.regime = Regime.Draw;
        const source = (<OlVectorLayer>layer.getLayer()).getSource();
        const draw: OlDraw = new OlDraw({
            source: source,
            features: new OlCollection(),
            type: <OlGeometryType>geometryType,
        });
        /* draw.on("drawend", (e: OlDrawEvent) => { console.log(new GeoJSON().writeFeature(e.feature));
            if (typeof callback === "function") {
                callback(new GeoJSON().writeFeature(e.feature));
            }
        }); */
        const listener: OlEventsKey = source.on("addfeature", (e: OlVectorSourceEvent) => { 
            if (typeof callback === "function") {
                /* callback(new GeoJSON().writeFeature(e.feature, {
                    dataProjection: layer.getSRS(),
                    featureProjection: "EPSG:3857"
                })); */
                callback(new Feature(e.feature));
                e.target.un("addfeature", listener);
            }
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
        //this.map.visibleLayers.set(layer.getLayer().getId(), layer);
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
    public fitExtent(extent: OlExtent): void {
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
        const extent = (<OlVectorSource>layer.getSource()).getExtent();
        if (extent[0] !== Infinity && extent[1] !== Infinity && extent[2] !== -Infinity && extent[3] !== -Infinity) {
            this.map.getView().fit(extent);
        }
    }

    /**
     * Returns FeatureCollection of features below clicked map point 
     *
     * @function pin
     * @memberof Map
     * @param {Object} point - clicked point on map
     * @return {Object} FeatureCollection 
     */     
     private pin(point: OlMapBrowserEvent): FeatureCollection {
        const featureArr: Feature[] = [];
        this.map.forEachFeatureAtPixel(point.pixel, (feature: OlFeature, layer: OlVectorLayer): void => {
            if (layer) {
                const accentFeature = new Feature(feature, layer);
                featureArr.push(accentFeature);
            }
        });
        return new FeatureCollection(featureArr, this.map.getView().getProjection().getCode());
    }
}