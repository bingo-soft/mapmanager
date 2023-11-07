import OlMVT from 'ol/format/MVT';
import OlGeoJSON from 'ol/format/GeoJSON';
import OlProjection from "ol/proj/Projection";
import OlVectorTileSource from "ol/source/VectorTile";
import BaseSource from "../BaseSource";
import SourceType from "../SourceType";
import VectorTileSourceFormat from "../VectorTileSourceFormat";

/** VectorTileSource */
export default class VectorTileSource extends BaseSource {
    
    constructor(format: string) {
        super();
        format = format ? format : VectorTileSourceFormat.MVT;
        this.source = new OlVectorTileSource({
            format: format == VectorTileSourceFormat.GeoJSON ? new OlGeoJSON({ dataProjection: new OlProjection({ code: 'TILE_PIXELS', units: 'tile-pixels', extent: [0, 0, 4096, 4096] }) }) : new OlMVT()
        });
    }

    /**
     * Returns type of source
     * @return type of source
     */
    public getType(): SourceType {
        return SourceType.VectorTile;
    }

}