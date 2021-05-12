import OlLayer from "ol/layer/Layer";
import { Source as OlSource } from "ol/source";
import SourceType from "../Source/SourceType";
import SourceInterface from "../Source/SourceInterface";
import EventHandlerCollection from "../EventHandlerCollection/EventHandlerCollection";
import StyleFunction from "../Style/StyleFunctionType";

/** @interface LayerInterface */
export default interface LayerInterface
{
    /**
     * Returns Openlayers layer instance
     *
     * @function getLayer
     * @memberof LayerInterface
     * @return {Object} layer instance
     */
    getLayer(): OlLayer;

    /**
     * Returns layer's event handlers
     *
     * @function getEventHandlers
     * @memberof LayerInterface
     * @return {Object} layer's event handlers
     */
    getEventHandlers(): EventHandlerCollection; 
    
    /**
     * Returns layer's source type
     *
     * @function getType
     * @memberof LayerInterface
     * @return {String} layer's source type
     */
    getType(): SourceType;
    
    /**
     * Sets layer's source type
     *
     * @function setType
     * @memberof LayerInterface
     * @param {String} - layer's source type
     */
    setType(type: SourceType): void;
    
    /**
     * Returns layer's SRS
     *
     * @function getSRS
     * @memberof LayerInterface
     * @return {String} layer's SRS
     */
    getSRS(): string;
    
    /**
     * Returns layer's Openlayers source instance
     *
     * @function getSource
     * @memberof 
     * @memberof LayerInterface
     * @return {Object} layer's Openlayers source instance
     */
    getSource(): OlSource;
    
    /**
     * Sets layer's Openlayers source instance
     *
     * @function setSource
     * @memberof LayerInterface
     * @param {Object} source - layer's Openlayers source instance
     */
    setSource(source: SourceInterface): void;
    
    /**
     * Sets layer's loader
     *
     * @function setLoader
     * @memberof LayerInterface
     * @param {Function} loader - loader function
     */
    setLoader(loader: () => Promise<string>): void;
    
    /**
     * Sets layer's source url
     *
     * @function setUrl
     * @memberof LayerInterface
     * @param {String} url - source url
     */
    setUrl(url: string): void;
    
    /**
     * Sets layer's zIndex
     *
     * @function setZIndex
     * @memberof LayerInterface
     * @param {Number} zIndex - zIndex
     */
    setZIndex(zIndex: number): void;
    
    /**
     * Sets layer's opacity
     *
     * @function setOpacity
     * @memberof LayerInterface
     * @param {Number} opacity - opacity
     */
    setOpacity(opacity: number): void;
    
    /**
     * Sets layer's style
     *
     * @function setStyle
     * @memberof LayerInterface
     * @param {Function} style - style function
     */
    setStyle(style: StyleFunction): void;
}