import { Vector as OlVectorSource } from "ol/source";
import { Extent as OlExtent } from "ol/extent";
import * as OlLoadingstrategy from 'ol/loadingstrategy';
import OlGeoJSON from "ol/format/GeoJSON";
import BaseSource from "../BaseSource";
import SourceType from "../SourceType";

/** @class VectorSource */
export default class VectorSource extends BaseSource {
    
    /**
     * @constructor
     * @memberof VectorSource
     */
    constructor() {
        super();
        this.source = new OlVectorSource({
            format: new OlGeoJSON()/* ,
            strategy: OlLoadingstrategy.bbox */
        });
    }

    public getType(): SourceType {
        return SourceType.Vector;
    }

    public getExtent(): OlExtent {
        const source = <OlVectorSource> this.source;
        return source.getExtent();
    }

}