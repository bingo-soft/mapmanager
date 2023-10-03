import OlBaseEvent from "ol/events/Event";
import { FeatureLoader } from "ol/featureloader";
import { LoadFunction, UrlFunction } from "ol/Tile";
import { Source as OlSource } from "ol/source";
import LayerInterface from "./LayerInterface";
import SourceType from "../Source/SourceType";
import VectorSource from "../Source/Impl/VectorSource";
import XYZSource from "../Source/Impl/XYZSource";
import TileArcGISRestSource from "../Source/Impl/TileArcGISRestSource";
import ImageArcGISRestSource from "../Source/Impl/ImageArcGISRestSource";
import TileWMSSource from "../Source/Impl/TileWMSSource";
import ClusterSource from "../Source/Impl/ClusterSource";
import StyleBuilder from "../Style/StyleBuilder";
import EventBus from "../EventHandlerCollection/EventBus";
import EventType from "../EventHandlerCollection/EventType";
import VectorTileSource from "../Source/Impl/VectorTileSource";

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
     * Returns layer
     * @return layer
     */
    public getLayer(): LayerInterface {
        return this.layer;
    }

    /**
     * Sets layer's source
     * @param type - source type
     * @param opts - options
     * @return layer builder instance
     */
    public setSource(type: SourceType, opts?: unknown): LayerBuilder {
        this.layer.setType(type);
        switch (type) {
            case SourceType.Vector:
                this.layer.setSource(new VectorSource());
                break;
            case SourceType.VectorTile:
                this.layer.setSource(new VectorTileSource(opts["format"]));
                break;
            case SourceType.Cluster:
                const distance = opts["style"] && opts["style"]["point"] ? opts["style"]["point"]["cluster_distance"] : null;
                this.layer.setSource(new ClusterSource(distance));
                break;
            case SourceType.TileWMS:
                this.layer.setSource(new TileWMSSource(opts));
                break;
            case SourceType.XYZ:
                this.layer.setSource(new XYZSource());
                break;
            case SourceType.TileArcGISRest:
                this.layer.setSource(new TileArcGISRestSource());
                break;
            case SourceType.ImageArcGISRest:
                this.layer.setSource(new ImageArcGISRestSource());
                break;
            default:
                break;
        }
        return this;
    }

    /**
     * Returns layer's source
     * @return source
     */
    public getSource(): OlSource {
        return this.layer.getLayer().getSource();
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
     * Sets layer property
     * @param name - property name
     * @param property - property value
     */
    public setProperty(name: string, value: unknown): LayerBuilder {
        this.layer.setProperty(name, value);
        return this;
    }

    /**
     * Sets layer's loader
     * @param loader - loader function
     * @return layer builder instance
     */
    public setLoader(loader: FeatureLoader): LayerBuilder {
        this.layer.setLoader(loader);
        return this;
    }

    /**
     * Sets layer's options
     * @param options - options
     * @return layer builder instance
     */
    public setOptions(options: unknown): LayerBuilder {
        this.layer.setOptions(options);
        return this;
    }

    /**
     * Sets layer's tile url function
     * @param loader - tile url function
     * @return layer builder instance
     */
    public setTileUrlFunction(loader: UrlFunction): LayerBuilder {
        this.layer.setTileUrlFunction(loader);
        return this;
    }

    /**
     * Sets layer's tile loader
     * @param loader - loader function
     * @return layer builder instance
     */
    public setTileLoadFunction(loader: LoadFunction): LayerBuilder {
        this.layer.setTileLoadFunction(loader);
        return this;
    }

    /**
     * Sets layer's tile index
     * @param json - json
     */
    public setTileIndex(json: unknown): LayerBuilder {
        this.layer.setTileIndex(json);
        return this;
    }

    /**
     * Sets layer's source format
     * @param format - source format
     * @return layer builder instance
     */
    public setFormat(format: string): LayerBuilder {
        this.layer.setFormat(format);
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
        this.layer.setStyle((new StyleBuilder(opts, this.layer)).build());
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
     * Sets feature popup CSS
     * @param template - feature popup CSS
     */
    public setFeaturePopupCss(css: string): void  {
        this.layer.setFeaturePopupCss(css);
    }

    /**
     * Sets vertex highlight style
     * @param style - vertex highlight style
     */
    public setVertexHighlightStyle(style: unknown): void  {
        this.layer.setVertexHighlightStyle(style);
    }

    /**
     * Sets layer's load callback
     * @param callback - callback
     * @return layer builder instance
     */
    public setLoadCallback(callback: (layer: LayerInterface) => void): LayerBuilder {
        if (typeof callback === "function") {
            const listenerVector = (e: OlBaseEvent): void => {
                if (e.target.getState() == "ready" && this.layer) {
                    callback(this.layer);
                    e.target.un(EventType.Change, listenerVector);
                }
            }
            const layerType = this.layer.getType();
            if (layerType == SourceType.Vector || layerType == SourceType.VectorTile || layerType == SourceType.Cluster) {
                this.layer.setEventHandler(EventType.Change, "LayerVectorLoadEventHanler", listenerVector);
            } else {
                this.layer.setEventHandler(EventType.TileLoadStart, "LayerTileLoadStartEventHanler", () => {
                    this.layer.setLoadingTilesCount(this.layer.getLoadingTilesCount()+1);
                });
                this.layer.setEventHandler(EventType.TileLoadError, "LayerTileLoadErrorEventHanler", () => {
                    this.layer.setLoadedTilesCount(this.layer.getLoadedTilesCount()+1);
                });
                this.layer.setEventHandler(EventType.TileLoadEnd, "LayerTileLoadEndEventHanler", () => {
                   /*  setTimeout(() => { */
                        let loadedCount = this.layer.getLoadedTilesCount();
                        if (loadedCount != -1) { // we don't want to call the callback more than once
                            this.layer.setLoadedTilesCount(++loadedCount);
                            if (loadedCount == this.layer.getLoadingTilesCount()) {
                                //this.layer.setLoadingTilesCount(0);
                                this.layer.setLoadedTilesCount(-1);  // we don't want to call the callback more than once
                                callback(this.layer); 
                            }
                        }
                    /* }, 100); */
                });
            }
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