import { Tile as OlTileLayer } from "ol/layer"
import { Tile as OlTileSource } from "ol/source"
import BaseLayer from "../BaseLayer"
import SourceType from "../../Source/SourceType"
import SourceInterface from "../../Source/SourceInterface"

/** @class VectorLayer */
export default class TileLayer extends BaseLayer {
    
    /**
     * @constructor
     * @memberof TileLayer
     */
    constructor() {
        super();
        this.layer = new OlTileLayer();
    }

    public getType(): SourceType { 
        return this.layer.getSource().getType();
    }

    public getSource(): SourceInterface {
        return this.layer.getSource();
    }

    public setSource(source: SourceInterface): void {
        this.layer.setSource(<OlTileSource> source.getSource());
    }

    public setUrl(url: string): void {
        const source = <OlTileSource> this.layer.getSource();
        source.setUrl(url);
    }

    
}