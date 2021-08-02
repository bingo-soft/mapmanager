import { Layer as OlLayer } from "ol/layer";
import { Vector as OlVectorLayer } from "ol/layer";
import { Vector as OlVectorSource } from "ol/source";
import OlGeoJSON from "ol/format/GeoJSON";
import OlFeature from "ol/Feature";
import BaseVectorLayer from "ol/layer/BaseVector";
import SourceChangedEvent from "../../Source/SourceChangedEvent";
import SourceType from "../../Source/SourceType";
import FeatureCollection from "../../Feature/FeatureCollection";
import AbstractLayer from "../AbstractLayer";
import StyleFunction from "../../Style/StyleFunctionType";
import Feature from "../../Feature/Feature";
import GeometryItem from "../../Feature/GeometryItem";


/** VectorLayer */
export default class VectorLayer extends AbstractLayer{

    private dirtyFeatures: FeatureCollection = new FeatureCollection([]);
    private removedFeatures: FeatureCollection = new FeatureCollection([]);
    private featurePopupTemplate = "";
    
    private static readonly DEFAULT_SRS_ID = 3857;
    
    /**
     * @param opts - options
     */
    constructor(layer?: OlLayer, opts?: unknown) { 
        super();
        this.layer = layer ? layer : new OlVectorLayer(/* {declutter: true} */);
        this.srsId = VectorLayer.DEFAULT_SRS_ID;
        if (typeof opts !== "undefined" && Object.prototype.hasOwnProperty.call(opts, "srs_handling")) {
            const srsH: unknown = opts["srs_handling"];
            this.srsId = (srsH["srs_handling_type"] == "forced_declared" ? srsH["declared_coordinate_system_id"] : srsH["native_coordinate_system_id"]);
        }
    }

    /**
     * Returns layer type
     * @return layer type
     */
    public getType(): SourceType {
        return SourceType.Vector;
    }

    /**
     * Sets layer's loader
     * @param loader - loader function
     */
    public setLoader(loader: () => Promise<string>): void {   
        const source = <OlVectorSource> this.layer.getSource();
        source.setLoader(async () => {
            const data = await loader(); 
            source.addFeatures(new OlGeoJSON().readFeatures(data, {
                dataProjection: "EPSG:" + this.srsId.toString(),
                featureProjection: "EPSG:" + VectorLayer.DEFAULT_SRS_ID.toString()
            }));
        });
    }

    /**
     * Sets layer's source url
     * @param url - source url
     */
    public setUrl(url: string): void {
        (<OlVectorSource> this.layer.getSource()).setUrl(url);
    }

    /**
     * Sets layer's style
     * @param style - style function
     */
    public setStyle(style: StyleFunction): void {
        (<BaseVectorLayer> this.layer).setStyle(style);
    }

    /**
     * Adds features to layer
     * @param features - features as an array of OL feature instances or GeoJSON string
     */
    public addFeatures(features: OlFeature[] | string): void {
        let addingFeatures: OlFeature[] = [];
        if (typeof features === "string") {
            addingFeatures = new OlGeoJSON().readFeatures(features, {
                dataProjection: "EPSG:" + this.srsId,
                featureProjection: "EPSG:" + VectorLayer.DEFAULT_SRS_ID.toString()
            });
        } else {
            addingFeatures = <OlFeature[]> features;            
        }
        if (this.eventBus) {
            this.eventBus.dispatch(new SourceChangedEvent());
        }
        (<OlVectorLayer> this.layer).getSource().addFeatures(addingFeatures);
    }

    /**
     * Returns features of layer
     * @return features of the layer
     */
    public getFeatures(): FeatureCollection {
        return new FeatureCollection((<OlVectorLayer> this.layer).getSource().getFeatures(), this);
    }

    /**
     * Returns collection of dirty features
     * @return collection of dirty features
     */
    public getDirtyFeatures(): FeatureCollection {
        return this.dirtyFeatures;
    }

    /**
     * Adds or removes dirty features
     * @param features - collection of dirty features
     * @param dirty - dirty flag. If true, features are added to layer's dirty features collection, removed otherwise
     */
    public setDirtyFeatures(features: FeatureCollection, dirty: boolean): void  {
        features.setDirty(dirty);
        features.forEach((feature: Feature): void => {
            dirty ? this.dirtyFeatures.add(feature) : this.dirtyFeatures.remove(feature);
        });
    }

    /**
     * Checks if layer is dirty
     * @return flag indicating that the layer is dirty
     */
    public isDirty(): boolean {
        return (this.dirtyFeatures.getLength() != 0) || (this.removedFeatures.getLength() != 0);
    }

    /**
     * Returns collection of removed features
     * @return collection of removed features
     */
    public getRemovedFeatures(): FeatureCollection {
        return this.removedFeatures;
    }

    /**
     * Adds features to removed
     * @param features - single feature or collection
     */
    public setRemovedFeatures(features: Feature | FeatureCollection): void  {
        if (typeof features === "undefined") {
            return;
        }
        if (features instanceof Feature) {
            this.removedFeatures.add(features);
        } else if (features instanceof FeatureCollection) {
            features.forEach((feature: Feature): void => {
                this.removedFeatures.add(feature);
            });
        }
    }

    /**
     * Returns feature popup template
     * @return feature popup template
     */
    public getFeaturePopupTemplate(): string  {
        return this.featurePopupTemplate;
    }
    
    /**
     * Sets feature popup template
     * @param template - feature popup template
     */
    public setFeaturePopupTemplate(template: string): void  {
        this.featurePopupTemplate = template;
    }

    /**
     * Creates feature from vertices and puts it into layer
     * @param array - array of feature vertices along with their ids and coordinates
     * @return resulting feature
     */
    public createFeatureFromVertices(items: GeometryItem[]): Feature {
        const feature = new Feature(new OlFeature(), this);
        this.addFeatures([feature.getFeature()]);
        this.setDirtyFeatures(new FeatureCollection([feature]), true);
        feature.updateFromVertices(items);
        if (this.eventBus) {
            this.eventBus.dispatch(new SourceChangedEvent());
        }
        return feature;
    }
    
}