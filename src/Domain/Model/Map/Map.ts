import * as turf from "@turf/turf"
import booleanIntersects from "@turf/boolean-intersects" 
import "ol/ol.css";
import OlMap from "ol/Map";
import OlView from "ol/View";
import * as OlExtent from "ol/extent";
import { OverviewMap as OlOverviewMapControl, Zoom as OlZoomControl, Control as OlControl, ScaleLine as OlScaleLine} from "ol/control";
import OlBaseLayer from "ol/layer/Base";
import VectorLayerOl from "ol/layer/Vector";
import OlVectorSource from "ol/source/Vector";
import OlTileSource from "ol/source/Tile";
import { Polygon as OlPolygon } from "ol/geom";
import { OSM as OlOSM } from "ol/source";
import { Layer as OlLayer, Tile as OlTileLayer } from "ol/layer";
import { GeoJSON as OlGeoJSON }  from "ol/format";
import OlFeature from "ol/Feature";
import { Point as OlPoint } from "ol/geom"
import OlBaseEvent from "ol/events/Event";
import { GeometryCollection } from "ol/geom";
import * as OlCoordinate from "ol/coordinate";
import * as OlProj from "ol/proj";
import OlOverlay from "ol/Overlay";
import { MapBrowserEvent as OlMapBrowserEvent } from "ol";
import { Select as OlSelect } from "ol/interaction";
import { Pixel } from "ol/pixel";
import LayerInterface from "../Layer/LayerInterface"
import BaseLayer from "./BaseLayer";
import InteractionType from "../Interaction/InteractionType";
import SourceChangedEvent from "../Source/SourceChangedEvent";
import SourceType from "../Source/SourceType";
import Feature from "../Feature/Feature";
import FeatureCollection from "../Feature/FeatureCollection";
import InteractionInterface from "../Interaction/InteractionInterface";
import NormalInteraction from "../Interaction/Impl/NormalInteraction";
import DrawInteraction from "../Interaction/Impl/DrawInteraction";
import ZoomInteraction from "../Interaction/Impl/ZoomInteraction";
import ZoomType from "../Interaction/Impl/ZoomType";
import SelectInteraction from "../Interaction/Impl/SelectInteraction";
import MapCoordinatesInteraction from "../Interaction/Impl/MapCoordinatesInteraction";
import SelectionType from "../Interaction/Impl/SelectionType";
import EventBus from "../EventHandlerCollection/EventBus";
import EventHandlerCollection from "../EventHandlerCollection/EventHandlerCollection";
import ModifyInteraction from "../Interaction/Impl/ModifyInteraction";
import TransformInteraction from "../Interaction/Impl/TransformInteraction";
import { DrawCallbackFunction, MapCoordinatesCallbackFunction, MeasureCallbackFunction, ModifyCallbackFunction, SelectCallbackFunction, TransformCallbackFunction, ZoomCallbackFunction } from "../Interaction/InteractionCallbackType";
import EventType from "../EventHandlerCollection/EventType";
import CursorType from "./CursorType";
import MeasureInteraction from "../Interaction/Impl/MeasureInteraction";
import MeasureType from "../Interaction/MeasureType";
import LayerBuilder from "../Layer/LayerBuilder";
import VectorLayer from "../Layer/Impl/VectorLayer";
import ObjectParser from "../../../Infrastructure/Util/ObjectParser";
import StyleBuilder from "../Style/StyleBuilder";
import { HighlightVertexStyle } from "../Style/HighlightVertexStyle";
import { SearchMarkerStyle } from "../Style/SearchMarkerStyle";
import TemporaryLayerType from "./TemporaryLayerType";
import ExportType from "./ExportType";
import SnapInteraction from "../Interaction/Impl/SnapInteraction";
import { OlVectorLayer } from "../Type/Type";


/** Map */
export default class Map { 
    private map: OlMap;
    private zoom: number;
    private srsId: number;
    private cursor: string;
    private layers: Set<LayerInterface> = new Set();
    private activeLayer: LayerInterface;
    private measureLayer: LayerInterface;
    private measureOverlays: OlOverlay[] = [];
    private searchLayer: LayerInterface;
    private textLayer: LayerInterface;
    private featurePopupOverlay: OlOverlay;
    private vertexHighlightLayer: OlVectorLayer;
    private selectedFeatures: FeatureCollection;
    private selectedLayers: Set<LayerInterface> = new Set();
    private clipboard: unknown;
    private interaction: InteractionInterface;
    private interactions: InteractionInterface[] = [];
    private eventHandlers: EventHandlerCollection;
    private documentEventHandlers: EventHandlerCollection;
    private eventBus: EventBus;

