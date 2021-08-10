import OlBaseEvent from "ol/events/Event";
import LayerInterface from "./LayerInterface";
import SourceType from "../Source/SourceType";
import VectorSource from "../Source/Impl/VectorSource";
import XYZSource from "../Source/Impl/XYZSource";
import TileArcGISRestSource from "../Source/Impl/TileArcGISRestSource";
import TileWMSSource from "../Source/Impl/TileWMSSource";
import StyleBuilder from "../Style/StyleBuilder";
import EventBus from "../EventHandlerCollection/EventBus";
import EventType from "../EventHandlerCollection/EventType";

/** LayerBuilder */
export default class LayerBuilder {
    
    private layer: LayerInterface;

    /**
     * @param layer - layer to build
     */
    constructor(layer: LayerInterface) {
        this.layer = layer;
    }

    /**
     * Sets layer's source type
     * @param type - source type
     * @return layer builder instance
     */
    public setSource(type: SourceType): LayerBuilder {
        switch (type) {
            case SourceType.Vector:
                this.layer.setSource(new VectorSource());
                break;
           case SourceType.TileWMS:
                this.layer.setSource(new TileWMSSource());
                this.layer.setType(type);
                break;
            case SourceType.XYZ:
                this.layer.setSource(new XYZSource());
                this.layer.setType(type);
                break;
            case SourceType.TileArcGISRest:
                this.layer.setSource(new TileArcGISRestSource());
                this.layer.setType(type);
                break;
            default:
                break;
        }
        return this;
    }

    public setEventBus(eventBus: EventBus): void {
        this.layer.setEventBus(eventBus);
    }

    /**
     * Sets layer's properties
     * @return layer's properties
     */
     public setProperties(properties: unknown): LayerBuilder {
        this.layer.setProperties(properties);
        return this;
    }

    /**
     * Sets layer's loader
     * @param loader - loader function
     * @return layer builder instance
     */
    public setLoader(loader: () => Promise<string>): LayerBuilder {
        this.layer.setLoader(loader);
        return this;
    }

    /**
     * Sets layer's source url
     * @param url - source url
     * @return layer builder instance
     */
    public setUrl(url: string): LayerBuilder {
        this.layer.setUrl(url);
        return this;
    }

    /**
     * Sets layer's source params
     * @param params - params
     */
    public setParams(params: unknown): void {
        this.layer.setParams(params);
    }

    /**
     * Sets layer's style
     * @param opts - options
     * @return layer builder instance
     */
    public setStyle(opts?: unknown): LayerBuilder {
        this.layer.setStyle((new StyleBuilder(opts)).build());
        return this;
    }

    /**
     * Sets feature popup template
     * @param template - feature popup template
     */
    public setFeaturePopupTemplate(template: string): void  {
        this.layer.setFeaturePopupTemplate(template);
    }

    /**
     * Sets layer's load callback
     * @param callback - callback
     * @return layer builder instance
     */
    public setLoadCallback(callback: (layer: LayerInterface) => void): LayerBuilder {
        if (typeof callback === "function") {
            const listener = (e: OlBaseEvent): void => {
                if (e.target.getState() == "ready" && this.layer) {
                    callback(this.layer);
                    e.target.un("change", listener);
                }
            }
            this.layer.setEventHandler(EventType.Change, "LayerLoadEventHanler", listener);
        }
        return this;
    }

    /**
     * Builds layer
     * @return layer instance
     */
    public build(): LayerInterface {
        return this.layer;
    }
}