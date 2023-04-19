import OlVectorTileSource from "ol/source/VectorTile";
import BaseSource from "../BaseSource";
import SourceType from "../SourceType";

/** VectorTileSource */
export default class VectorTileSource extends BaseSource {
    
    constructor() {
        super();
        this.source = new OlVectorTileSource({});
    }

    /**
     * Returns type of source
     * @return type of source
     */
    public getType(): SourceType {
        return SourceType.VectorTile;
    }

}