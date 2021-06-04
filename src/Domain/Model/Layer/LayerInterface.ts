import OlLayer from "ol/layer/Layer";
import { Source as OlSource } from "ol/source";
import SourceType from "../Source/SourceType";
import SourceInterface from "../Source/SourceInterface";
import EventHandlerCollection from "../EventHandlerCollection/EventHandlerCollection";
import StyleFunction from "../Style/StyleFunctionType";
import FeatureCollection from "../Feature/FeatureCollection";

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
     * Returns layer's properties
     *
     * @function getProperties
     * @memberof LayerInterface
     * @return {Object} layer's properties
     */
    getProperties(): unknown;
    
    /**
     * Sets layer's properties
     *
     * @function setProperties
     * @memberof LayerInterface
     * @return {Object} layer's properties
     */
    setProperties(source: unknown): void;
    
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
     * Sets layer's source params
     *
     * @function setParams
     * @memberof LayerInterface
     * @param {Object} = params
     */
    setParams(params: unknown): void;
    
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

    /**
     * Returns collection of dirty features
     *
     * @function getDirtyFeatures
     * @memberof LayerInterface
     * @return {Object} collection of dirty features
     */
    getDirtyFeatures(): FeatureCollection;

    /**
     * Adds or removes dirty features
     *
     * @function setDirtyFeatures
     * @memberof VectorLayer
     * @param {Object} features - features to be set
     * @param {Boolean} dirty - dirty flag. If true, features are added to layer's dirty features collection, removed otherwise
     */
    setDirtyFeatures(features: FeatureCollection, dirty: boolean): void;

    /**
     * Checks if layer is dirty
     *
     * @function isDirty
     * @memberof LayerInterface
     * @return {Boolean} flag if layer is dirty
     */
    isDirty(): boolean;
}