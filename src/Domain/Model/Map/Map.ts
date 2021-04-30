import "ol-ext/dist/ol-ext.css";
import "ol/ol.css";
import OlMap from "ol/Map";
import OlView from "ol/View";
import { Extent as OlExtent } from "ol/extent";
import { OverviewMap as OlOverviewMap, defaults as OlDefaultControls } from "ol/control";
import OlSource from "ol/source/Source";
import OlVectorSource from "ol/source/Vector";
import OlTileSource from "ol/source/Tile";
import { OSM as OlOSM, Source } from "ol/source";
import { Tile as OlTileLayer } from "ol/layer";
import * as OlCoordinate from "ol/coordinate";
import * as OlProj from "ol/proj";
import OlInteraction from "ol/interaction/Interaction";
import OlOverlay from "ol/Overlay";
import OlOverlayPositioning from "ol/OverlayPositioning"
import OlVectorLayer from "ol/layer/Vector";
import OlFeature from "ol/Feature";
//import OlGeoJSON from "ol/format/GeoJSON";
import LayerInterface from "../Layer/LayerInterface"
import BaseLayer from "./BaseLayer";
import InteractionType from "../Interaction/InteractionType";
import SourceType from "../Source/SourceType";
import Feature from "../Feature/Feature";
import FeatureCollection from "../Feature/FeatureCollection";
import InteractionInterface from "../Interaction/InteractionInterface";
import NormalInteraction from "../Interaction/Impl/NormalInteraction";
import DrawInteraction from "../Interaction/Impl/DrawInteraction";
import ZoomInteraction from "../Interaction/Impl/ZoomInteraction";
import ZoomType from "../Interaction/Impl/ZoomType";
import SelectInteraction from "../Interaction/Impl/SelectInteraction";
import SelectionType from "../Interaction/Impl/SelectionType";
import InteractionNotSupported from "../../Exception/InteractionNotSupported";
import EventHandlerCollection from "../EventHandlerCollection/EventHandlerCollection";
import ModifyInteraction from "../Interaction/Impl/ModifyInteraction";
import TransformInteraction from "../Interaction/Impl/TransformInteraction";
import { DrawCallbackFunction, ModifyCallbackFunction, SelectCallbackFunction, TransformCallbackFunction } from "../Interaction/InteractionCallbackType";
/* import Projection from "ol/proj/Projection";  */


