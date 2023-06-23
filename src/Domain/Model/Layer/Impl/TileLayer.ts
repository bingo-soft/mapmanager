import { Tile as OlTileLayer } from "ol/layer";
import { TileImage as OlTileImage } from "ol/source";
import OlTileWMSSource from "ol/source/TileWMS";
import OlTileArcGISRestSource from "ol/source/TileArcGISRest";
import AbstractLayer from "../AbstractLayer";
import SourceType from "../../Source/SourceType";

/** TileLayer */
export default class TileLayer extends AbstractLayer {
    private loadingTiles = 0;
    private loadedTiles = 0;
    
    constructor(opts?: unknown) {
        super();
        this.layer = new OlTileLayer();
        if (typeof opts !== "undefined") {
            if (Object.prototype.hasOwnProperty.call(opts, "min_zoom") && typeof opts["min_zoom"] == "number") {
                this.layer.setMinZoom(opts["min_zoom"]-1);
            }
            if (Object.prototype.hasOwnProperty.call(opts, "max_zoom") && typeof opts["max_zoom"] == "number") {
                this.layer.setMaxZoom(opts["max_zoom"]);
            }
            if (Object.prototype.hasOwnProperty.call(opts, "url")) {
                this.properties["urlParts"] = new URL(opts["url"]); 
            }
        }
    }

    /**
     * Returns layer's sourceURL
     * @return layer's source URL
     */
    public getUrl(): string {
        return (<OlTileImage> this.layer.getSource()).getUrls()[0];
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
        if (this.type == SourceType.TileArcGISRest) {
            (<OlTileArcGISRestSource> this.layer.getSource()).updateParams(params);
        }
    }

    /**
     * Returns loading tiles count
     * @return loading tiles count
     */
    public getLoadingTilesCount(): number { 
        return this.loadingTiles;
    }

    /**
     * Sets loading tiles count
     * @param count - loading tiles count
     */
    public setLoadingTilesCount(count: number): void {
        this.loadingTiles = count;
    }

    /**
     * Returns loaded tiles count
     * @return loaded tiles count
     */
    public getLoadedTilesCount(): number { 
        return this.loadedTiles;
    }

    /**
     * Sets loaded tiles count
     * @param count - loaded tiles count
     */
    public setLoadedTilesCount(count: number): void {
        this.loadedTiles = count;
    }
}