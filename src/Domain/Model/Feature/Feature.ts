import OlFeature from "ol/Feature";
import OlLayer from "ol/layer/Layer";
/* import OlGeoJSON from "ol/format/GeoJSON";
import OlGeometryType from "ol/geom/GeometryType"; */


/** @class Feature */
export default class Feature { 
    
    private feature: OlFeature;
    private layer: OlLayer;

    constructor(feature: OlFeature, layer?: OlLayer) {
        this.feature = feature;
        if (layer) {
            this.layer = layer;
        }
    }

    public getFeature(): OlFeature {
        return this.feature;
    }

    /* public getLayerName(): OlLayer {
        return this.layer.get("name");
    } */

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
        return new OlGeoJSON().writeFeature(this.feature);
    } */

}