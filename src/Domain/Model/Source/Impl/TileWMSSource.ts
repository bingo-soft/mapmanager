//import { Tile as OlTileSource } from "ol/source"
import OlTileWMSSource from "ol/source/TileWMS";
import BaseSource from "../BaseSource";
import SourceType from "../SourceType";

/** @class XYZSource */
export default class TileWMSSource extends BaseSource {
    
    /**
     * @constructor
     * @memberof TileWMSSource
     */
    constructor() {
        super();
        this.source = new OlTileWMSSource({
            params: {},
            crossOrigin: "anonymous"
        });
    }

    /**
     * Returns type of source
     *
     * @function getType
     * @memberof TileWMSSource
     * @return {String} type of source
     */
    public getType(): SourceType {
        return SourceType.TileWMS;
    }
   
}
