import OlTileArcGISRestSource from "ol/source/TileArcGISRest";
import BaseSource from "../BaseSource";
import SourceType from "../SourceType";

/** TileArcGISRestSource */
export default class TileArcGISRestSource extends BaseSource {
    
    constructor() {
        super();
        this.source = new OlTileArcGISRestSource({
            params: {},
            crossOrigin: "anonymous"/* ,
            params: {
                "LAYERS": "show:21",
                "FORMAT": "PNG8",
                //"IMAGESR": 102001,
                //"BBOXSR": 102001,
                //"DPI": 96
            } */
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