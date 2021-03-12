//import { Tile as OlTileSource } from "ol/source"
import XYZ from "ol/source/XYZ";
import BaseSource from "../BaseSource"
import SourceType from "../SourceType"

/** @class XYZSource */
export default class XYZSource extends BaseSource {
    
    /**
     * @constructor
     * @memberof XYZSource
     */
    constructor() {
        super();
        this.source = new XYZ();
    }

    public getType(): SourceType {
        return SourceType.XYZ;
    }

    
}
