//import "ol-ext/dist/ol-ext.css";
import "ol/ol.css";
import OlMap from "ol/Map";
import OlView from "ol/View";
import { Extent as OlExtent } from "ol/extent";
import { OverviewMap as OlOverviewMap, defaults as OlDefaultControls } from "ol/control";
import OlVectorSource from "ol/source/Vector";
import OlTileSource from "ol/source/Tile";
import { OSM as OlOSM } from "ol/source";
import { Tile as OlTileLayer } from "ol/layer";
import OlGeometry from "ol/geom/Geometry";
import OlBaseEvent from "ol/events/Event";
import { GeometryCollection } from "ol/geom";
import * as OlCoordinate from "ol/coordinate";
import * as OlProj from "ol/proj";
import OlInteraction from "ol/interaction/Interaction";
import OlOverlay from "ol/Overlay";
import OlOverlayPositioning from "ol/OverlayPositioning"
import { MapBrowserEvent as OlMapBrowserEvent } from "ol";
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
import MethodNotImplemented from "../../Exception/MethodNotImplemented";
import InteractionNotSupported from "../../Exception/InteractionNotSupported";
import EventHandlerCollection from "../EventHandlerCollection/EventHandlerCollection";
import ModifyInteraction from "../Interaction/Impl/ModifyInteraction";
import TransformInteraction from "../Interaction/Impl/TransformInteraction";
import { DrawCallbackFunction, ModifyCallbackFunction, SelectCallbackFunction, TransformCallbackFunction } from "../Interaction/InteractionCallbackType";
import EventType from "../EventHandlerCollection/EventType";
import CursorType from "./CursorType";

import CursorZoomInUrl from "../../../assets/cursor-zoom-in.svg"
import CursorZoomOutUrl from "../../../assets/cursor-zoom-out.svg"
import CursorAttributeByAreaUrl from "../../../assets/cursor-attribute-by-area.svg"
import CursorAttributeByClickUrl from "../../../assets/cursor-attribute-by-click.svg"
import CursorSelectByAreaUrl from "../../../assets/cursor-select-by-area.svg"
import CursorSelectByClickUrl from "../../../assets/cursor-select-by-click.svg"
import CursoSelectMultipleFeaturesUrl from "../../../assets/cursor-select-multiple-features.svg"
import CursorSelectOnMultipleLayersUrl from "../../../assets/cursor-select-on-multiple-layers.svg"



