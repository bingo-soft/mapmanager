import OlTileArcGISRestSource from "ol/source/TileArcGISRest";
import BaseSource from "../BaseSource";
import SourceType from "../SourceType";

/** TileArcGISRestSource */
export default class TileArcGISRestSource extends BaseSource {
    
    constructor() {
        super();
        this.source = new OlTileArcGISRestSource({
            crossOrigin: "anonymous"
        });
    }

    /**
     * Returns type of source
     * @return type of source
     */
    public getType(): SourceType {
        return SourceType.TileArcGISRest;
    }

    
}