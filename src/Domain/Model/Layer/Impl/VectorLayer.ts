import { Layer as OlLayer } from "ol/layer";
import { Vector as VectorLayerOl } from "ol/layer";
import { Vector as OlVectorSource, Cluster as OlClusterSource } from "ol/source";
import OlGeoJSON from "ol/format/GeoJSON";
import OlFeature from "ol/Feature";
import { FeatureLoader } from "ol/featureloader";
import SourceChangedEvent from "../../Source/SourceChangedEvent";
import FeatureCollection from "../../Feature/FeatureCollection";
import AbstractLayer from "../AbstractLayer";
import StyleFunction from "../../Style/StyleFunctionType";
import Feature from "../../Feature/Feature";
import { FeaturePopupCssStyle } from "../../Style/FeaturePopupCssStyle";
import { OlBaseVectorLayer, OlVectorLayer } from "../../Type/Type";
import SourceType from "../../Source/SourceType";


/** VectorLayer */
export default class VectorLayer extends AbstractLayer{

    private idleFeatures: FeatureCollection = new FeatureCollection([]);
    private dirtyFeatures: FeatureCollection = new FeatureCollection([]);
    private removedFeatures: FeatureCollection = new FeatureCollection([]);
    private featurePopupSettings = {
        template: null,
        css: null,
        min_zoom: null,
        max_zoom: null
    };
    private vertexHighlightStyle = null;
    
    private static readonly DEFAULT_SRS_ID = 3857;
    
    /**
     * @param layer - OL layer
     * @param opts - options
     */
    constructor(layer?: OlLayer, opts?: unknown) {
        super();
        this.layer = layer ? layer : new VectorLayerOl({
            //declutter: true
        });
        this.srsId = VectorLayer.DEFAULT_SRS_ID;
        if (typeof opts !== "undefined" && Object.prototype.hasOwnProperty.call(opts, "srs_handling")) {
            const srsH: unknown = opts["srs_handling"];
            this.srsId = (srsH["srs_handling_type"] == "forced_declared" ? srsH["declared_coordinate_system_id"] : srsH["native_coordinate_system_id"]);
        }
        if (typeof opts !== "undefined" && Object.prototype.hasOwnProperty.call(opts, "min_zoom") && typeof opts["min_zoom"] == "number") {
            this.layer.setMinZoom(opts["min_zoom"]-1);
        }
        if (typeof opts !== "undefined" && Object.prototype.hasOwnProperty.call(opts, "max_zoom") && typeof opts["max_zoom"] == "number") {
            this.layer.setMaxZoom(opts["max_zoom"]);
        }
    }

    /**
     * Sets layer's loader
     * @param loader - loader function
     */
    public setLoader(loader: FeatureLoader): void {
        let source = this.layer.getSource();
        if (source instanceof OlClusterSource) {
            source = source.getSource();
        } 
        (<OlVectorSource> source).setLoader(loader);
    }

    /**
     * Returns layer's URL
     * @return layer's URL
     */
    public getUrl(): string {
        return (<OlVectorSource> this.layer.getSource()).getUrl().toString();
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
        (<OlBaseVectorLayer> this.layer).setStyle(style);
    }

    /**
     * Adds features to layer
     * @param features - features as an array of OL feature instances or as a GeoJSON string or as an object
     * @param targetSrs - target SRS 
     */
    public addFeatures(features: OlFeature[] | string | unknown, targetSrs?: string): void {
        let addingFeatures: OlFeature[] = [];
        if (Array.isArray(features)) {
            addingFeatures = <OlFeature[]> features; 
        } else {
            addingFeatures = new OlGeoJSON().readFeatures(features, {
                dataProjection: "EPSG:" + this.srsId,
                featureProjection: targetSrs ? targetSrs :  "EPSG:" + VectorLayer.DEFAULT_SRS_ID.toString()
            });
        }
        if (this.eventBus) {
            this.eventBus.dispatch(new SourceChangedEvent());
        }
        let source;
        if (this.getType() == SourceType.Vector) {
            source = (<OlVectorLayer> this.layer).getSource();
        } else { // clusters
            source = (<OlVectorLayer> this.layer).getSource();
            source = source.getSource();
        }
        source.addFeatures(addingFeatures);
        this.setDirtyFeatures(new FeatureCollection(<OlFeature[]> features));
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
    public setDirtyFeatures(features: FeatureCollection): void  {
        features.forEach((feature: Feature): void => {
            if (this.dirtyFeatures.indexOf(feature) == -1) {
                this.dirtyFeatures.add(feature);
            }
        });
    }

    /**
     * Adds or removes idle features
     * @param features - collection of idle features
     * @param idle - idle flag. If true, features are added to layer's idle features collection, removed otherwise
     */
    /* public setIdleFeatures(features: FeatureCollection, idle: boolean): void  {
        features.forEach((feature: Feature): void => {
            if (idle) {
                this.idleFeatures.add(feature)
            } else {
                this.idleFeatures.remove(feature);
            }
        });
    } */

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
        const removedFeatures = new FeatureCollection([]);
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
        this.dirtyFeatures = new FeatureCollection([]);
        this.removedFeatures = new FeatureCollection([]);
        this.idleFeatures = new FeatureCollection([]);
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
     * Returns feature popup settings
     * @return feature popup settings
     */
    public getFeaturePopupSettings(): unknown  {
        return this.featurePopupSettings;
    }
    
    /**
     * Sets feature popup settings
     * @param template - feature popup settings
     */
    public setFeaturePopupSettings(opts: unknown): void  {
        (<any> this.featurePopupSettings) = opts;
        if (typeof this.featurePopupSettings.css !== "string" || this.featurePopupSettings.css.trim().length == 0) {
            this.featurePopupSettings.css = FeaturePopupCssStyle;
        }
    }

    /**
     * Returns vertex highlight style
     * @return vertex highlight style
     */
    public getVertexHighlightStyle(): unknown  {
        return this.vertexHighlightStyle;
    }
    
    /**
     * Sets vertex highlight style
     * @param style - vertex highlight style
     */
    public setVertexHighlightStyle(style: unknown): void  {
        this.vertexHighlightStyle = style;
    }
  }