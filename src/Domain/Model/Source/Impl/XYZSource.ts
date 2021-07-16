//import { Tile as OlTileSource } from "ol/source"
import OlXYZSource from "ol/source/XYZ";
import BaseSource from "../BaseSource";
import SourceType from "../SourceType";

/** XYZSource */
export default class XYZSource extends BaseSource {
    
    constructor() {
        super();
        this.source = new OlXYZSource({
            crossOrigin: "anonymous"
        });
    }

    /**
     * Returns type of source
     * @return type of source
     */
    public getType(): SourceType {
        return SourceType.XYZ;
    }

    
}
