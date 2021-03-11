//import { Tile as OlTileSource } from "ol/source"
import TileArcGISRest from 'ol/source/TileArcGISRest';
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
        this.source = new TileArcGISRest();
    }

    public getType(): SourceType {
        return SourceType.TileArcGISRest;
    }

    
}