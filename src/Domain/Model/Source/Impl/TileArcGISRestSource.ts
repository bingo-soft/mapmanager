//import { Tile as OlTileSource } from "ol/source"
import OlTileArcGISRest from 'ol/source/TileArcGISRest';
import BaseSource from "../BaseSource";
import SourceType from "../SourceType";

/** @class TileArcGISRestSource */
export default class TileArcGISRestSource extends BaseSource {
    
    /**
     * @constructor
     * @memberof TileArcGISRestSource
     */
    constructor() {
        super();
        this.source = new OlTileArcGISRest();
    }

    public getType(): SourceType {
        return SourceType.TileArcGISRest;
    }

    
}