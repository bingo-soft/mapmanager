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
            format: new OlGeoJSON(/* {
                dataProjection: "EPSG:4326",
                featureProjection: "EPSG:3857"
            } */)/* ,
            strategy: OlLoadingstrategy.bbox */
        });
    }

    /**
     * Returns type of source
     *
     * @function getType
     * @memberof VectorSource
     * @return {String} type of source
     */
    public getType(): SourceType {
        return SourceType.Vector;
    }

    /**
     * Returns extent of source
     *
     * @function getExtent
     * @memberof VectorSource
     * @return {Array} extent of source
     */
    public getExtent(): OlExtent {
        const source = <OlVectorSource> this.source;
        return source.getExtent();
    }

}