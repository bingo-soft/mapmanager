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

/** AbstractLayer */
export default abstract class AbstractLayer implements LayerInterface
{
    protected layer: OlLayer;
    protected properties: unknown;
    protected eventHandlers: EventHandlerCollection;
    protected srsId: number;
    protected eventBus: EventBus;

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
    public abstract getType(): SourceType;

    /**
     * Sets layer's source type
     * @param type - layer's source type
     */
    public setType(type: SourceType): void {
        throw new MethodNotImplemented();
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
    public setLoader(loader: () => Promise<string>): void {
        throw new MethodNotImplemented();
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
     * @param params - source url
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
     * Sets collection of dirty features
     * @param features - collection of dirty features
     * @param dirty - dirty flag. If true, features are added to layer's dirty features collection, removed otherwise
     */
    public setDirtyFeatures(features: FeatureCollection, dirty: boolean): void  {
        throw new MethodNotImplemented();
    }

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
     * Creates feature from vertices
     * @param items - of feature vertices along with their ids and coordinates
     * @return resulting feature
     */
    public createFeatureFromVertices(items: GeometryItem[]): Feature {
        throw new MethodNotImplemented();
    }



}