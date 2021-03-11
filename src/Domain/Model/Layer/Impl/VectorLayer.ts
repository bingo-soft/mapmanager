import { Vector as OlVectorLayer } from "ol/layer"
import BaseVector from "ol/layer/BaseVector"
import { Vector as OlVectorSource } from "ol/source"
import GeoJSON from "ol/format/GeoJSON"
import Feature from "ol/Feature"
import Style from "ol/style/Style"
import BaseLayer from "../BaseLayer"
import SourceType from "../../Source/SourceType"
import SourceInterface from "../../Source/SourceInterface"

/** @class VectorLayer */
export default class VectorLayer extends BaseLayer {
    
    /**
     * @constructor
     * @memberof VectorLayer
     */
    constructor() {
        super();
        this.layer = new OlVectorLayer();
    }

    public getType(): SourceType {
        return SourceType.Vector;
    }

    public getSource(): SourceInterface {
        return this.layer.getSource();
    }

    public setSource(source: SourceInterface): void {
        this.layer.setSource(<OlVectorSource> source.getSource());
    }

    public setLoader(loader: () => Promise<string>): void {   
        const source : OlVectorSource = <OlVectorSource> this.layer.getSource();
        source.setLoader(async () => {
            const data = await loader();
            source.addFeatures(new GeoJSON().readFeatures(data));
        });
    }

    /**
     * @param {Object<import("ol/geom/GeometryType.js").default, Array<Style>>} style - Style
     */
    public setStyle(style: unknown): void { 
        (<BaseVector> this.layer).setStyle(<Style> style);
    }

    public addFeatures(features: string, opts?: unknown): void {
        const srs: number = this.getSRSId(opts);
        (<OlVectorLayer> this.layer).getSource().addFeatures(new GeoJSON().readFeatures(features, {
            dataProjection: "EPSG:" + srs.toString(),
            featureProjection: "EPSG:3857"
        }));
    }

    /**
     * Gets features of layer
     *
     * @function getFeatures
     * @memberof Layer
     * @return {Array} - features of the layer
     */
    public getFeatures(): Feature[] {
        return (<OlVectorLayer> this.layer).getSource().getFeatures();
    }
    
    /**
     * Gets features of layer as GeoJSON
     *
     * @function getFeaturesAsGeoJSON
     * @memberof Layer
     * @return {String} - GeoJSON
     */
    public getFeaturesAsGeoJSON(): string {
        return new GeoJSON().writeFeatures(this.getFeatures());
    }

    private getSRSId(opts?: unknown): number {
        let srs = 3857;
        if (typeof opts !== "undefined" && Object.prototype.hasOwnProperty.call(opts, "srs_handling")) {
            const srsH: unknown = opts["srs_handling"];
            srs = srsH["srs_handling_type"] == "forced_declared" ? srsH["declared_coordinate_system_id"] : srsH["native_coordinate_system_id"];
        }
        return srs;
    }

}