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

    private idleFeatures: FeatureCollection = new FeatureCollection([]);
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
        features.forEach((feature: Feature): void => {
            if (dirty) {
                if (this.dirtyFeatures.indexOf(feature) == -1) {
                    this.dirtyFeatures.add(feature);
                }
            } else {
                this.dirtyFeatures.remove(feature);

                //clean features are no longer removed
                for (let i = 0; i < this.removedFeatures.getLength(); i += 1) {
                    if (feature.getFeature() == this.removedFeatures.getAt(i).getFeature()) {
                        this.removedFeatures.remove(this.removedFeatures.getAt(i));
                        break;
                    }
                }

                //clean features are no longer idle
                for (let i = 0; i < this.idleFeatures.getLength(); i += 1) {
                    if (feature.getFeature() == this.idleFeatures.getAt(i).getFeature()) {
                        this.idleFeatures.remove(this.idleFeatures.getAt(i));
                        break;
                    }
                }
            }
        });
    }

    /**
     * Adds or removes idle features
     * @param features - collection of idle features
     * @param idle - idle flag. If true, features are added to layer's idle features collection, removed otherwise
     */
    public setIdleFeatures(features: FeatureCollection, idle: boolean): void  {
        features.forEach((feature: Feature): void => {
            if (idle) {
                this.idleFeatures.add(feature)
            } else {
                this.idleFeatures.remove(feature);
            }
        });
    }

    /**
     * Checks if layer is dirty
     * @return flag indicating that the layer is dirty
     */
    public isDirty(): boolean {
        if (this.removedFeatures.getLength() == this.idleFeatures.getLength() && this.removedFeatures.getLength() != 0) {
            for (let i = 0; i < this.removedFeatures.getLength(); i += 1) {
                const removedFeature = this.removedFeatures.getAt(i);
                //if there is an idle feature, that is not get removed
                if (this.idleFeatures.indexOf(removedFeature) == -1) {
                    return true;
                }
            }
            return false;
        }
        return (this.dirtyFeatures.getLength() != 0) || (this.removedFeatures.getLength() != 0);
    }

    /**
     * Returns collection of removed features
     * @return collection of removed features
     */
    public getRemovedFeatures(): FeatureCollection {
        let removedFeatures = new FeatureCollection([]);
        for (let i = 0; i < this.removedFeatures.getLength(); i += 1) {
            const removedFeature = this.removedFeatures.getAt(i);
            //if not idle
            if (this.idleFeatures.indexOf(removedFeature) == -1) {
                removedFeatures.add(removedFeature);
            }
        }
        return removedFeatures;
    }

    /**
     * Clears all layer dirty features
     */
    public clearDirtyFeatures(): void {
        this.setDirtyFeatures(this.getFeatures(), false);
        if (this.eventBus) {
            this.eventBus.dispatch(new SourceChangedEvent());
        }
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
            this.setRemovedFeature(features);
        } else if (features instanceof FeatureCollection) {
            for (let i = 0; i < features.getLength(); i += 1) {
                this.setRemovedFeature(features.getAt(i));
            }
        }
    }

    /**
     * If feature is not idle, add it to removed list
     * @param feature - feature to remove
     */
    private setRemovedFeature(feature: Feature): void {
        if (this.idleFeatures.indexOf(feature) > 0) {
            this.idleFeatures.remove(feature)
        } else {
            this.removedFeatures.add(feature);
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
        feature.setEventBus(this.eventBus);
        feature.updateFromVertices(items);
        return feature;
    }
    
}