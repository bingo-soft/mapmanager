import OlTileArcGISRestSource from "ol/source/TileArcGISRest";
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
        this.source = new OlTileArcGISRestSource();
    }

    /**
     * Returns type of source
     *
     * @function getType
     * @memberof TileArcGISRestSource
     * @return {String} type of source
     */
    public getType(): SourceType {
        return SourceType.TileArcGISRest;
    }

    
}