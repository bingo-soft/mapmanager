import OlLayer from "ol/layer/Layer";
import { Source as OlSource } from "ol/source";
import OlFeature from "ol/Feature";
import { LoadFunction, UrlFunction } from "ol/Tile";
import OlGeoJSON from "ol/format/GeoJSON";
import SourceType from "../Source/SourceType";
import SourceInterface from "../Source/SourceInterface";
import EventHandlerCollection from "../EventHandlerCollection/EventHandlerCollection";
import StyleFunction from "../Style/StyleFunctionType";
import FeatureCollection from "../Feature/FeatureCollection";
import Feature from "../Feature/Feature";
import EventBus from "../EventHandlerCollection/EventBus";
import EventType from "../EventHandlerCollection/EventType";
import Map from "../Map/Map";
import LoaderFunction from "./LoaderFunctionType";


/** LayerInterface */
export default interface LayerInterface
{
    /**
     * Returns map instance
     * @return map instance
     */
    getMap(): Map;

    /**
     * Sets map instance
     * @param map - map instance
     */
    setMap(map: Map): void;

    /**
     * Returns Openlayers layer instance
     * @return layer instance
     */
    getLayer(): OlLayer;

    /**
     * Returns layer event handlers
     * @return layer event handlers
     */
    getEventHandlers(): EventHandlerCollection;

    /**
     * Sets layer event handler
     * @param eventType - event type
     * @param handlerName - handler id
     * @param callback - callback function to call when an event is triggered
     */
    setEventHandler(eventType: EventType, handlerId: string, callback: (data: unknown) => void): void;
    
    setEventBus(eventBus: EventBus | null): void;

    getEventBus(): EventBus | null;
    
    /**
     * Returns layer source type
     * @return layer source type
     */
    getType(): SourceType;
    
    /**
     * Sets layer source type
     * @param - layer source type
     */
    setType(type: SourceType): void;
    
    /**
     * Returns layer SRS
     * @return layer SRS Id
     */
    getSRSId(): number;
    
    /**
     * Returns layer Openlayers source instance
     * @return layer Openlayers source instance
     */
    getSource(): OlSource;
    
    /**
     * Sets layer Openlayers source instance
     * @param source - layer Openlayers source instance
     */
    setSource(source: SourceInterface): void;

    /**
     * Returns layer properties
     * @return layer properties
     */
    getProperties(): unknown;
    
    /**
     * Sets layer properties
     * @return layer properties
     */
    setProperties(source: unknown): void;
    
    /**
     * Sets layer loader
     * @param loader - loader function
     */
    setLoader(loader: LoaderFunction): void;

    /**
     * Returns layer's options
     * @return data
     */
    getLoaderOptions(): unknown;

    /**
     * Sets layer's options
     */
    setLoaderOptions(options: unknown): void;

    /**
     * Sets layer's tile url function
     * @param loader - loader function
     * @return layer builder instance
     */
    setTileUrlFunction(loader: UrlFunction): void;

    /**
     * Sets layer's tile loader
     * @param loader - loader function
     * @return layer builder instance
     */
    setTileLoadFunction(loader: LoadFunction): void;

     /**
     * Sets layer's tile index
     * @param json - json to create an index from
     */
     setTileIndex(json: unknown);

    /**
     * Returns layer's tile index
     * @return layer's tile index
     */
    getTileIndex(): unknown;

    /**
     * Returns layer's tile format
     * @return layer's tile format
     */
    getFormat(): OlGeoJSON;

    /**
     * Sets layer's tile format
     * @param format - format
     */
    setFormat(format: string): void;

    /**
     * Returns layer's URL
     * @return layer's URL
     */
    getUrl(): string;
    
    /**
     * Sets layer source url
     * @param url - source url
     */
    setUrl(url: string): void;

    /**
     * Sets layer source params
     * @param params - params
     */
    setParams(params: unknown): void;
    
    /**
     * Sets layer zIndex
     * @param zIndex - zIndex
     */
    setZIndex(zIndex: number): void;
    
    /**
     * Sets layer opacity
     * @param opacity - opacity
     */
    setOpacity(opacity: number): void;
    
    /**
     * Sets layer style
     * @param style - style function
     */
    setStyle(style: StyleFunction): void;

    /**
     * Adds features to layer
     * @param features - features as an array of OL feature instances or as a GeoJSON string
     */
    addFeatures(features: OlFeature[] | string): void;

    /**
     * Returns collection of dirty features
     * @return collection of dirty features
     */
    getDirtyFeatures(): FeatureCollection;

    /**
     * Clears all layer dirty features
     */
    clearDirtyFeatures(): void;

    /**
     * Adds or removes dirty features
     * @param features - features to be set
     */
    setDirtyFeatures(features: FeatureCollection): void;

    /**
     * Adds or removes idle features
     * @param features - features to be set
     * @param idle - idle flag. If true, features are added to layer idle features collection, removed otherwise
     */
    //setIdleFeatures(features: FeatureCollection, idle: boolean): void;

    /**
     * Checks if layer is dirty
     * @return flag indicating if layer is dirty
     */
    isDirty(): boolean;

    /**
     * Returns collection of removed features
     * @return collection of removed features
     */
    getRemovedFeatures(): FeatureCollection;

    /**
     * Adds features to removed
     * @param features - single feature or collection
     */
    setRemovedFeatures(features: Feature | FeatureCollection): void;

    /**
     * Returns feature popup template
     * @return feature popup template
     */
    getFeaturePopupTemplate(): string;
    
    /**
     * Sets feature popup template
     * @param template - feature popup template
     */
    setFeaturePopupTemplate(template: string): void;

    /**
     * Returns feature popup CSS
     * @return feature popup CSS
     */
    getFeaturePopupCss(): string;
    
    /**
     * Sets feature popup CSS
     * @param css - feature popup CSS
     */
    setFeaturePopupCss(css: string): void;

    /**
     * Returns vertex highlight style
     * @return vertex highlight style
     */
    getVertexHighlightStyle(): unknown;
    
    /**
     * Sets vertex highlight style
     * @param style - vertex highlight style
     */
    setVertexHighlightStyle(style: unknown): void;

    /**
     * Returns loading tiles count
     * @return loading tiles count
     */
    getLoadingTilesCount(): number;

    /**
     * Sets loading tiles count
     * @param count - loading tiles count
     */
    setLoadingTilesCount(count: number): void;

    /**
     * Returns loaded tiles count
     * @return loaded tiles count
     */
    getLoadedTilesCount(): number;

    /**
      * Sets loaded tiles count
      * @param count - loaded tiles count
      */
    setLoadedTilesCount(count: number): void;

}