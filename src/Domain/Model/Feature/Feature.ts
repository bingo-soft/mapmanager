import OlFeature from "ol/Feature";
import GeoJSON from "ol/format/GeoJSON"

/** @class Feature */
export default class Feature { 
    
    private feature: OlFeature;

    constructor(feature: OlFeature) {
        this.feature = feature;
    }

    public getId(): string | number {
        return this.feature.getId();
    }

    public getProperties(): unknown {
        return this.feature.getProperties();
    }

    public getGeometryAsGeoJSON(): string {
        return new GeoJSON().writeFeature(this.feature);
    }

}