    private static readonly SRS_ID = 3857;
    private static readonly CENTER_X = 0;
    private static readonly CENTER_Y = 0;
    private static readonly ZOOM = 14;

    /**
     * @param targetDOMId - id of target DOM element 
     * @param opts - options 
     */
    constructor(targetDOMId: string, opts?: unknown) { 
        let baseLayer = null, 
            srsId = Map.SRS_ID,
            centerX = Map.CENTER_X,
            centerY = Map.CENTER_Y,
            centerSRSId = Map.SRS_ID,
            zoom = Map.ZOOM;
        // map init options application
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
        // map center init
        let center: OlCoordinate.Coordinate = [centerX, centerY];
        if (centerSRSId != srsId) {
            center = OlProj.transform(center, "EPSG:" + centerSRSId.toString(), "EPSG:" + srsId.toString());
        }
        // map source init
        let source: OlTileSource = null;
        if (baseLayer == BaseLayer.OSM) {
            if (Object.prototype.hasOwnProperty.call(opts, "base_layer_use_proxy") && opts["base_layer_use_proxy"]) {
                source = new OlOSM({
                    url: "/osm/{z}/{x}/{y}.png"
                });
            } else {
                source = new OlOSM();
            }
        } /* else if (...) {
            TODO
        } */
        // Ol map controls init
        const controls: OlControl[] = [];
        if (Object.prototype.hasOwnProperty.call(opts, "controls")) {
            if (opts["controls"].includes("zoom")) {
                const olZoomControl = new OlZoomControl();
                controls.push(olZoomControl);
            }
            if (opts["controls"].includes("scaleline")) {
                const olScaleLineControl = new OlScaleLine({
                    units: "metric",
                    bar: true,
                    steps: 1,
                    text: true
                });
                controls.push(olScaleLineControl);
            }
        }
        // Ol map init
        this.srsId = srsId;
        this.map = new OlMap({
            controls: controls,
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
        // cursor init
        this.cursor = CursorType.Default;
        // interaction init
        this.setNormalInteraction();
        // selected features init
        this.selectedFeatures = new FeatureCollection([]);
        // clipboard init
        this.clipboard = {
            "features": new FeatureCollection([]),
            "remove": false
        }
        // popup overlay init
        const popupElement: HTMLElement = document.createElement("div");
        this.featurePopupOverlay = new OlOverlay({
            element: popupElement,
            autoPan: false
        });
        this.map.addOverlay(this.featurePopupOverlay);
        // OL event handlers init
        this.eventHandlers = new EventHandlerCollection(this.map);
        this.eventHandlers.add(EventType.Click, "MapClickEventHandler", (e: OlBaseEvent): void => {
            if (!this.map.hasFeatureAtPixel((<OlMapBrowserEvent<UIEvent>>e).pixel)) {
                this.clearSelectedFeatures();
            }
        });
        this.eventHandlers.add(EventType.PointerMove, "MapPointerMoveEventHandler", (e: OlBaseEvent): void => {
            const pixel = (<OlMapBrowserEvent<UIEvent>>e).pixel;
            this.map.getViewport().style.cursor = this.map.hasFeatureAtPixel(pixel) ? CursorType.Pointer : this.cursor;
            // show popup
            this.showFeaturePopup(pixel);
        });
        // DOM document event handlers init
        this.documentEventHandlers = new EventHandlerCollection(document);
        this.documentEventHandlers.add(EventType.KeyDown, "KeyDownEventHandler", (e: KeyboardEvent): void => {
            if (this.interaction.getType() == InteractionType.Draw) {
                if (e.key == "Escape") {
                    (<DrawInteraction> this.interaction).abortDrawing();
                }
                if (e.key == "Delete" || e.key == "Backspace") {
                    (<DrawInteraction> this.interaction).removeLastPoint();
                }
            }
        });
    }

    /**
     * Sets Event Bus
     * @param eventBus - Event Bus
     */
    public setEventBus(eventBus: EventBus | null): void
    {
        this.eventBus = eventBus;
    }

    /**
     * Returns Event Bus
     * @return Event Bus
     */
    public getEventBus(): EventBus | null 
    {
        return this.eventBus;
    }

    /**
     * Returns Openlayers map instance
     * @return Openlayers map instance
     */
    public getMap(): OlMap {
        return this.map;
    }

    /**
     * Returns map SRS id
     * @return map SRS id
     */
     public getSRSId(): number {
        return this.srsId;
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
            centerSRSId = Map.SRS_ID, 
            showMarker = false;
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
            if (Object.prototype.hasOwnProperty.call(opts, "show_marker")) {
                showMarker = opts["show_marker"];
            }
        }
        const mapProj = this.map.getView().getProjection().getCode();
        let coordinate: OlCoordinate.Coordinate = [centerX, centerY];
        if (mapProj != "EPSG:" + centerSRSId) {
            coordinate = OlProj.transform(coordinate, "EPSG:" + centerSRSId.toString(), mapProj);
        }
        this.map.getView().setCenter(coordinate);
        if (showMarker) {
            this.showMarker(coordinate);
        }
    }

    /**
     * Sets zoom of the map.
     * @param zoom - zoom value
     */
    public setZoom(zoom: number): void {
        this.map.getView().setZoom(zoom);
    }

    /**
     * Sets zoom callback function for the map.
     * @param callback - callback function to set
     */
    public setZoomCallback(callback: ZoomCallbackFunction): void {
        this.eventHandlers.add(EventType.MoveEnd, "MapZoomEventHandler", (e: OlBaseEvent): void => {
            if (typeof callback !== "function") {
                return;
            }
            const zoom = this.map.getView().getZoom();
            if (this.zoom != zoom) {
                this.zoom = zoom; 
                callback(zoom);
            }
        });
    }

    /**
     * Unsets zoom callback function for the map.
     */
    public unsetZoomCallback(): void {
        this.eventHandlers.remove("MapZoomEventHandler");
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
            return layer.isDirty();
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
        const mapLayers: LayerInterface[] = Array.from(this.layers);
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
        // if it's a DragBox or Draw interaction we must clear its highlighting select features
        const select = <SelectInteraction> this.interaction;
        if (select) {
            const highlightSelect = select.getInnerInteractions()[0];
            if (highlightSelect) {
                (<OlSelect> highlightSelect).getFeatures().clear();
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
        this.clearInteractions([InteractionType.Draw]);
        this.interaction = new DrawInteraction(layer, geometryType, callback);
        this.addInteraction(this.interaction);        
    }

    /**
     * Sets map zoom interaction
     * @param type - zoom type
     */
    public setZoomInteraction(type: ZoomType): void {
        this.clearInteractions([InteractionType.Zoom]); 
        this.interaction = new ZoomInteraction(type, this);
        this.addInteraction(this.interaction);        
    }
    
    /**
     * Sets map selection interaction
     * @param type - selection type
     * @param layers - array of layers which selection applies to
     * @param multiple - flag indicating multiple selection
     * @param pin - flag indicating pin selection
     * @param callback - callback function to call after geometry is selected
     */
    public setSelectInteraction(type: SelectionType, layers: LayerInterface[], multiple = false, pin = false, callback?: SelectCallbackFunction): InteractionInterface {
        this.clearInteractions([InteractionType.Select]);
        this.interaction = new SelectInteraction(type, this, layers, multiple, pin, callback);
        this.addInteraction(this.interaction);
        return this.interaction;
    }

    /**
     * Sets map snap interaction
     * @param layers - array of layers which snap applies to
     * @param pixelTolerance - pixel tolerance for considering the pointer close enough to a segment or vertex for snapping
     */
    public setSnapInteraction(layers: LayerInterface[], pixelTolerance?: number): InteractionInterface {
        this.clearInteractions([InteractionType.Snap]);
        this.interaction = new SnapInteraction(this, layers, pixelTolerance);
        this.addInteraction(this.interaction);
        return this.interaction;
    }

    /**
     * Sets map modify interaction
     * @param source -  target layer for interaction
     * @param callback - callback function to call after geometry is modified
     */
    public setModifyInteraction(source: LayerInterface, callback?: ModifyCallbackFunction): void {
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
     * @param popupSettings - popup settings
     * @param callback - callback function after measure is done
     */
    public setMeasureInteraction(type: MeasureType, popupSettings: unknown, callback?: MeasureCallbackFunction): void {
        this.clearInteractions([InteractionType.Measure]);
        this.interaction = new MeasureInteraction(type, popupSettings, this, callback);
        this.addInteraction(this.interaction);  
    }

    /**
     * Sets map get coordinates by click interaction
     * @param type - type (mouse click or move)
     * @param callback - callback function returning coordinates
     * @param srsId - SRS Id to return coordinates in
     */
    public setMapCoordinatesInteraction(type: EventType, callback: MapCoordinatesCallbackFunction, srsId?: number): void {
        this.interaction = new MapCoordinatesInteraction(this, type, callback, srsId);
        this.addInteraction(this.interaction);        
    }

    /**
     * Adds text to the map
     * @param coordinates - coordinates in map projection
     * @param opts - options
     */
    public addText(coordinates: number[], opts: unknown): void {
        const olMap = this.getMap();
        const tempLayer = this.createTemporaryLayer(TemporaryLayerType.Text);
        const LABEL_WIDTH = 100;
        const LABEL_HEIGHT = 20;
        this.eventHandlers = new EventHandlerCollection(olMap);
        const point1 = olMap.getCoordinateFromPixel(coordinates);
        const point2 = olMap.getCoordinateFromPixel([coordinates[0] + LABEL_WIDTH, coordinates[1]]);
        const point3 = olMap.getCoordinateFromPixel([coordinates[0] + LABEL_WIDTH, coordinates[1] + LABEL_HEIGHT]);
        const point4 = olMap.getCoordinateFromPixel([coordinates[0], coordinates[1] + LABEL_HEIGHT]);
        const feature = new OlFeature({
            geometry: new OlPolygon([[
                point1, point2, point3, point4, point1 
            ]])
        });
        const styleFunc = new StyleBuilder(opts).build(false, true);
        feature.setStyle(styleFunc);
        (<OlVectorLayer> tempLayer.getLayer()).getSource().addFeature(feature);
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
     * @param types - types of interaction to clear, all if not set
     */ 
    public clearInteractions(types?: InteractionType[]): void {
        this.interactions.forEach((interaction: InteractionInterface): void => {
            if ((typeof types !== "undefined" && types.includes(interaction.getType())) || typeof types === "undefined") {
                interaction.removeInnerInteractions(this);
                const interactionHandlers = interaction.getEventHandlers();
                if (interactionHandlers) {
                    interactionHandlers.clear();
                }
                this.map.removeInteraction(interaction.getInteraction());
           }
        });
        if (typeof types !=="undefined") {
            types.forEach((type: InteractionType): void => {
                this.interactions = this.interactions.filter((interaction: InteractionInterface): boolean => interaction.getType() !== type);
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
            layer.setMap(this);
            layer.setEventBus(this.getEventBus());
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
     * Returns corresponding layer of LayerInterface type by OL Layer.
     * @param olLayer - OL layer instance
     * @return layer of LayerInterface type
     */
    public getLayer(olLayer: OlLayer): LayerInterface | null {
        const layers: LayerInterface[] = Array.from(this.layers).filter((layer: LayerInterface): boolean => {
            return layer.getLayer() == olLayer;
        });
        return layers[0] ? layers[0] : null;
    }

    /**
     * Checks if layer exists on the map 
     * @param layer - layer instance
     * @return whether layer exists on the map
     */
    /* public layerExists(layer: LayerInterface): boolean {
        const layers: LayerInterface[] = Array.from(this.layers).filter((l: LayerInterface): boolean => {
            return l == layer;
        });
        return (layers && layers.length != 0);
    } */

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
                layer.setDirtyFeatures(new FeatureCollection([feature]));
            });
            this.eventBus.dispatch(new SourceChangedEvent());
        }
    }

    /** 
     * Removes features from map
     * @param features - features to remove
     */
    public removeFeatures(features: FeatureCollection): void {
        if (features) {   
            let layer;         
            features.forEach((feature: Feature): void => {
                layer = feature.getLayer(); 
                layer.setRemovedFeatures(feature);
                const source = <OlVectorSource> (layer.getLayer().getSource());
                source.removeFeature(feature.getFeature());
            });
            this.eventBus.dispatch(new SourceChangedEvent());
            this.clearSelectedFeatures();
        }
    }

    /** 
     * Fits map to given extent
     * @param extent - extent to fit to
     */
    /* public fitExtent(extent: number[]): void {
        this.map.getView().fit(<OlExtent.Extent> extent);
    } */

    /**
     * Fits map to given features extent
     * @param features - features
     * @param zoom - zoom to set after fit
     * @param showCenterMarker - whether to show a center marker after fit
     */
    public fitFeatures(features: FeatureCollection, zoom?: number, showCenterMarker?: boolean): void {
        const geometries = features.getFeatureGeometries();
        if (!geometries.length) {
            return;
        }
        const view = this.map.getView();
        const gc = new GeometryCollection(geometries);
        const extent = OlExtent.buffer(gc.getExtent(), 10);
        view.fit(extent);
        if (typeof zoom !== "undefined") {
            view.setZoom(zoom);
        }
        if (typeof showCenterMarker !== "undefined" && showCenterMarker) {
            this.showMarker(OlExtent.getCenter(extent));        
        }
    }

    /**
     * Fits map to all layer's features extent
     * @param layer - layer instance
     * @param zoom - zoom to set after fit
     */
    public fitLayer(layer: LayerInterface, zoom?: number): void {
        const features = (<OlVectorSource> layer.getSource()).getFeatures();
        if (features) {
            this.fitFeatures(new FeatureCollection(features), zoom);
        }
    }

    /**
     * Toggles layer on/off depending on current zoom
     * @param layer - layer to toggle
     * @param currentZoom - current zoom
     */
    /* private toggleLayer(layer: LayerInterface, currentZoom: number): void {
        layer.getLayer().setVisible(layer.fitsZoom(currentZoom));
    } */

    /**
     * Creates a temporary layer and adds it to map
     * @memberof Map
     * @return temporary layer instance 
     */
    public createTemporaryLayer(type: TemporaryLayerType): LayerInterface {
        let layer = null;
        if (type == TemporaryLayerType.Measure) {
            layer = this.measureLayer;
        } else if (type == TemporaryLayerType.CenterMarker) {
            layer = this.searchLayer;
        } else if (type == TemporaryLayerType.Text) {
            layer = this.textLayer;
        }
        if (!layer) {
            const builder = new LayerBuilder(new VectorLayer());
            builder.setSource(SourceType.Vector);
            layer = builder.build();
            if (type == TemporaryLayerType.Measure) {
                this.measureLayer = layer;
            } else if (type == TemporaryLayerType.CenterMarker) {
                this.searchLayer = layer;
            } else if (type == TemporaryLayerType.Text) {
                this.textLayer = layer;
            }
        }
        layer.getLayer().setMap(this.map);
        return layer;
    }

    /**
     * Clears temporary layer
     */
    public clearTemporaryLayer(type: TemporaryLayerType): void {
        if (type == TemporaryLayerType.Measure && this.measureLayer) {
            this.measureLayer.getLayer().setMap(null);
            this.measureLayer = null;
        } else if (type == TemporaryLayerType.CenterMarker && this.searchLayer) {
            this.searchLayer.getLayer().setMap(null);
            this.searchLayer = null;
        } else if (type == TemporaryLayerType.Text &&  this.textLayer) {
            this.textLayer.getLayer().setMap(null);
            this.textLayer = null;
        }
    }

    /**
     * Creates a measure overlay and adds it to map
     * @param element - DOM element to create overlay upon
     * @param position - the overlay position in map projection
     * @param offset - offset in pixels used when positioning the overlay 
     * @return measure overlay
     */
    public createMeasureOverlay(element: HTMLElement, position: number[], offset: number[]): OlOverlay {
        const overlay = new OlOverlay({
            element: element,
            offset: offset,
            position: position,
            positioning: "bottom-center"
        });
        this.map.addOverlay(overlay);
        this.measureOverlays.push(overlay);
        return overlay;
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
     * @param isTransparent - whether highlight must be transparent
     * @param id - vertex id
     * @param label - label for vertex
     * @return highlight feature
     */
    public highlightVertex(coordinate: OlCoordinate.Coordinate, srsId: number, 
        style: unknown = null, id?: number, label?: string): Feature {
        if (!this.vertexHighlightLayer) {
            this.vertexHighlightLayer = new VectorLayerOl({
                source: new OlVectorSource()
            });
        }
        const styleToBuild = style && Object.keys(style).length != 0 ? style : HighlightVertexStyle;
        const styleFunc = new StyleBuilder(styleToBuild).build(false, true);
        this.vertexHighlightLayer.setStyle(styleFunc);
        this.vertexHighlightLayer.setMap(this.map);
        const source = this.vertexHighlightLayer.getSource();
        const feature = new OlFeature({
            geometry: new OlPoint(OlProj.transform(coordinate, "EPSG:" + srsId.toString(), "EPSG:" + this.srsId.toString()))
        });
        if (id) {
            feature.set("vertexId", id);
        }
        if (label) {
            feature.set("label", label);
        }
        source.addFeature(feature);
        return new Feature(feature);
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
     * Selects all features inside a given one
     * @param feature - given feature
     * @param layers - layers to select features on (all layers if not specified)
     */
    public selectFeaturesInside(feature: Feature, layers?: LayerInterface[]): void {
        this.selectedFeatures = new FeatureCollection([]);
        this.selectedLayers.clear();
        const olMap = this.getMap();
        const select = new OlSelect();
        olMap.addInteraction(select);
        const selectedFeatures = select.getFeatures();
        const selectedLayers: Set<OlLayer> = new Set();
        const OlLayersToSelectOn: OlLayer[] = [];
        if (layers) {
            layers.forEach((layer: LayerInterface): void => {
                if (layer.getType() == SourceType.Vector) {
                    OlLayersToSelectOn.push(layer.getLayer());
                }
            });
        }
        const extentFeature = feature.getFeature();
        const extentGeometryTurf = new OlGeoJSON().writeFeatureObject(extentFeature).geometry;
        const extent = extentFeature.getGeometry().getExtent();
        olMap.getLayers().forEach((olLayer: OlBaseLayer): void => {
            if (olLayer instanceof VectorLayerOl) {
                if ((OlLayersToSelectOn.includes(olLayer) && OlLayersToSelectOn.length) || !OlLayersToSelectOn.length) {
                    (<OlVectorLayer> olLayer).getSource().forEachFeatureIntersectingExtent(extent, (olFeature: OlFeature) => {
                        const featureTurf = new OlGeoJSON().writeFeatureObject(olFeature);
                        const featureGeometryTurf = featureTurf.geometry;
                        if (booleanIntersects(turf.feature(extentGeometryTurf), turf.feature(featureGeometryTurf)) 
                            && extentFeature != olFeature) {
                            selectedLayers.add(olLayer);
                            selectedFeatures.push(olFeature); // just to highlight the selection
                        }
                    });
                }
            }
        });
        const fc = new FeatureCollection(selectedFeatures.getArray());
        this.setSelectedFeatures(fc);
        this.setSelectedLayers(selectedLayers);
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
     * Transforms coordinates from one projection to another
     * @param coordinates - coordinates
     * @param sourceSrsId - source SRS Id (e.g. 4326)
     * @param destinationSrsId - destination SRS Id (e.g. 4326)
     * @return transformed coordinates
     */
    public static transformCoordinates(coordinates: number[], sourceSrsId: number, destinationSrsId: number): number[] {
        return OlProj.transform(coordinates, "EPSG:" + sourceSrsId.toString(), "EPSG:" + destinationSrsId.toString());
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

    /**
     * Exports map
     * @param exportType - type of export, defaults to ExportType.Printer
     * @param isDownload - parameter indicating whether the file should be downloaded by a browser, works only in case of PNG
     * @return in case of PNG or GeoTIFF a promise with the file information
     */
    public export(exportType: ExportType = ExportType.Printer, isDownload: boolean): Promise<unknown> {
        return new Promise((resolve): void => {
            this.map.updateSize();
            this.map.once("rendercomplete", () => {
                // get map canvas through iterating its layers
                const mapCanvas = document.createElement("canvas");
                const size = this.map.getSize();
                mapCanvas.width = size[0];
                mapCanvas.height = size[1];
                const mapContext = mapCanvas.getContext("2d");
                const layers = document.getElementsByClassName("ol-layer");
                Array.prototype.forEach.call(layers, (layer: any) => {
                    const canvas = layer.children[0];
                    if (canvas.width > 0) {
                        const opacity = canvas.parentNode.style.opacity;
                        mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity);
                        const transform = canvas.style.transform;
                        // Get the transform parameters from the style's transform matrix
                        const matrix = transform
                            .match(/^matrix\(([^\(]*)\)$/)[1]
                            .split(',')
                            .map(Number);
                        // Apply the transform to the export map context
                        CanvasRenderingContext2D.prototype.setTransform.apply(mapContext, matrix);
                        mapContext.drawImage(canvas, 0, 0);
                    }
                });
                
                let printContainer = document.getElementById("print-container");
                if (printContainer) {
                    printContainer.remove();
                }
                printContainer = document.createElement("div");
                printContainer.id = "print-container";
                printContainer.style.display = "none";
                document.body.appendChild(printContainer);
                
                const iframe = document.createElement("iframe");
                printContainer.appendChild(iframe);

                const img = document.createElement("img");
                img.setAttribute("crossorigin", "anonymous");
                //const mimeType = (exportType == ExportType.Printer || exportType == ExportType.PNG) ? "image/png" : "image/tiff";
                const mimeType = "image/png";
                img.src = mapCanvas.toDataURL(mimeType); 
                img.onload = (): void => {
                    if (exportType == ExportType.Printer) {
                        iframe.contentWindow.print();
                        iframe.contentWindow.document.body.appendChild(img);
                    } else {
                        const ret = {file: null, xmin: null, ymin: null, xmax: null, ymax: null};
                        if (exportType == ExportType.GeoTIFF) {
                            const extent = this.map.getView().calculateExtent();
                            const bottomLeft = OlExtent.getBottomLeft(extent);
                            const topRight = OlExtent.getTopRight(extent);
                            ret.xmin = bottomLeft[0];
                            ret.ymin = bottomLeft[1];
                            ret.xmax = topRight[0];
                            ret.ymax = topRight[1];
                        }
                        mapCanvas.toBlob((blob: Blob): void => {
                            if (exportType == ExportType.PNG && isDownload) {
                                const link = document.createElement("a");
                                link.style.display = "none";
                                link.href = URL.createObjectURL(blob);
                                link.download = "map.png";
                                link.click();
                            } else {
                                ret.file = blob;
                                resolve(ret);  
                            }
                        }, mimeType);    
                    }
                }
                iframe.contentWindow.document.body.appendChild(img);
            });
        });
    }

    /**
     * Shows marker
     * @param coordinate - coordinate
     */
    private showMarker(coordinate: OlCoordinate.Coordinate): void {
        const style = new StyleBuilder(SearchMarkerStyle).build(false);
        const marker = new OlFeature(new OlPoint(coordinate));
        marker.setStyle(style);
        const layer = this.createTemporaryLayer(TemporaryLayerType.CenterMarker);
        (<OlVectorSource> layer.getSource()).addFeature(marker);
    }

    /**
     * Shows feature popup
     * @param pixel - pixel coordinates
     */
    private showFeaturePopup(pixel: Pixel): void {
        const featurePopupElement = this.featurePopupOverlay.getElement();
        this.featurePopupOverlay.setPosition(null);
        this.map.forEachFeatureAtPixel(pixel, (olFeature: OlFeature, olLayer: OlLayer): void => {
            const clusteredFeatures = olFeature.get('features');
            if (clusteredFeatures) {
                // if we have clusters and the feature is not in cluster
                if (clusteredFeatures.length == 1) {
                    olFeature = clusteredFeatures[0];
                // if we have clusters and the feature is in cluster then we don't show a popup
                } else {
                    return;
                }
            }
            const layer = this.getLayer(olLayer);
            if (layer) {
                const featurePopupTemplate = layer.getFeaturePopupTemplate();
                if (featurePopupTemplate) {
                    const properties = olFeature.getProperties();
                    featurePopupElement.innerHTML = ObjectParser.parseTemplate(featurePopupTemplate, properties);
                    const featurePopupCss = layer.getFeaturePopupCss();
                    if (featurePopupCss) { 
                        featurePopupElement.setAttribute("style", featurePopupCss);
                    }
                    if (featurePopupElement.innerHTML) {
                        this.featurePopupOverlay.setPosition(this.map.getCoordinateFromPixel(pixel));
                    }
                }
            }
        });
    }


}