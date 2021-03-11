import { Vector as OlVectorSource } from "ol/source"
import { Extent as olExtent } from "ol/extent"
import GeoJSON from "ol/format/GeoJSON"
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
        this.source = new OlVectorSource({
            format: new GeoJSON()
        });
    }

    public getType(): SourceType {
        return SourceType.Vector;
    }

    public getExtent(): olExtent {
        const source = <OlVectorSource> this.source;
        return source.getExtent();
    }

}