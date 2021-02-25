import { Vector as OlVectorSource } from "ol/source"
import BaseSource from "../BaseSource"
import SourceType from "../SourceType"

/** @class VectorSource */
export default class VectorSource extends BaseSource {
    
    /**
     * @constructor
     * @memberof VectorSource
     */
    constructor() {
        super();
        this.source = new OlVectorSource();
    }

    public getType(): SourceType {
        return SourceType.Vector;
    }

}