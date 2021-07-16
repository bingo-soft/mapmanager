import { Vector as OlVectorSource } from "ol/source";
import { Extent as OlExtent } from "ol/extent";
import * as OlLoadingstrategy from 'ol/loadingstrategy';
import OlGeoJSON from "ol/format/GeoJSON";
import BaseSource from "../BaseSource";
import SourceType from "../SourceType";

/** VectorSource */
export default class VectorSource extends BaseSource {
    
    constructor() {
        super();
        this.source = new OlVectorSource({
            format: new OlGeoJSON()/* ,
            strategy: OlLoadingstrategy.bbox */
        });
    }

    /**
     * Returns type of source
     * @return type of source
     */
    public getType(): SourceType {
        return SourceType.Vector;
    }

    /**
     * Returns extent of source
     * @return {Array} extent of source
     */
    public getExtent(): OlExtent {
        return (<OlVectorSource> this.source).getExtent();
    }

}