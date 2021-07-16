//import "ol-ext/dist/ol-ext.css";
import "ol/ol.css";
import OlMap from "ol/Map";
import OlView from "ol/View";
import * as OlExtent from "ol/extent";
import { OverviewMap as OlOverviewMapControl, defaults as OlDefaultControls } from "ol/control";
import OlVectorLayer from "ol/layer/Vector";
import OlVectorSource from "ol/source/Vector";
import OlTileSource from "ol/source/Tile";
import { OSM as OlOSM } from "ol/source";
import { Layer as OlLayer, Tile as OlTileLayer } from "ol/layer";
import OlFeature from "ol/Feature";
import { Point as OlPoint } from "ol/geom"
import OlBaseEvent from "ol/events/Event";
import { GeometryCollection } from "ol/geom";
import * as OlCoordinate from "ol/coordinate";
import * as OlProj from "ol/proj";
import OlOverlay from "ol/Overlay";
import OlOverlayPositioning from "ol/OverlayPositioning"
import { MapBrowserEvent as OlMapBrowserEvent } from "ol";
import { Circle as OlCircleStyle, Fill as OlFill, Stroke as OlStroke, Style as OlStyle } from "ol/style";
import { Select as OlSelect } from "ol/interaction";
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
import { DrawCallbackFunction, MeasureCallbackFunction, ModifyCallbackFunction, SelectCallbackFunction, TransformCallbackFunction } from "../Interaction/InteractionCallbackType";
import EventType from "../EventHandlerCollection/EventType";
import CursorType from "./CursorType";
import MeasureInteraction from "../Interaction/Impl/MeasureInteraction";
import MeasureType from "../Interaction/MeasureType";
import LayerBuilder from "../Layer/LayerBuilder";
import VectorLayer from "../Layer/Impl/VectorLayer";


