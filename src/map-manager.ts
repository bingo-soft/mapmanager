import { MapState } from "./type";
import { mapCenterX, mapCenterY, mapZoom, geomStyles } from "./config";
import "ol/ol.css";
import OlMap from "ol/Map";
import { OverviewMap, defaults as defaultControls } from 'ol/control';
import { OSM, Vector as VectorSource } from "ol/source";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import View from "ol/View";
import GeoJSON from "ol/format/GeoJSON";


class MapManager { 
    private map: OlMap;
    private mapState: MapState;
    private geomStyles: object;

    
    constructor() {
        this.map = null;
        this.mapState = { center: [mapCenterX, mapCenterY], zoom: mapZoom };
        this.geomStyles = geomStyles;
    }    


    public create(targetHtml: string): void {
        const source: OSM = new OSM();
        const overviewMapControl: OverviewMap = new OverviewMap({
            layers: [
                new TileLayer({
                    source: source,
                })
            ],
        });
        this.map = new OlMap({
            controls: defaultControls().extend([overviewMapControl]),
            layers: [
                new TileLayer({
                    source: source
                })
            ],
            target: targetHtml,
            view: new View({
                center: this.mapState.center,
                zoom: this.mapState.zoom
            })
        });
    }


    public setCenter(x: number, y: number): void {
        this.map.getView().setCenter([x, y]);
        this.mapState.center = [x, y];
    }


    public setZoom(zoom: number): void {
        this.map.getView().setZoom(zoom);
        this.mapState.zoom = zoom;
    }


    public addLayer(geoJSON: object): void {
        const vectorLayer: VectorLayer = new VectorLayer({
            source: new VectorSource({
                features: new GeoJSON().readFeatures(geoJSON),
            }),
            style: (feature) => {
                return this.geomStyles[feature.getGeometry().getType()];
            }
        });
        this.map.addLayer(vectorLayer);
    }
}

export default new MapManager();
