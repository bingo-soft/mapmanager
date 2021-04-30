import OlLayer from "ol/layer/Layer";
import { Source as OlSource } from "ol/source";
import LayerInterface from "./LayerInterface";
import SourceType from "../Source/SourceType";
import SourceInterface from "../Source/SourceInterface";
import MethodNotImplemented from "../../Exception/MethodNotImplemented";
import EventHandlerCollection from "../EventHandlerCollection/EventHandlerCollection";
import StyleFunction from "../Style/StyleFunctionType";

/** @class AbstractLayer */
export default abstract class AbstractLayer implements LayerInterface
{
    protected layer: OlLayer;
    protected eventHandlers: EventHandlerCollection;
    protected srs: string;

    /**
     * Returns Openlayers layer instance
     *
     * @function getLayer
     * @memberof AbstractLayer
     * @return {Object} layer instance
     */
    public getLayer(): OlLayer {
        return this.layer;
    }

    /**
     * Returns layer's source type
     *
     * @function getType
     * @memberof AbstractLayer
     * @return {String} layer's source type
     */
    public abstract getType(): SourceType;

    /**
     * Sets layer's source type
     *
     * @function setType
     * @memberof AbstractLayer
     * @param {String} - layer's source type
     */
    public setType(type: SourceType): void {
        throw new MethodNotImplemented();
    }

    /**
     * Returns layer's event handlers
     *
     * @function getEventHandlers
     * @memberof AbstractLayer
     * @return {Object} layer's event handlers
     */
    public getEventHandlers(): EventHandlerCollection {
        return this.eventHandlers;
    }

    /**
     * Returns layer's SRS
     *
     * @function getSRS
     * @memberof AbstractLayer
     * @return {String} layer's SRS
     */
    public getSRS(): string {
        return this.srs;
    }

    /**
     * Returns layer's Openlayers source instance
     *
     * @function getSource
     * @memberof AbstractLayer
     * @return {Object} layer's Openlayers source instance
     */
    public abstract getSource(): OlSource;

    /**
     * Sets layer's Openlayers source instance
     *
     * @function setSource
     * @memberof AbstractLayer
     * @param {Object} source - layer's Openlayers source instance
     */
    public abstract setSource(source: SourceInterface): void;    

    /**
     * Sets layer's loader
     *
     * @function setLoader
     * @memberof AbstractLayer
     * @param {Function} loader - loader function
     */
    public setLoader(loader: () => Promise<string>): void {
        throw new MethodNotImplemented();
    }

    /**
     * Sets layer's source url
     *
     * @function setUrl
     * @memberof AbstractLayer
     * @param {String} url - source url
     */
    public setUrl(url: string): void {
        throw new MethodNotImplemented();
    }

    /**
     * Sets layer's zIndex
     *
     * @function setZIndex
     * @memberof AbstractLayer
     * @param {Number} zIndex - zIndex
     */
    public setZIndex(zIndex: number): void {
        this.layer.setZIndex(zIndex);
    }

    /**
     * Sets layer's opacity
     *
     * @function setOpacity
     * @memberof AbstractLayer
     * @param {Number} opacity - opacity
     */
    public setOpacity(opacity: number): void { 
        this.layer.setOpacity(opacity / 100);
    }

    /**
     * Sets layer's style
     *
     * @function setStyle
     * @memberof AbstractLayer
     * @param {Function} style - style function
     */
    public setStyle(style: StyleFunction): void { 
        throw new MethodNotImplemented();
    }

}