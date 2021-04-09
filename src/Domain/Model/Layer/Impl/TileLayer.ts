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

    public getType(): SourceType { 
        return this.type;
    }

    public setType(type: SourceType): void { 
        this.type = type;
    } 

    public getSource(): OlSource {
        return this.layer.getSource();
    }

    public setSource(source: SourceInterface): void {
        const olSource: OlTileImage = <OlTileImage> source.getSource()
        this.layer.setSource(olSource);
        this.eventHandlers = new EventHandlerCollection(olSource);
    }

    public setUrl(url: string): void {
        (<OlTileImage> this.layer.getSource()).setUrl(url);
    }

    
}