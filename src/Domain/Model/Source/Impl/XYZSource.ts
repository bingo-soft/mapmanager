//import { Tile as OlTileSource } from "ol/source"
import OlXYZ from "ol/source/XYZ";
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
        this.source = new OlXYZ();
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
