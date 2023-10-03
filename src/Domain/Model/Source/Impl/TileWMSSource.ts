//import { Tile as OlTileSource } from "ol/source"
import OlTileWMSSource from "ol/source/TileWMS";
import BaseSource from "../BaseSource";
import SourceType from "../SourceType";

/** XYZSource */
export default class TileWMSSource extends BaseSource {
    
    constructor(opts: unknown) {
        super();
        const url = new URL(opts["request"]["base_url"], window.location.origin);
        let params = {};
        let projection = '';
        if (url.searchParams) {
            params = {
                "SERVICE": "WMS",
                "VERSION": url.searchParams.get("version"),
                "REQUEST": "GetMap",
                "LAYERS": url.searchParams.get("layers")
            }
            projection = url.searchParams.get("srs") || url.searchParams.get("crs");
        }
        this.source = new OlTileWMSSource({
            params: params,
            projection: projection,
            crossOrigin: "anonymous"
        });
    }

    /**
     * Returns type of source
     * @return type of source
     */
    public getType(): SourceType {
        return SourceType.TileWMS;
    }
   
}
