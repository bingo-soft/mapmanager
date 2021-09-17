import OlLayer from "ol/layer/Layer";
import { Source as OlSource } from "ol/source";
import SourceType from "../Source/SourceType";
import SourceInterface from "../Source/SourceInterface";
import EventHandlerCollection from "../EventHandlerCollection/EventHandlerCollection";
import StyleFunction from "../Style/StyleFunctionType";
import FeatureCollection from "../Feature/FeatureCollection";
import Feature from "../Feature/Feature";
import GeometryItem from "../Feature/GeometryItem";
import EventBus from "../EventHandlerCollection/EventBus";
import EventType from "../EventHandlerCollection/EventType";
import Map from "../Map/Map";
import LoaderFunction from "./LoaderFunctionType";

/** LayerInterface */
export default interface LayerInterface
{
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
    
    /**
     * Returns layer source type
     * @return layer source type
     */
    getType(): SourceType;

    setEventBus(eventBus: EventBus | null): void;

    getEventBus(): EventBus | null;
    
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
    /* getProperties(): unknown; */
    
    /**
     * Sets layer properties
     * @return layer properties
     */
    /* setProperties(source: unknown): void; */
    
    /**
     * Sets layer loader
     * @param loader - loader function
     */
    setLoader(loader: LoaderFunction): void;
    
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
     * Returns layer min zoom
     * @return min zoom
     */
     getMinZoom(): number;

    /**
     * Returns layer max zoom
     * @return max zoom
     */
    getMaxZoom(): number;

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
     * @param dirty - dirty flag. If true, features are added to layer dirty features collection, removed otherwise
     */
    setDirtyFeatures(features: FeatureCollection, dirty: boolean): void;

    /**
     * Adds or removes idle features
     * @param features - features to be set
     * @param idle - idle flag. If true, features are added to layer idle features collection, removed otherwise
     */
    setIdleFeatures(features: FeatureCollection, idle: boolean): void;

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
     * Creates feature from vertices
     * @param  array - array of feature vertices along with their ids and coordinates
     * @return resulting feature
     */
    createFeatureFromVertices(items: GeometryItem[]): Feature;

    /**
    * Checks if specified zoom is within layer's min and max zoom bounds
    *
    * @param zoom - zoom
    * @return whether specified zoom is within layer's min and max zoom bounds
    */
    fitsZoom(zoom: number): boolean;
}