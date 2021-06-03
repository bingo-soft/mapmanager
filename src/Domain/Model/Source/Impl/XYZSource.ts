//import { Tile as OlTileSource } from "ol/source"
import OlXYZSource from "ol/source/XYZ";
import BaseSource from "../BaseSource";
import SourceType from "../SourceType";

/** @class XYZSource */
export default class XYZSource extends BaseSource {
    
    /**
     * @constructor
     * @memberof XYZSource
     */
    constructor() {
        super();
        this.source = new OlXYZSource({
            crossOrigin: "anonymous"
        });
    }

    /**
     * Returns type of source
     *
     * @function getType
     * @memberof XYZSource
     * @return {String} type of source
     */
    public getType(): SourceType {
        return SourceType.XYZ;
    }

    
}