/** @class Map */
export default class Map { 
    private map: OlMap;
    private projection: string;
    private cursor: string;
    private activeLayer: LayerInterface;
    private selectedFeatures: FeatureCollection;
    private interaction: InteractionInterface;
    private interactions: InteractionInterface[] = [];
    private eventHandlers: EventHandlerCollection; 

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
        this.projection = "EPSG:" + srsId;
        this.map = new OlMap({
            controls: OlDefaultControls().extend([overviewMapControl]),
            layers: [
                new OlTileLayer({
                    source: source
                })
            ],
            target: targetDOMId,
            view: new OlView({
                projection: this.projection,
                center: center,
                zoom: zoom
            })
        });
        this.cursor = CursorType.Default;
        this.setNormalInteraction();
        this.selectedFeatures = new FeatureCollection([], "EPSG:" + srsId);
        this.eventHandlers = new EventHandlerCollection(this.map);
        this.eventHandlers.add(EventType.Click, "MapClickEventHandler", (e: OlBaseEvent): void => {
            if (!this.map.hasFeatureAtPixel((<OlMapBrowserEvent>e).pixel)) {
                this.clearSelectedFeatures();
            }
        });
        this.eventHandlers.add(EventType.PointerMove, "MapPointerMoveEventHandler", (e: OlBaseEvent): void => {
            this.map.getViewport().style.cursor = this.map.hasFeatureAtPixel((<OlMapBrowserEvent>e).pixel) ? CursorType.Pointer : this.cursor;
        });
    }

    /**
     * Returns Openlayers map instance
     *
     * @function getMap
     * @memberof Map
     * @return {Object} Openlayers map instance
     */
    public getMap(): OlMap {
        return this.map;
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
     * Sets cursor of the map.
     *
     * @function setCursor
     * @memberof Map
     * @param {String} cursor - cursor type
     */ 
    public setCursor(cursor: CursorType): void {
        let realCursor: string = cursor;
        switch (cursor) {
            case CursorType.ZoomIn:
                realCursor = "url(" + CursorZoomInUrl + "), auto";
                break;
            case CursorType.ZoomOut:
                realCursor = "url(" + CursorZoomOutUrl + "), auto";
                break;
            case CursorType.AttributeByArea:
                realCursor = "url(" + CursorAttributeByAreaUrl + "), auto";
                break;
            case CursorType.AttributeByClick:
                realCursor = "url(" + CursorAttributeByClickUrl + "), auto";
                break;
            case CursorType.SelectByArea:
                realCursor = "url(" + CursorSelectByAreaUrl + "), auto";
                break;
            case CursorType.SelectByClick:
                realCursor = "url(" + CursorSelectByClickUrl + "), auto";
                break;
            case CursorType.SelectMultipleFeatures:
                realCursor = "url(" + CursoSelectMultipleFeaturesUrl + "), auto";
                break;
            case CursorType.SelectOnMultipleLayers:
                realCursor = "url(" + CursorSelectOnMultipleLayersUrl + "), auto";
                break;            
            default:
        }
        this.map.getViewport().style.cursor = realCursor;
        this.cursor = realCursor;
    }

    /**
     * Returns map's selected features
     *
     * @function getSelectedFeatures
     * @memberof Map
     * @return {Object} selected features
     */
    public getSelectedFeatures(): FeatureCollection {
        return this.selectedFeatures;
    }

    /**
     * Sets map's selected features
     *
     * @function setSelectedFeatures
     * @memberof Map
     * @param {Object} features - selected features
     */
    public setSelectedFeatures(features: FeatureCollection): void {
        this.selectedFeatures = features;
    }

    /**
     * Clears map's selected features
     *
     * @function clearSelectedFeatures
     * @memberof Map
     */
     public clearSelectedFeatures(): void {
        // TODO: deselect features physically ?
        this.selectedFeatures = null;
    }

    /**
     * Returns map current interaction instance
     *
     * @function getInteraction
     * @memberof Map
     * @return {Object} interaction instance
     */
    public getInteraction(): InteractionInterface {
        return this.interaction;
    }

    /**
     * Returns map current interaction type
     *
     * @function getInteractionType
     * @memberof Map
     * @return {String} interaction type
     */
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
     * @function setDrawInteraction
     * @memberof Map
     * @param {Object} layer - layer to draw on
     * @param {String} geometryType - type of geometry to draw
     * @param {Function} callback - callback function to call after geometry is drawn
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
     * @param {String} type - zoom type
     */
    public setZoomInteraction(type: ZoomType): void {
        this.clearInteractions(); 
        this.interaction = new ZoomInteraction(type, this);
        this.addInteraction(this.interaction);        
    }
    
    /**
     * Sets map selection interaction
     *
     * @function setSelectionInteractionType
     * @memberof Map
     * @param {String} type - selection type
     * @param {Array} layers - array of layers which selection applies to
     * @param {Function} callback - callback function to call after geometry is selected
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
     * Sets map modify interaction
     *
     * @function setModifyInteraction
     * @memberof Map
     * @param {Object} features - features to modify
     * @param {Function} callback - callback function to call after geometry is modified
     */
    public setModifyInteraction(features: FeatureCollection, callback?: ModifyCallbackFunction): void {
        this.clearModifyAndTransformInteractions();
        this.interaction = new ModifyInteraction(features, callback);
        this.addInteraction(this.interaction);  
    }

    /**
     * Sets map transform interaction
     *
     * @function setTransformInteraction
     * @memberof Map
     * @param {Function} callback - callback function to call after geometry is transformed
     */
     public setTransformInteraction(callback?: TransformCallbackFunction): void {
        this.clearModifyAndTransformInteractions();
        this.interaction = new TransformInteraction(callback);
        this.addInteraction(this.interaction);  
    }

    /**
     * Clears modify and transform interactions
     *
     * @function clearModifyAndTransformInteractions
     * @memberof Map
     */
     public clearModifyAndTransformInteractions(): void {
        this.clearInteractions(InteractionType.Modify);
        this.clearInteractions(InteractionType.Transform);
    }
 
    /**
     * Adds interaction
     *
     * @function addInteraction
     * @memberof Map
     * @param {Object} interaction - interaction to add
     */
    private addInteraction(interaction: InteractionInterface): void {
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
     * @param {String} type - type of interaction to clear, all if not set
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

    /**
     * Gets active layer
     *
     * @function getActiveLayer
     * @memberof Map
     * @return {Object} active layer instance
     */
    public getActiveLayer(): LayerInterface {
        return this.activeLayer;
    }

    /**
     * Sets active layer
     *
     * @function setActiveLayer
     * @memberof Map
     * @param {Object} layer - layer instance
     */
    public setActiveLayer(layer: LayerInterface): void {
        this.activeLayer = layer;
    }

    /**
     * Adds layer to the map.
     *
     * @function addLayer
     * @memberof Map
     * @param {Object} layer - layer instance
     */
    public addLayer(layer: LayerInterface): void {
        this.map.addLayer(layer.getLayer());
    }

    /**
     * Removes layer from the map.
     *
     * @function removeLayer
     * @memberof Map
     * @param {Object} layer - layer instance
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
     * Fits map to given extent
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
     * @param {Object} layer - layer instance
     * @param {Number} zoom - zoom to set after fit
     */
    public fitLayer(layer: LayerInterface, zoom?: number): void {
        if (layer.getType() != SourceType.Vector) {
            throw new MethodNotImplemented();
        }
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
     * Fits map to given features extent
     *
     * @function fitFeatures
     * @memberof Map
     * @param {Object} features - features
     * @param {Number} zoom - zoom to set after fit
     */
    public fitFeatures(features: FeatureCollection, zoom?: number): void {
         const geometries: OlGeometry[] = features.getFeatureGeometries();
         const gc: GeometryCollection = new GeometryCollection(geometries);
         const view: OlView = this.map.getView();
         view.fit(gc.getExtent());
         if (typeof zoom !== "undefined") {
            view.setZoom(zoom);
        }
    }

    /**
     * Creates an overlay and adds it to map
     *
     * @function createOverlay
     * @memberof Map
     * @param {Object} element - DOM element to create overlay upon
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

    /**
     * Returns map's event handlers
     *
     * @function getEventHandlers
     * @memberof Map
     * @return {Object} event handlers collection
     */
    public getEventHandlers(): EventHandlerCollection {
        return this.eventHandlers;
    }
    
    /**
     * Sets map's event handler
     *
     * @function setEventHandler
     * @memberof Map
     * @param {String} eventType - event type
     * @param {String} handlerName - handler id
     * @param {Function} callback - callback function to call when an event is triggered
     */
    public setEventHandler(eventType: EventType, handlerId: string, callback: (data: unknown) => void): void {
        this.eventHandlers.add(eventType, handlerId, callback);
    }

    /**
     * Returns coordinates from pixel in map projection
     *
     * @function getCoordinateFromPixel
     * @memberof Map
     * @param {Array} pixel - pixel coordinates
     * @return {Array} coordinates in map projection
     */
    public getCoordinateFromPixel(pixel: number[]): number[] {
        return this.map.getCoordinateFromPixel(pixel);
    }

    /**
     * Transforms coordinates from map projection to given one
     *
     * @function transformCoordinates
     * @memberof Map
     * @param {Array} coordinates - coordinates
     * @param {Number} srsId - SRS Id (e.g. 4326)
     * @return {Array} transformed coordinates
     */
    public transformCoordinates(coordinates: number[], srsId: number): number[] {
        return OlProj.transform(coordinates, this.projection, "EPSG:" + srsId);
    }
}