//import { Tile as OlTileSource } from "ol/source"
import OlTileWMSSource from "ol/source/TileWMS";
import BaseSource from "../BaseSource";
import SourceType from "../SourceType";

/** XYZSource */
export default class TileWMSSource extends BaseSource {
    
    constructor() {
        super();
        this.source = new OlTileWMSSource({
            params: {},
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
