import { Image as OlImageLayer } from "ol/layer";
import AbstractLayer from "../AbstractLayer";

/** ImageLayer */
export default class ImageLayer extends AbstractLayer {
    private loadingTiles = 0;
    private loadedTiles = 0;
    
    constructor(opts?: unknown) {
        super();
        this.layer = new OlImageLayer();
        if (typeof opts !== "undefined") {
            if (Object.prototype.hasOwnProperty.call(opts, "min_zoom") && typeof opts["min_zoom"] == "number") {
                this.layer.setMinZoom(opts["min_zoom"]-1);
            }
            if (Object.prototype.hasOwnProperty.call(opts, "max_zoom") && typeof opts["max_zoom"] == "number") {
                this.layer.setMaxZoom(opts["max_zoom"]);
            }
            if (Object.prototype.hasOwnProperty.call(opts, "request") && Object.prototype.hasOwnProperty.call(opts["request"], "base_url")) {
                this.properties["urlParts"] = new URL(opts["request"]["base_url"], window.location.origin); 
            }
        }
    }

    /**
     * Returns layer's source url
     * @return layer's source url
     */
    public getUrl(): string {
        return (<any> this.layer.getSource()).getUrl();
    }

    /**
     * Sets layer's source url
     * @param url - source url
     */
    public setUrl(url: string): void {
        (<any> this.layer.getSource()).setUrl(url);
        console.log(this.layer.getSource())
    }

    /**
     * Sets layer's source params
     * @param - params
     */
    public setParams(params: unknown): void {
        (<any> this.layer.getSource()).updateParams(params);
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