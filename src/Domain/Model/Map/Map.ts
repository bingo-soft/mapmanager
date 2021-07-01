//import "ol-ext/dist/ol-ext.css";
import "ol/ol.css";
import OlMap from "ol/Map";
import OlView from "ol/View";
import { Extent as OlExtent } from "ol/extent";
import { OverviewMap as OlOverviewMapControl, defaults as OlDefaultControls } from "ol/control";
import OlVectorLayer from "ol/layer/Vector";
import OlVectorSource from "ol/source/Vector";
import OlTileSource from "ol/source/Tile";
import { OSM as OlOSM } from "ol/source";
import { Layer as OlLayer, Tile as OlTileLayer } from "ol/layer";
import OlFeature from "ol/Feature";
import { Geometry as OlGeometry, Point as OlPoint } from "ol/geom"
import OlBaseEvent from "ol/events/Event";
import { GeometryCollection } from "ol/geom";
import * as OlCoordinate from "ol/coordinate";
import * as OlProj from "ol/proj";
import OlInteraction from "ol/interaction/Interaction";
import OlOverlay from "ol/Overlay";
import OlOverlayPositioning from "ol/OverlayPositioning"
import { MapBrowserEvent as OlMapBrowserEvent } from "ol";
import {Circle as OlCircleStyle, Fill as OlFill, Stroke as OlStroke, Style as OlStyle} from "ol/style";
import {Select as OlSelect} from 'ol/interaction';
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
import { DrawCallbackFunction, ModifyCallbackFunction, SelectCallbackFunction, TransformCallbackFunction/* , MeasureCallbackFunction */ } from "../Interaction/InteractionCallbackType";
import EventType from "../EventHandlerCollection/EventType";
import CursorType from "./CursorType";
import MeasureInteraction from "../Interaction/Impl/MeasureInteraction";
import MeasureType from "../Interaction/MeasureType";
import LayerBuilder from "../Layer/LayerBuilder";
import VectorLayer from "../Layer/Impl/VectorLayer";
import { METERS_PER_UNIT } from "ol/proj/Units";

