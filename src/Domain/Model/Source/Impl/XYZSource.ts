//import { Tile as OlTileSource } from "ol/source"
import XYZ from "ol/source/XYZ";
import BaseSource from "../BaseSource"
import SourceType from "../SourceType"

/** @class VectorSource */
export default class TileSource extends BaseSource {
    
    /**
     * @constructor
     * @memberof TileSource
     */
    constructor() {
        super();
        this.source = new XYZ();
    }

    public getType(): SourceType {
        return SourceType.XYZ;
    }

    
}