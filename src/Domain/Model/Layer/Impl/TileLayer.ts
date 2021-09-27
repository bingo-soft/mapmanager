import { Tile as OlTileLayer } from "ol/layer";
import { TileImage as OlTileImage } from "ol/source";
import OlTileWMSSource from "ol/source/TileWMS";
import AbstractLayer from "../AbstractLayer";
import SourceType from "../../Source/SourceType";

/** TileLayer */
export default class TileLayer extends AbstractLayer {
    private type: SourceType;
    
    constructor(opts?: unknown) {
        super();
        this.layer = new OlTileLayer();
        if (typeof opts !== "undefined" && Object.prototype.hasOwnProperty.call(opts, "min_zoom") && typeof opts["min_zoom"] == "number") {
            this.layer.setMinZoom(opts["min_zoom"]-1);
        }
        if (typeof opts !== "undefined" && Object.prototype.hasOwnProperty.call(opts, "max_zoom") && typeof opts["max_zoom"] == "number") {
            this.layer.setMaxZoom(opts["max_zoom"]);
        }
    }

    /**
     * Returns layer type
     * @return layer type
     */
    public getType(): SourceType { 
        return this.type;
    }

    /**
     * Sets layer type
     * @param type - layer type
     */
    public setType(type: SourceType): void { 
        this.type = type;
    } 

    /**
     * Sets layer's source url
     * @param url - source url
     */
    public setUrl(url: string): void {
        (<OlTileImage> this.layer.getSource()).setUrl(url);
    }

    /**
     * Sets layer's source params
     * @param - params
     */
    public setParams(params: unknown): void {
        if (this.type == SourceType.TileWMS) {
            (<OlTileWMSSource> this.layer.getSource()).updateParams(params);
        }
    }

    
}