/** @class Map */
export default class Map { 
    private map: OlMap;
    private srsId: number;
    private cursor: string;
    private layers: Set<LayerInterface> = new Set();
    private activeLayer: LayerInterface;
    private measureLayer: LayerInterface;
    private measureOverlays: OlOverlay[] = [];
    private vertexHighlightLayer: OlVectorLayer;
    private selectedFeatures: FeatureCollection;
    private selectedLayers: Set<LayerInterface> = new Set();
    private clipboard: unknown;
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
            center = OlProj.transform(center, "EPSG:" + centerSRSId.toString(), "EPSG:" + srsId.toString());
        }
        let source: OlTileSource = null;
        if (baseLayer == BaseLayer.OSM) {
             source = new OlOSM();
        } /* else if (...) {
            TODO
        } */
        const overviewMapControl: OlOverviewMapControl = new OlOverviewMapControl({
            layers: [
                new OlTileLayer({
                    source: source,
                })
            ],
        });
        this.srsId = srsId;
        this.map = new OlMap({
            controls: OlDefaultControls().extend([overviewMapControl]),
            layers: [
                new OlTileLayer({
                    source: source
                })
            ],
            target: targetDOMId,
            view: new OlView({
                projection: "EPSG:" + this.srsId.toString(),
                center: center,
                zoom: zoom
            })
        });
        this.cursor = CursorType.Default;
        this.setNormalInteraction();
        this.selectedFeatures = new FeatureCollection([]);
        this.clipboard = {
            "features": new FeatureCollection([]),
            "remove": false
        }
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
            coordinate = OlProj.transform(coordinate, "EPSG:" + centerSRSId.toString(), mapProj);
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
    public setCursor(cursor: string): void {
        this.map.getViewport().style.cursor = cursor;
        this.cursor = cursor;
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
        if (features) {
            this.selectedFeatures = features;
        } else {
            this.selectedFeatures = new FeatureCollection([]);
        }
    }

    /**
     * Returns map's dirty (containing added or modified features) layers
     *
     * @function getDirtyLayers
     * @memberof Map
     * @return {Array} dirty layers
     */
    public getDirtyLayers(): LayerInterface[] {
        const dirtyLayers: LayerInterface[] = [];
        Array.from(this.layers).forEach((layer: LayerInterface): void => {
            if (layer.getDirtyFeatures().getLength()) {
                dirtyLayers.push(layer);
            }
        });
        return dirtyLayers;
    }

    /**
     * Returns map's selected layers
     *
     * @function getSelectedLayers
     * @memberof Map
     * @return {Array} selected layers
     */
     public getSelectedLayers(): LayerInterface[] {
        return Array.from(this.selectedLayers);
    }

    /**
     * Sets map's selected layers
     *
     * @function setSelectedLayers
     * @memberof Map
     * @param {Object} layers - selected layers
     */
    public setSelectedLayers(layers: Set<OlLayer>): void {
        let mapLayers: LayerInterface[] = Array.from(this.layers);
        Array.from(layers).forEach((layer: OlLayer): void => {
            const filtered: LayerInterface[] = mapLayers.filter(mapLayer => mapLayer.getLayer() === layer);
            if (filtered.length) {
                this.selectedLayers.add(filtered[0]);
            }
        });
    }

    /**
     * Clears map's selected features
     *
     * @function clearSelectedFeatures
     * @memberof Map
     */
     public clearSelectedFeatures(): void {
        const type: InteractionType = this.interaction.getType();
        if (type != InteractionType.Select) {
            return;
        }
        // clear an ordinary select interaction's features 
        const olSelect: OlSelect = <OlSelect> this.interaction.getInteraction();
        if (olSelect && olSelect instanceof OlSelect) {
            olSelect.getFeatures().clear();
        }
        // if it's a DragBox interaction we must clear its highlighting select features
        const select: SelectInteraction = <SelectInteraction> this.interaction;
        if (select) {
            const highlightSelect = select.getHighlightSelect();
            if (highlightSelect) {
                highlightSelect.getFeatures().clear();
            }
        }
        this.selectedFeatures = new FeatureCollection([]);
        this.selectedLayers.clear();
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
     * @param {Boolean} multiple - flag indicating multiple selection
     * @param {Function} callback - callback function to call after geometry is selected
     */
    public setSelectInteraction(type: SelectionType, layers: LayerInterface[], multiple: boolean = false, callback?: SelectCallbackFunction): InteractionInterface {
        if (layers) {
            layers.forEach((layer: LayerInterface) => {
                if (layer.getType() != SourceType.Vector) {
                    throw new InteractionNotSupported(InteractionType.Select);
                }
            });
        }
        this.clearInteractions();
        this.interaction = new SelectInteraction(type, this, layers, multiple, callback);
        this.addInteraction(this.interaction);
        return this.interaction;
    }

    /**
     * Sets map modify interaction
     *
     * @function setModifyInteraction
     * @memberof Map
     * @param {Object} source - features to modify
     * @param {Function} callback - callback function to call after geometry is modified
     */
    public setModifyInteraction(source: LayerInterface | FeatureCollection, callback?: ModifyCallbackFunction): void {
        this.clearInteractions([InteractionType.Modify, InteractionType.Transform]);
        this.interaction = new ModifyInteraction(source, callback);
        this.addInteraction(this.interaction);  
    }

    /**
     * Sets map transform interaction
     *
     * @function setTransformInteraction
     * @memberof Map
     * @param {Object} source - target layer for interaction
     * @param {Function} callback - callback function after geometry is transformed
     */
     public setTransformInteraction(source: LayerInterface, callback?: TransformCallbackFunction): void {
        this.clearInteractions([InteractionType.Modify, InteractionType.Transform]);
        this.interaction = new TransformInteraction(source, callback);
        this.addInteraction(this.interaction);  
    }

    /**
     * Sets map transform interaction
     *
     * @function setMeasureInteraction
     * @memberof Map
     * @param {String} type - measure type
     * @param {Object} units - units
     */
     public setMeasureInteraction(type: MeasureType, units: unknown): void {
        this.clearInteractions();
        this.interaction = new MeasureInteraction(type, units, this);
        this.addInteraction(this.interaction);  
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
     * @param {Array} types - types of interaction to clear, all if not set
     * @memberof Map
     */ 
    public clearInteractions(types?: InteractionType[]): void {
        this.interactions.forEach((interaction: InteractionInterface): void => {
            if ((typeof types !== "undefined" && types.includes(interaction.getType())) || typeof types === "undefined") {
                const interactionHandlers: EventHandlerCollection = interaction.getEventHandlers();
                if (interactionHandlers) {
                    interactionHandlers.clear();
                }
                this.map.removeInteraction(interaction.getInteraction());
           }
        });
        if (typeof types !=="undefined") {
            types.forEach((type: InteractionType): void => {
                this.interactions = this.interactions.filter((interaction: InteractionInterface) => interaction.getType() !== type);
            });
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
    public getActiveLayer(): LayerInterface | null {
        return this.activeLayer;
    }

    /**
     * Sets active layer
     *
     * @function setActiveLayer
     * @memberof Map
     * @param {Object} layer - layer instance
     */
    public setActiveLayer(layer: LayerInterface | null): void {
        this.activeLayer = layer;
    }

    /**
     * Gets measure layer
     *
     * @function getMeasureLayer
     * @memberof Map
     * @return {Object} measure layer instance
     */
     public getMeasureLayer(): LayerInterface {
        return this.measureLayer;
    }

    /**
     * Sets measure layer
     *
     * @function setMeasureLayer
     * @memberof Map
     * @param {Object} layer - layer instance
     */
    public setMeasureLayer(layer: LayerInterface): void {
        this.measureLayer = layer;
    }

    /**
     * Adds layer to the map.
     *
     * @function addLayer
     * @memberof Map
     * @param {Object} layer - layer instance
     */
    public addLayer(layer: LayerInterface): void {
        if (layer) {
            this.map.addLayer(layer.getLayer());
            this.layers.add(layer);
        }
    }

    /**
     * Removes layer from the map.
     *
     * @function removeLayer
     * @memberof Map
     * @param {Object} layer - layer instance
     */
    public removeLayer(layer: LayerInterface): void {
        if (layer) {
            this.map.removeLayer(layer.getLayer());
            this.layers.delete(layer);
        }
    }

    /**
     * Returns map layers.
     *
     * @function getLayers
     * @memberof Map
     * @param {String} type - type
     * @return {Array} map layers
     */
    public getLayers(type?: SourceType): LayerInterface[] {
        return Array.from(this.layers).filter((layer: LayerInterface): boolean => {
            return ((type && layer.getType() == type) || !type);
        });
    }

    /**
     * Returns corresponding layer of LayerInterface type by OlLayer.
     *
     * @function getLayer
     * @memberof Map
     * @param {String} olLayer - OL layer instance
     * @return {Object} layer of LayerInterface type
     */
     public getLayer(olLayer: OlLayer): LayerInterface {
        const layers: LayerInterface[] = Array.from(this.layers).filter((layer: LayerInterface): boolean => {
            return layer.getLayer() == olLayer;
        });
        return layers[0];
    }

    /**
     * Adds features to map
     *
     * @function addFeatures
     * @memberof Map
     * @param {Object} layer - layer to add to
     * @param {Object} features - features to add
     */
    public addFeatures(layer: LayerInterface, features: FeatureCollection): void {
        if (features) {
            const source: OlVectorSource = <OlVectorSource> layer.getSource();
            features.forEach((feature: Feature): void => {
                source.addFeature(feature.getFeature());
                feature.setLayer(layer);
                feature.setDirty(true);
                layer.setDirtyFeatures(new FeatureCollection([feature]), true);
            });
        }
    }

    /**
     * Removes features from map
     *
     * @function removeFeatures
     * @memberof Map
     * @param {Object} features - features to remove
     */
    public removeFeatures(features: FeatureCollection): void {
        if (features) {
            features.forEach((feature: Feature): void => {
                const layer: LayerInterface = feature.getLayer(); 
                layer.setRemovedFeatures(feature);
                const source: OlVectorSource = <OlVectorSource> (layer.getLayer().getSource());
                source.removeFeature(feature.getFeature());
            });
            this.clearSelectedFeatures();
        }
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
        if (geometries.length) {
            view.fit(gc.getExtent());
        }
        if (typeof zoom !== "undefined") {
            view.setZoom(zoom);
        }
    }

    /**
     * Creates a measure layer and adds it to map
     *
     * @function createMeasureLayer
     * @memberof Map
     * @return {Object} measure layer instance 
     */
    public createMeasureLayer(): LayerInterface {
        if (!this.measureLayer) {
            const builder: LayerBuilder = new LayerBuilder(new VectorLayer());
            builder.setSource(SourceType.Vector);
            this.measureLayer = builder.build();
            this.addLayer(this.measureLayer);
        }
        return this.measureLayer;
    }

    /**
     * Clears measure layer
     *
     * @function clearMeasureLayer
     * @memberof Map
     */
     public clearMeasureLayer(): void {
        this.removeLayer(this.measureLayer);
        this.measureLayer = null;
    }

    /**
     * Creates a measure overlay and adds it to map
     *
     * @function createMeasureOverlay
     * @memberof Map
     * @param {Object} element - DOM element to create overlay upon
     * @param {Array} position - the overlay position in map projection
     * @param {Array} offset - offset in pixels used when positioning the overlay 
     */
    public createMeasureOverlay(element: HTMLElement, position: number[], offset: number[]): void {
        const overlay: OlOverlay = new OlOverlay({
            element: element,
            offset: offset,
            position: position,
            positioning: OlOverlayPositioning.BOTTOM_CENTER
        });
        this.map.addOverlay(overlay);
        this.measureOverlays.push(overlay);
    }

    /**
     * Clears measure overlays
     *
     * @function clearMeasureOverlays
     * @memberof Map
     */
    public clearMeasureOverlays(): void {
        this.measureOverlays.forEach((overlay: OlOverlay): void => {
            this.map.removeOverlay(overlay);
        });
        this.measureOverlays = [];
    }

    /**
     * Highlights vertex
     *
     * @function highlightVertex
     * @memberof Map
     * @param {Array} coordinate - coordinate
     * @param {Number} srsId - SRS Id of coordinate
     */
    public highlightVertex(coordinate: OlCoordinate.Coordinate, srsId: number): void {
        if (!this.vertexHighlightLayer) {
            this.vertexHighlightLayer = new OlVectorLayer({
                source: new OlVectorSource(),
                style: new OlStyle({
                    image: new OlCircleStyle({
                        radius: 3,
                        fill: new OlFill({
                            color: "magenta"
                        }),
                        stroke: new OlStroke({
                            color: "magenta",
                            width: 2
                        }),
                    }),
                })
            });
            this.vertexHighlightLayer.setMap(this.map);
        }
        const source: OlVectorSource = this.vertexHighlightLayer.getSource();
        source.clear();
        const feature: OlFeature = new OlFeature({
            geometry: new OlPoint(OlProj.transform(coordinate, "EPSG:" + srsId.toString(), "EPSG:" + this.srsId.toString()))
        });
        source.addFeature(feature);
    }

    /**
     * Clears vertex highlight
     *
     * @function clearVertexHighlight
     * @memberof Map
     */
    public clearVertexHighlight(): void {
        if (this.vertexHighlightLayer) {
            this.vertexHighlightLayer.setMap(null);
            this.vertexHighlightLayer = null;
        }
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
        return OlProj.transform(coordinates, "EPSG:" + this.srsId.toString(), "EPSG:" + srsId.toString());
    }

    /**
     * Copies features into clipboard
     *
     * @function copyToClipBoard
     * @memberof Map
     * @param {Object} features - features to copy
     */
    public copyToClipBoard(features: FeatureCollection): void {
        this.clipboard["features"] = features;
        this.clipboard["remove"] = false;
    }

    /**
     * Cuts features into clipboard
     *
     * @function cutToClipBoard
     * @memberof Map
     * @param {Object} features - features to copy
     */
     public cutToClipBoard(features: FeatureCollection): void {
        this.clipboard["features"] = features;
        this.clipboard["remove"] = true;
    }

    /**
     * Pastes features from clipboard
     *
     * @function pasteFromClipboard
     * @memberof Map
     * @param {Object} layer - layer instance to paste to
     */
    public pasteFromClipboard(layer: LayerInterface): void {
        if (this.clipboard["features"]) {
            if (this.clipboard["remove"]) {
                this.removeFeatures(this.clipboard["features"]);
            }
            this.addFeatures(layer, this.clipboard["features"]);
            this.clipboard["features"].clear();
            this.clearSelectedFeatures();
        }
    }
}