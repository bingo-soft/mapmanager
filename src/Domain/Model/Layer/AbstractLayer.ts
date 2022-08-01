import OlLayer from "ol/layer/Layer";
import { Source as OlSource } from "ol/source";
import LayerInterface from "./LayerInterface";
import SourceType from "../Source/SourceType";
import SourceInterface from "../Source/SourceInterface";
import MethodNotImplemented from "../../Exception/MethodNotImplemented";
import EventHandlerCollection from "../EventHandlerCollection/EventHandlerCollection";
import StyleFunction from "../Style/StyleFunctionType";
import FeatureCollection from "../Feature/FeatureCollection";
import Feature from "../Feature/Feature";
import EventType from "../EventHandlerCollection/EventType";
import EventBus from "../EventHandlerCollection/EventBus";
import GeometryItem from "../Feature/GeometryItem";
import Map from "../Map/Map";
import LoaderFunction from "./LoaderFunctionType";
import { threadId } from "worker_threads";

/** AbstractLayer */
export default abstract class AbstractLayer implements LayerInterface
{
    protected type: SourceType;
    protected layer: OlLayer;
    protected properties: unknown;
    protected srsId: number;
    protected eventHandlers: EventHandlerCollection;
    protected eventBus: EventBus;
    protected map: Map;
    protected loaderOptions: unknown;

    /**
     * Returns map instance
     * @return map instance
     */
    getMap(): Map {
        return this.map;
    }

    /**
     * Sets map instance
     * @param map - map instance
     */
    setMap(map: Map): void {
        this.map = map;
    };

    /**
     * Returns Openlayers layer instance
     * @return layer instance
     */
    public getLayer(): OlLayer {
        return this.layer;
    }

    /**
     * Returns layer's source type
     * @return layer's source type
     */
    public getType(): SourceType {
        return this.type;
    }

    /**
     * Sets layer's source type
     * @param type - layer's source type
     */
    public setType(type: SourceType): void {
        this.type = type;
    }

    public setEventBus(eventBus: EventBus | null): void {
        this.eventBus = eventBus;
    }

    public getEventBus(): EventBus | null
    {
        return this.eventBus;
    }

    /**
     * Returns layer properties
     * @return layer properties
     */
    public getProperties(): unknown {
        return this.properties;
    }

    /**
     * Sets layer properties
     * @param properties - layer properties
     */
    public setProperties(properties: unknown): void {
        this.properties = properties;
    }

    /**
     * Returns layer's event handlers
     * @return layer's event handlers
     */
    public getEventHandlers(): EventHandlerCollection {
        return this.eventHandlers;
    }

    /**
     * Sets layer's event handler
     * @param eventType - event type
     * @param handlerName - handler id
     * @param callback - callback function to call when an event is triggered
     */
    public setEventHandler(eventType: EventType, handlerId: string, callback: (data: unknown) => void): void {
        this.eventHandlers.add(eventType, handlerId, callback);
    }

    /**
     * Returns layer's SRS Id
     * @return layer's SRS
     */
    public getSRSId(): number {
        return this.srsId;
    }

    /**
     * Returns layer's source
     * @return layer's source
     */
     public getSource(): OlSource {
        return this.layer.getSource();
    }

    /**
     * Sets layer's source
     * @param source - layer's source
     */
    public setSource(source: SourceInterface): void {
        const olSource = source.getSource();
        this.layer.setSource(olSource);
        this.eventHandlers = new EventHandlerCollection(olSource);
    }

    /**
     * Sets layer's loader
     * @param loader - loader function
     */
    public setLoader(loader: LoaderFunction): void {
        throw new MethodNotImplemented();
    }

    /**
     * Returns layer's options
     * @return layer's SRS
     */
    public getLoaderOptions(): unknown {
        return this.loaderOptions;
    }

    /**
     * Sets layer's options
     * @return layer's SRS
     */
    public setLoaderOptions(options: unknown): void {
        this.loaderOptions = options;
    }

