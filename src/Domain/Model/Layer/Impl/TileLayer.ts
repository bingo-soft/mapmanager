import { Tile as OlTileLayer } from "ol/layer";
import { Source as OlSource } from "ol/source";
import { TileImage as OlTileImage } from "ol/source";
import OlTileWMSSource from "ol/source/TileWMS";
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
     * Sets layer's source url
     *
     * @function setUrl
     * @memberof TileLayer
     * @param {String} url - source url
     */
    public setUrl(url: string): void {
        (<OlTileImage> this.layer.getSource()).setUrl(url);
    }

    /**
     * Sets layer's source params
     *
     * @function setParams
     * @memberof TileLayer
     * @param {Object} = params
     */
    public setParams(params: unknown): void {
        if (this.type == SourceType.TileWMS) {
            (<OlTileWMSSource> this.layer.getSource()).updateParams(params);
        }
    }

    
}