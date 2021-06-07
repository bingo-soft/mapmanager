import { Vector as OlVectorLayer } from "ol/layer";
import { Source as OlSource } from "ol/source";
import { Vector as OlVectorSource } from "ol/source";
import OlGeoJSON from "ol/format/GeoJSON";
import OlFeature from "ol/Feature";
import BaseVectorLayer from "ol/layer/BaseVector";
import SourceType from "../../Source/SourceType";
import SourceInterface from "../../Source/SourceInterface";
import FeatureCollection from "../../Feature/FeatureCollection";
import AbstractLayer from "../AbstractLayer";
import EventHandlerCollection from "../../EventHandlerCollection/EventHandlerCollection";
import StyleFunction from "../../Style/StyleFunctionType";
import Feature from "../../Feature/Feature";


/** @class VectorLayer */
export default class VectorLayer extends AbstractLayer{

    private dirtyFeatures: FeatureCollection = new FeatureCollection([]);
    
    /**
     * @constructor
     * @memberof VectorLayer
     * @param {Object} opts - options
     */
    constructor(opts?: unknown) {
        super();
        this.srs = "EPSG:3857";
        if (typeof opts !== "undefined" && Object.prototype.hasOwnProperty.call(opts, "srs_handling")) {
            const srsH: unknown = opts["srs_handling"];
            this.srs = "EPSG:" + (srsH["srs_handling_type"] == "forced_declared" ? srsH["declared_coordinate_system_id"] : srsH["native_coordinate_system_id"]);
        }
        this.layer = new OlVectorLayer();
    }

    /**
     * Returns layer type
     *
     * @function getType
     * @memberof VectorLayer
     * @return {String} layer type
     */
    public getType(): SourceType {
        return SourceType.Vector;
    }

    /**
     * Returns layer's source
     *
     * @function getSource
     * @memberof VectorLayer
     * @return {Object} layer's source
     */
    public getSource(): OlSource {
        return this.layer.getSource();
    }

    /**
     * Sets layer's source
     *
     * @function setSource
     * @memberof VectorLayer
     * @param {Object} source - layer's source
     */
    public setSource(source: SourceInterface): void {
        const olSource: OlVectorSource = <OlVectorSource> source.getSource();
        this.layer.setSource(olSource);
        this.eventHandlers = new EventHandlerCollection(olSource);
    }

    /**
     * Sets layer's loader
     *
     * @function setLoader
     * @memberof VectorLayer
     * @param {Function} loader - loader function
     */
    public setLoader(loader: () => Promise<string>): void {   
        const source : OlVectorSource = <OlVectorSource> this.layer.getSource();
        source.setLoader(async () => {
            const data = await loader(); 
            source.addFeatures(new OlGeoJSON().readFeatures(data, {
                dataProjection: this.srs,
                featureProjection: "EPSG:3857"
            }));
        });
    }

    /**
     * Sets layer's source url
     *
     * @function setUrl
     * @memberof VectorLayer
     * @param {String} url - source url
     */
    public setUrl(url: string): void {
        (<OlVectorSource> this.layer.getSource()).setUrl(url);
    }

    /**
     * Sets layer's style
     *
     * @function setStyle
     * @memberof VectorLayer
     * @param {Function} style - style function
     */
    public setStyle(style: StyleFunction): void {
        (<BaseVectorLayer> this.layer).setStyle(style);
    }

    /**
     * Adds features to layer
     *
     * @function addFeatures
     * @memberof VectorLayer
     * @param {String} features - features as GeoJSON string
     */
    public addFeatures(features: string): void {
        (<OlVectorLayer> this.layer).getSource().addFeatures(new OlGeoJSON().readFeatures(features, {
            dataProjection: this.srs,
            featureProjection: "EPSG:3857"
        }));
    }

    /**
     * Returns features of layer
     *
     * @function getFeatures
     * @memberof VectorLayer
     * @return {Array} features of the layer
     */
    private getFeatures(): OlFeature[] {
        return (<OlVectorLayer> this.layer).getSource().getFeatures();
    }

    /**
     * Returns FeatureCollection of features
     *
     * @function getFeatureCollection
     * @memberof VectorLayer
     * @return {Object} FeatureCollection of features
     */
    public getFeatureCollection(): FeatureCollection {
        return new FeatureCollection(this.getFeatures(), this.srs, this.layer);
    }

    /**
     * Returns collection of dirty features
     *
     * @function getDirtyFeatures
     * @memberof VectorLayer
     * @return {Object} collection of dirty features
     */
    public getDirtyFeatures(): FeatureCollection {
        return this.dirtyFeatures;
    }

    /**
     * Adds or removes dirty features
     *
     * @function setDirtyFeatures
     * @memberof VectorLayer
     * @param {Object} features - collection of dirty features
     * @param {Boolean} dirty - dirty flag. If true, features are added to layer's dirty features collection, removed otherwise
     */
    public setDirtyFeatures(features: FeatureCollection, dirty: boolean): void  {
        features.setDirty(dirty);
        features.forEach((feature: Feature): void => {
            dirty ? this.dirtyFeatures.add(feature) : this.dirtyFeatures.remove(feature);
        });
    }

    /**
     * Checks if layer is dirty
     *
     * @function isDirty
     * @memberof VectorLayer
     * @return {Boolean} flag if layer is dirty
     */
    public isDirty(): boolean {
        return this.dirtyFeatures.getLength() != 0;
    }
    
}