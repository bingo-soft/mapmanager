import OlBaseEvent from "ol/events/Event";
import LayerInterface from "./LayerInterface";
import SourceType from "../Source/SourceType";
import VectorSource from "../Source/Impl/VectorSource";
import XYZSource from "../Source/Impl/XYZSource";
import TileArcGISRestSource from "../Source/Impl/TileArcGISRestSource";
import TileWMSSource from "../Source/Impl/TileWMSSource";
import StyleBuilder from "../Style/StyleBuilder";
import EventType from "../EventHandlerCollection/EventType";
import VectorLayer from "ol/layer/Vector";

/** @class LayerBuilder */
export default class LayerBuilder {
    private layer: LayerInterface;

    /**
     * @constructor
     * @memberof LayerBuilder
     * @param {Object} layer - layer
     */
    constructor(layer: LayerInterface) {
        this.layer = layer;
    }

    /**
     * Sets layer's source type
     *
     * @function setSource
     * @memberof LayerBuilder
     * @param {String} type - source type
     * @return {Object} layer builder instance
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

    /**
     * Sets layer's loader
     *
     * @function setLoader
     * @memberof LayerBuilder
     * @param {Function} loader - loader function
     * @return {Object} layer builder instance
     */
    public setLoader(loader: () => Promise<string>): LayerBuilder {
        this.layer.setLoader(loader);
        return this;
    }

    /**
     * Sets layer's source url
     *
     * @function setUrl
     * @memberof LayerBuilder
     * @param {String} url - source url
     * @return {Object} layer builder instance
     */
    public setUrl(url: string): LayerBuilder {
        this.layer.setUrl(url);
        return this;
    }

    /**
     * Sets layer's style
     *
     * @function setStyle
     * @memberof LayerBuilder
     * @param {Object} opts - options
     * @return {Object} layer builder instance
     */
    public setStyle(opts?: unknown): LayerBuilder {
        this.layer.setStyle((new StyleBuilder(opts)).build());
        return this;
    }

    /**
     * Sets layer's load callback
     *
     * @function setLoadCallback
     * @memberof LayerBuilder
     * @param {Function} callback - load callback
     * @return {Object} layer builder instance
     */
    public setLoadCallback(callback: () => void): LayerBuilder {
        if (typeof callback === "function") {
            this.layer.getEventHandlers().add(EventType.Change, "LayerLoadEventHanler", (e: OlBaseEvent): void => {
                if (e.target.getState() == "ready") {
                    callback();
                    //e.target.un("change", listener);                
                }
            });
        }
        return this;
    }

    /**
     * Builds layer
     *
     * @function build
     * @memberof LayerBuilder
     * @return {Object} - layer instance
     */
    public build(): LayerInterface {
        console.log((<VectorLayer> this.layer.getLayer()).getSource().getFeatures());
        return this.layer;
    }
}