/** @class Map */
export default class Map { 
    private map: OlMap;
    private activeLayer: LayerInterface;
    //private visibleLayers: OlCollection<string> = new OlCollection();
    private interaction: InteractionInterface;
    private interactions: InteractionInterface[] = [];
    //private eventHandlers: EventHandlerCollection;

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
        //this.eventHandlers = new EventHandlerCollection(this.map);
        this.setNormalInteraction();

    }

    /**
     * Returnas OpMap map instance
     *
     * @function getMap
     * @memberof Map
     */
    public getMap(): OlMap {
        return this.map;
    }

    /* public getEventHandlers(): EventHandlerCollection {
        return this.eventHandlers;
    } */

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

    public getInteraction(): InteractionInterface {
        return this.interaction;
    }

    public getInteractionType(): InteractionType {
        return this.interaction.getType();
    }
    
    /**
     * Sets map normal interaction
     *
     * @function setNormalInteractionType
     * @memberof Map
     */
    public setNormalInteraction(): void {
        this.clearInteractions(); 
        this.interaction = new NormalInteraction();
    }

    /**
     * Sets map draw interaction
     *
     * @function setInteractionType
     * @memberof Map
     * @param {LayerInterface} layer - layer instance
     * @param {string} geometryType - feature type
     * @param {Function} callback - callback
     */
    public setDrawInteraction(layer: LayerInterface, geometryType: string, callback?: DrawCallbackFunction): void {
        if (layer.getType() != SourceType.Vector) {
            throw new InteractionNotSupported(InteractionType.Draw);
        }
        this.clearInteractions();
        this.interaction = new DrawInteraction(layer, geometryType, callback);
        this.addInteraction(this.interaction);        
    }

    /**
     * Sets map zoom interaction
     *
     * @function setZoomInteraction
     * @memberof Map
     * @param {string} type - zoom type
     */
    public setZoomInteraction(type: ZoomType): void {
        this.clearInteractions(); 
        this.interaction = new ZoomInteraction(type, this);
        this.addInteraction(this.interaction);        
    }
    
    /**
     * Sets selection interaction
     *
     * @function setSelectionInteractionType
     * @memberof Map
     */
    public setSelectInteraction(type: SelectionType, layers: LayerInterface[], callback?: SelectCallbackFunction): void {
        if (layers) {
            layers.forEach((layer: LayerInterface) => {
                if (layer.getType() != SourceType.Vector) {
                    throw new InteractionNotSupported(InteractionType.Select);
                }
            });
        }
        this.clearInteractions();
        this.interaction = new SelectInteraction(type, this, layers, callback);
        this.addInteraction(this.interaction);  
    }

    /**
     * Sets modify interaction
     *
     * @function setModifyInteraction
     * @memberof Map
     */
    public setModifyInteraction(features: FeatureCollection, callback?: ModifyCallbackFunction): void {
        this.clearModifyAndTransformInteractions();
        this.interaction = new ModifyInteraction(features, callback);
        this.addInteraction(this.interaction);  
    }

    /**
     * Sets transform interaction
     *
     * @function setTransformInteraction
     * @memberof Map
     */
     public setTransformInteraction(/* features: FeatureCollection,  */callback?: TransformCallbackFunction): void {
        this.clearModifyAndTransformInteractions();
        this.interaction = new TransformInteraction(/* features,  */callback);
        this.addInteraction(this.interaction);  
    }

    /**
     * Clears modify interactions
     *
     * @function clearModifyInteractions
     * @memberof Map
     */
     public clearModifyAndTransformInteractions(): void {
        this.clearInteractions(InteractionType.Modify);
        this.clearInteractions(InteractionType.Transform);
    }
 
    private addInteraction(interaction: InteractionInterface/* , addToOlMap: boolean = true */): void {
        const olInteraction: OlInteraction = interaction.getInteraction();
        if (typeof olInteraction !== "undefined") {
            this.map.addInteraction(interaction.getInteraction());
        }
        this.interactions.push(interaction);
    }

    /**
     * Clears interactions
     *
     * @function clearInteractions
     * @param {String} - type of interaction to clear, all if not set
     * @memberof Map
     */ 
    public clearInteractions(type?: InteractionType): void {
        for (const i in this.interactions) { 
            const interaction: InteractionInterface = this.interactions[i];
            if ((typeof type !== "undefined" && interaction.getType() == type) || typeof type === "undefined") {
                const interactionHandlers: EventHandlerCollection = interaction.getEventHandlers();
                if (interactionHandlers) {
                    interactionHandlers.clear();
                }
                this.map.removeInteraction(interaction.getInteraction());
           }
        }
       if (typeof type !=="undefined") {
            this.interactions = this.interactions.filter((interaction: InteractionInterface) => interaction.getType() !== type);
        } else {
            this.interactions = [];
        }
    }

    /* public editFeatures(type: SelectionType, layers: LayerInterface[], features: FeatureCollection, callback?: (feature: FeatureCollection) => void): void {
        this.setSelectInteraction(type, layers);
        this.setModifyInteraction(features, callback)
    } */

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
     * Removes features from map
     *
     * @function removeFeatures
     * @memberof Map
     * @param {Object} features - features to remove
     */
    public removeFeatures(features: FeatureCollection): void {
        features.forEach((feature: Feature): void => {
            const source: OlVectorSource = <OlVectorSource> feature.getLayer().getSource();
            source.removeFeature(feature.getFeature());
        });
    }

    /**
     * Fits map to extent
     *
     * @function fitExtent
     * @memberof Map
     * @param {Array} extent - extent to fit to
     */
    public fitExtent(extent: number[]): void {
        this.map.getView().fit(<OlExtent> extent);
    }

    /**
     * Fits map to all layer's features extent
     *
     * @function fitLayer
     * @memberof Map
     * @param {LayerInterface} layer - layer instance
     */
    public fitLayer(layer: LayerInterface, zoom?: number): void {
        const extent: OlExtent = (<OlVectorSource>layer.getSource()).getExtent();
        if (extent[0] !== Infinity && extent[1] !== Infinity && extent[2] !== -Infinity && extent[3] !== -Infinity) {
            const view: OlView = this.map.getView();
            view.fit(extent);
            if (typeof zoom !== "undefined") {
                view.setZoom(zoom);
            }
        }
    }

    /**
     * Creates an overlay and adds it to map
     *
     * @function createOverlay
     * @memberof Map
     * @param {Object} element - element to create overlay upon
     * @param {Array} position - the overlay position in map projection
     * @param {Array} offset - offset in pixels used when positioning the overlay 
     */
    public createOverlay(element: HTMLElement, position: number[], offset: number[]): void {
        const overlay: OlOverlay = new OlOverlay({
            element: element,
            offset: offset,
            position: position,
            positioning: OlOverlayPositioning.BOTTOM_CENTER
        });
        this.map.addOverlay(overlay);
    }

    
}