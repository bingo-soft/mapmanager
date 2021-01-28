import { MapState } from "./type";
import { mapCenterX, mapCenterY, mapZoom, geomStyles } from "./config";
import "ol/ol.css";
import OlMap from "ol/Map";
import { OverviewMap, defaults as defaultControls } from 'ol/control';
import { OSM, Vector as VectorSource } from "ol/source";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import View from "ol/View";
import GeoJSON from "ol/format/GeoJSON";
import * as Proj from "ol/proj";
import * as Coordinate from "ol/coordinate";

/** @class MapManager */
export default class MapManager { 
    private map: OlMap;
    private mapState: MapState;
    private geomStyles: object;

    
    constructor() {
        this.map = null;
        this.mapState = { center: [mapCenterX, mapCenterY], zoom: mapZoom };
        this.geomStyles = geomStyles;
    }   


    /**
    * Creates OpenLayers map object and controls.
    *
    * @function createMap
    * @memberof MapManager
    * @param {String} targetHtml - id of target html element 
    * @return {Boolean} true on success, false otherwise
    */
    public createMap(targetHtml: string): boolean {
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
        return !!this.map;
    }


    /**
    * Sets center of the map. Notice: in case of degree-based crs x is longitude, y is latitude.
    *
    * @function setCenter
    * @memberof MapManager
    * @param {Number} x - x coordinate
    * @param {Number} y - y coordinate
    * @return {Boolean} true on success, false otherwise
    */
    public setCenter(x: number, y: number, crs: string = "EPSG:3857"): boolean {
        if (this.map) {
            let coordinate: Coordinate.Coordinate = [x, y];
            if (crs.toUpperCase() != "EPSG:3857") {
                coordinate = Proj.transform(coordinate, crs, "EPSG:3857");
            }
            this.map.getView().setCenter(coordinate);
            this.mapState.center = coordinate;
            return true;
        }
        return false;
    }


    /**
    * Sets zoom of the map.
    *
    * @function setZoom
    * @memberof MapManager
    * @param {Number} zoom - zoom value
    * @return {Boolean} true on success, false otherwise
    */
    public setZoom(zoom: number): boolean {
        if (this.map) {
            this.map.getView().setZoom(zoom);
            this.mapState.zoom = zoom;
            return true;
        }
        return false;
    }


    /**
    * Adds layer to the map.
    *
    * @function addLayer
    * @memberof MapManager
    * @param {Object} geoJSON - GeoJSON object representing layer's features
    * @return {Boolean} true on success, false otherwise
    */
    public addLayer(geoJSON: object): boolean {
        if (this.map) {
            const vectorLayer: VectorLayer = new VectorLayer({
                source: new VectorSource({
                    features: new GeoJSON().readFeatures(geoJSON),
                }),
                style: (feature) => {
                    return this.geomStyles[feature.getGeometry().getType()];
                }
            });
            this.map.addLayer(vectorLayer);
            return true;
        }
        return false;
    }
}