    /**
     * Sets layer's source url
     * @param url - source url
     */
    public setUrl(url: string): void {
        throw new MethodNotImplemented();
    }

    /**
     * Sets layer's params
     * @param params - params
     */
    public setParams(params: unknown): void {
        throw new MethodNotImplemented();
    }

    /**
     * Sets layer's zIndex
     * @param zIndex - zIndex
     */
    public setZIndex(zIndex: number): void {
        this.layer.setZIndex(zIndex);
    }

    /**
     * Sets layer's opacity
     * @param opacity - opacity
     */
    public setOpacity(opacity: number): void { 
        this.layer.setOpacity(opacity / 100);
    }

    /**
     * Sets layer's style
     * @param style - style function
     */
    public setStyle(style: StyleFunction): void { 
        throw new MethodNotImplemented();
    }

    /**
     * Returns collection of dirty features
     * @return collection of dirty features
     */
    public getDirtyFeatures(): FeatureCollection {
        throw new MethodNotImplemented();
    }

    /**
     * Clears all layer dirty features
     */
    public clearDirtyFeatures(): void {
        throw new MethodNotImplemented();
    }

    /**
     * Sets collection of dirty features
     * @param features - collection of dirty features
     */
    public setDirtyFeatures(features: FeatureCollection): void  {
        throw new MethodNotImplemented();
    }

    /**
     * Sets collection of idle features
     * @param features - collection of idle features
     * @param idle - idle flag. If true, features are added to layer's idle features collection, removed otherwise
     */
    /* public setIdleFeatures(features: FeatureCollection, idle: boolean): void  {
        throw new MethodNotImplemented();
    }
 */
    /**
     * Checks if layer is dirty
     * @return flag indicating that the layer is dirty
     */
    public isDirty(): boolean {
        throw new MethodNotImplemented();
    }

    /**
     * Returns collection of removed features
     * @return collection of removed features
     */
    public getRemovedFeatures(): FeatureCollection {
        throw new MethodNotImplemented();
    }

    /**
     * Adds features to removed
     * @param features - single feature or collection
     */
    public setRemovedFeatures(features: Feature | FeatureCollection): void  {
        throw new MethodNotImplemented();
    }

    /**
     * Returns feature popup template
     * @return feature popup template
     */
    public getFeaturePopupTemplate(): string  {
        throw new MethodNotImplemented();
    }
    
    /**
     * Sets feature popup template
     * @param template - feature popup template
     */
    public setFeaturePopupTemplate(template: string): void  {
        throw new MethodNotImplemented();
    }

    /**
     * Returns feature popup CSS
     * @return feature popup CSS
     */
     public getFeaturePopupCss(): string  {
        throw new MethodNotImplemented();
    }
    
    /**
     * Sets feature popup CSS
     * @param css - feature popup CSS
     */
    public setFeaturePopupCss(css: string): void  {
        throw new MethodNotImplemented();
    }

    /**
     * Creates feature from vertices
     * @param items - feature vertices along with their ids and coordinates
     * @param srsId - SRS Id of geometry items
     * @return resulting feature
     */
    public createFeatureFromVertices(items: GeometryItem[], srsId?: number): Feature {
        throw new MethodNotImplemented();
    }

    /**
     * Returns loading tiles count
     * @return loading tiles count
     */
    public getLoadingTilesCount(): number { 
        throw new MethodNotImplemented();
    }

    /**
     * Sets loading tiles count
     * @param count - loading tiles count
     */
    public setLoadingTilesCount(count: number): void {
        throw new MethodNotImplemented();
    }

    /**
     * Returns loaded tiles count
     * @return loaded tiles count
     */
    public getLoadedTilesCount(): number { 
        throw new MethodNotImplemented();
    }

    /**
     * Sets loaded tiles count
     * @param count - loaded tiles count
     */
    public setLoadedTilesCount(count: number): void {
        throw new MethodNotImplemented();
    }

}