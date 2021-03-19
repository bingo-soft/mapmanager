import OlFeature from "ol/Feature";
import GeoJSON from "ol/format/GeoJSON"
import GeometryType from "ol/geom/GeometryType"


/** @class Feature */
export default class Feature { 
    
    private feature: OlFeature;

    constructor(feature: OlFeature) {
        this.feature = feature;
    }

    public getFeature(): OlFeature {
        return this.feature;
    }

    public getId(): string | number {
        return this.feature.getId();
    }

    public getType(): string {
        return this.feature.getGeometry().getType();
    }

    public getProperties(): unknown {
        return this.feature.getProperties();
    }

    /* public getGeometryAsGeoJSON(): string {
        return new GeoJSON().writeFeature(this.feature);
    } */

}