/** Map */
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
     * @param targetDOMId - id of target DOM element 
     * @param opts - options 
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
        const overviewMapControl = new OlOverviewMapControl({
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
     * @return Openlayers map instance
     */
    public getMap(): OlMap {
        return this.map;
    }

    /**
     * Updates map size
     */
    public updateSize(): void {
        this.map.updateSize();
    }

    /**
     * Sets center of the map. Notice: in case of degree-based CRS x is longitude, y is latitude.
     * @param opts - options
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
        const mapProj = this.map.getView().getProjection().getCode();
        let coordinate: OlCoordinate.Coordinate = [centerX, centerY];
        if (mapProj != "EPSG:" + centerSRSId) {
            coordinate = OlProj.transform(coordinate, "EPSG:" + centerSRSId.toString(), mapProj);
        }
        this.map.getView().setCenter(coordinate);
    }

    /**
     * Sets zoom of the map.
     * @param zoom - zoom value
     */
    public setZoom(zoom: number): void {
        this.map.getView().setZoom(zoom);
    }

    /**
     * Sets cursor of the map.
     * @param cursor - cursor type
     */ 
    public setCursor(cursor: string): void {
        this.map.getViewport().style.cursor = cursor;
        this.cursor = cursor;
    }

    /**
     * Returns map's selected features
     * @return selected features
     */
    public getSelectedFeatures(): FeatureCollection {
        return this.selectedFeatures;
    }

    /**
     * Sets map's selected features
     * @param features - selected features
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
     * @return dirty layers
     */
    public getDirtyLayers(): LayerInterface[] {
        return Array.from(this.layers).filter((layer: LayerInterface): boolean => {
            return layer.getDirtyFeatures().getLength() != 0;
        });
    }

    /**
     * Returns map's selected layers
     * @return selected layers
     */
     public getSelectedLayers(): LayerInterface[] {
        return Array.from(this.selectedLayers);
    }

    /**
     * Sets map's selected layers
     * @param layers - selected layers
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
     */
     public clearSelectedFeatures(): void {
        const type = this.interaction.getType();
        if (type != InteractionType.Select) {
            return;
        }
        // clear an ordinary select interaction's features 
        const olSelect = <OlSelect> this.interaction.getInteraction();
        if (olSelect && olSelect instanceof OlSelect) {
            olSelect.getFeatures().clear();
        }
        // if it's a DragBox interaction we must clear its highlighting select features
        const select = <SelectInteraction> this.interaction;
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
     * @return interaction instance
     */
    public getInteraction(): InteractionInterface {
        return this.interaction;
    }

    /**
     * Returns map current interaction type
     * @return interaction type
     */
    public getInteractionType(): InteractionType {
        return this.interaction.getType();
    }
    
    /**
     * Sets map normal interaction
     */
    public setNormalInteraction(): void {
        this.clearInteractions(); 
        this.interaction = new NormalInteraction();
    }

    /**
     * Sets map draw interaction
     * @param layer - layer to draw on
     * @param geometryType - type of geometry to draw
     * @param callback - callback function to call after geometry is drawn
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
     * @param type - zoom type
     */
    public setZoomInteraction(type: ZoomType): void {
        this.clearInteractions(); 
        this.interaction = new ZoomInteraction(type, this);
        this.addInteraction(this.interaction);        
    }
    
    /**
     * Sets map selection interaction
     * @param type - selection type
     * @param layers - array of layers which selection applies to
     * @param multiple - flag indicating multiple selection
     * @param callback - callback function to call after geometry is selected
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
     * @param source - features to modify
     * @param callback - callback function to call after geometry is modified
     */
    public setModifyInteraction(source: LayerInterface | FeatureCollection, callback?: ModifyCallbackFunction): void {
        this.clearInteractions([InteractionType.Modify, InteractionType.Transform]);
        this.interaction = new ModifyInteraction(source, callback);
        this.addInteraction(this.interaction);  
    }

    /**
     * Sets map transform interaction
     * @param source - target layer for interaction
     * @param callback - callback function after geometry is transformed
     */
    public setTransformInteraction(source: LayerInterface, callback?: TransformCallbackFunction): void {
        this.clearInteractions([InteractionType.Modify, InteractionType.Transform]);
        this.interaction = new TransformInteraction(source, callback);
        this.addInteraction(this.interaction);  
    }

    /**
     * Sets map transform interaction
     * @param type - measure type
     * @param units - units
     */
    public setMeasureInteraction(type: MeasureType, units: unknown, callback?: MeasureCallbackFunction): void {
        this.clearInteractions();
        this.interaction = new MeasureInteraction(type, units, this, callback);
        this.addInteraction(this.interaction);  
    }

     /**
     * Adds interaction
     * @param interaction - interaction to add
     */
    private addInteraction(interaction: InteractionInterface): void {
        const olInteraction = interaction.getInteraction();
        if (typeof olInteraction !== "undefined") {
            this.map.addInteraction(interaction.getInteraction());
        }
        this.interactions.push(interaction);
    }

    /**
     * Clears interactions
     * @param  types - types of interaction to clear, all if not set
     */ 
    public clearInteractions(types?: InteractionType[]): void {
        this.interactions.forEach((interaction: InteractionInterface): void => {
            if ((typeof types !== "undefined" && types.includes(interaction.getType())) || typeof types === "undefined") {
                const interactionHandlers = interaction.getEventHandlers();
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
     * @return active layer instance
     */
    public getActiveLayer(): LayerInterface | null {
        return this.activeLayer;
    }

    /**
     * Sets active layer
     * @param layer - layer instance
     */
    public setActiveLayer(layer: LayerInterface | null): void {
        this.activeLayer = layer;
    }

    /**
     * Gets measure layer
     * @return measure layer instance
     */
    public getMeasureLayer(): LayerInterface {
        return this.measureLayer;
    }

    /**
     * Sets measure layer
     * @param layer - layer instance
     */
    public setMeasureLayer(layer: LayerInterface): void {
        this.measureLayer = layer;
    }

    /**
     * Adds layer to the map.
     * @param layer - layer instance
     */
    public addLayer(layer: LayerInterface): void {
        if (layer) {
            this.map.addLayer(layer.getLayer());
            this.layers.add(layer);
        }
    }

    /**
     * Removes layer from the map.
     * @param layer - layer instance
     */
    public removeLayer(layer: LayerInterface): void {
        if (layer) {
            this.map.removeLayer(layer.getLayer());
            this.layers.delete(layer);
        }
    }

    /**
     * Returns map layers.
     * @param type - type
     * @return map layers
     */
    public getLayers(type?: SourceType): LayerInterface[] {
        return Array.from(this.layers).filter((layer: LayerInterface): boolean => {
            return ((type && layer.getType() == type) || !type);
        });
    }

    /**
     * Returns corresponding layer of LayerInterface type by OlLayer.
     * @param olLayer - OL layer instance
     * @returnlayer of LayerInterface type
     */
     public getLayer(olLayer: OlLayer): LayerInterface {
        const layers: LayerInterface[] = Array.from(this.layers).filter((layer: LayerInterface): boolean => {
            return layer.getLayer() == olLayer;
        });
        return layers[0];
    }

    /** 
     * Adds features to map
     * @param layer - layer to add to
     * @param features - features to add
     */
    public addFeatures(layer: LayerInterface, features: FeatureCollection): void {
        if (features) {
            const source = <OlVectorSource> layer.getSource();
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
     * @param features - features to remove
     */
    public removeFeatures(features: FeatureCollection): void {
        if (features) {
            features.forEach((feature: Feature): void => {
                const layer = feature.getLayer(); 
                layer.setRemovedFeatures(feature);
                const source = <OlVectorSource> (layer.getLayer().getSource());
                source.removeFeature(feature.getFeature());
            });
            this.clearSelectedFeatures();
        }
    }

    /** 
     * Fits map to given extent
     * @param extent - extent to fit to
     */
    public fitExtent(extent: number[]): void {
        this.map.getView().fit(<OlExtent.Extent> extent);
    }

    /**
     * Fits map to all layer's features extent
     * @param layer - layer instance
     * @param zoom - zoom to set after fit
     */
    public fitLayer(layer: LayerInterface, zoom?: number): void {
        if (layer.getType() != SourceType.Vector) {
            throw new MethodNotImplemented();
        }
        let extent = (<OlVectorSource> layer.getSource()).getExtent();
        if (extent[0] !== Infinity && extent[1] !== Infinity && extent[2] !== -Infinity && extent[3] !== -Infinity) {
            extent = OlExtent.buffer(extent, 0);
            const view = this.map.getView();
            view.fit(extent);
            if (typeof zoom !== "undefined") {
                view.setZoom(zoom);
            }
        }
    }

    /**
     * Fits map to given features extent
     * @param features - features
     * @param zoom - zoom to set after fit
     */
    public fitFeatures(features: FeatureCollection, zoom?: number): void {
        const geometries = features.getFeatureGeometries();
        const gc = new GeometryCollection(geometries);
        const view = this.map.getView();
        if (geometries.length) {
            const extent = OlExtent.buffer(gc.getExtent(), 10);
            view.fit(extent);
        }
        if (typeof zoom !== "undefined") {
            view.setZoom(zoom);
        }
    }

    /**
     * Creates a measure layer and adds it to map
     * @memberof Map
     * @return measure layer instance 
     */
    public createMeasureLayer(): LayerInterface {
        if (!this.measureLayer) {
            const builder = new LayerBuilder(new VectorLayer());
            builder.setSource(SourceType.Vector);
            this.measureLayer = builder.build();
            this.addLayer(this.measureLayer);
        }
        return this.measureLayer;
    }

    /**
     * Clears measure layer
     */
    public clearMeasureLayer(): void {
        this.removeLayer(this.measureLayer);
        this.measureLayer = null;
    }

    /**
     * Creates a measure overlay and adds it to map
     * @param element - DOM element to create overlay upon
     * @param position - the overlay position in map projection
     * @param offset - offset in pixels used when positioning the overlay 
     */
    public createMeasureOverlay(element: HTMLElement, position: number[], offset: number[]): void {
        const overlay = new OlOverlay({
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
     */
    public clearMeasureOverlays(): void {
        this.measureOverlays.forEach((overlay: OlOverlay): void => {
            this.map.removeOverlay(overlay);
        });
        this.measureOverlays = [];
    }

    /**
     * Highlights vertex
     * @param coordinate - coordinate
     * @param srsId - SRS Id of coordinate
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
        const source = this.vertexHighlightLayer.getSource();
        source.clear();
        const feature = new OlFeature({
            geometry: new OlPoint(OlProj.transform(coordinate, "EPSG:" + srsId.toString(), "EPSG:" + this.srsId.toString()))
        });
        source.addFeature(feature);
    }

    /**
     * Clears vertex highlight
     */
    public clearVertexHighlight(): void {
        if (this.vertexHighlightLayer) {
            this.vertexHighlightLayer.setMap(null);
            this.vertexHighlightLayer = null;
        }
    }

    /**
     * Returns map's event handlers
     * @return event handlers collection
     */
    public getEventHandlers(): EventHandlerCollection {
        return this.eventHandlers;
    }
    
    /**
     * Sets map's event handler
     * @param eventType - event type
     * @param handlerName - handler id
     * @param callback - callback function to call when an event is triggered
     */
    public setEventHandler(eventType: EventType, handlerId: string, callback: (data: unknown) => void): void {
        this.eventHandlers.add(eventType, handlerId, callback);
    }

    /**
     * Returns coordinates from pixel in map projection
     * @param pixel - pixel coordinates
     * @return coordinates in map projection
     */
    public getCoordinateFromPixel(pixel: number[]): number[] {
        return this.map.getCoordinateFromPixel(pixel);
    }

    /**
     * Transforms coordinates from map projection to given one
     * @param coordinates - coordinates
     * @param srsId - SRS Id (e.g. 4326)
     * @return transformed coordinates
     */
    public transformCoordinates(coordinates: number[], srsId: number): number[] {
        return OlProj.transform(coordinates, "EPSG:" + this.srsId.toString(), "EPSG:" + srsId.toString());
    }

    /**
     * Copies features into clipboard
     * @param features - features to copy
     */
    public copyToClipBoard(features: FeatureCollection): void {
        this.clipboard["features"] = features;
        this.clipboard["remove"] = false;
    }

    /**
     * Cuts features into clipboard
     * @param features - features to copy
     */
     public cutToClipBoard(features: FeatureCollection): void {
        this.clipboard["features"] = features;
        this.clipboard["remove"] = true;
    }

    /**
     * Pastes features from clipboard
     * @param layer - layer instance to paste to
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