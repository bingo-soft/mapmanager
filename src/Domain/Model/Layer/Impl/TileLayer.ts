import { Tile as OlTileLayer } from "ol/layer";
import { Source as OlSource } from "ol/source";
import { TileImage as OlTileImage } from "ol/source";
import AbstractLayer from "../AbstractLayer";
import SourceType from "../../Source/SourceType";
import SourceInterface from "../../Source/SourceInterface";
import EventHandlerCollection from "../../EventHandlerCollection/EventHandlerCollection";

/** @class TileLayer */
export default class TileLayer extends AbstractLayer {
    private type: SourceType;
    
    /**
     * @constructor
     * @memberof TileLayer
     */
    constructor() {
        super();
        this.layer = new OlTileLayer();
    }

    /**
     * Returns layer type
     *
     * @function getType
     * @memberof TileLayer
     * @return {String} layer type
     */
    public getType(): SourceType { 
        return this.type;
    }

    /**
     * Sets layer type
     *
     * @function setType
     * @memberof TileLayer
     * @param {String} type - layer type
     */
    public setType(type: SourceType): void { 
        this.type = type;
    } 

    /**
     * Returns layer's source
     *
     * @function getSource
     * @memberof TileLayer
     * @return {Object} layer source
     */
    public getSource(): OlSource {
        return this.layer.getSource();
    }

    /**
     * Sets layer's source
     *
     * @function setSource
     * @memberof TileLayer
     * @param {Object} source - source instance
     */
    public setSource(source: SourceInterface): void {
        const olSource: OlTileImage = <OlTileImage> source.getSource()
        this.layer.setSource(olSource);
        this.eventHandlers = new EventHandlerCollection(olSource);
    }

    /**
     * Sets layer's source url
     *
     * @function setUrl
     * @memberof TileLayer
     * @param {String} url - source url
     */
    public setUrl(url: string): void {
        (<OlTileImage> this.layer.getSource()).setUrl(url);
    }

    
}