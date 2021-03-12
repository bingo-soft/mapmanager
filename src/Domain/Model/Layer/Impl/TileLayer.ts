import { Tile as OlTileLayer } from "ol/layer"
import { Source as OlSource } from "ol/source"
import { TileImage as OlTileImage } from "ol/source"
import BaseLayer from "../BaseLayer"
import SourceType from "../../Source/SourceType"
import SourceInterface from "../../Source/SourceInterface"

/** @class TileLayer */
export default class TileLayer extends BaseLayer {
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
        this.layer.setSource(<OlTileImage> source.getSource());
    }

    public setUrl(url: string): void {
        (<OlTileImage> this.layer.getSource()).setUrl(url);
    }

    
}