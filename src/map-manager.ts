import { MapState } from "./type";
import { mapCenterX, mapCenterY, mapZoom, geomStyles } from "./config";
import "ol/ol.css";
import OlMap from "ol/Map";
import { OverviewMap, defaults as defaultControls } from 'ol/control';
import { OSM, Vector as VectorSource } from "ol/source";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import View from "ol/View";
import Feature from "ol/Feature";
import GeoJSON from "ol/format/GeoJSON";
import * as Proj from "ol/proj";
import * as Coordinate from "ol/coordinate";
import Draw from "ol/interaction/Draw";
import GeometryType from "ol/geom/GeometryType";

import "ol-ext/dist/ol-ext.css";
import FillPattern from "ol-ext/style/FillPattern";



/** @class MapManager */
export default class MapManager { 

    private map: OlMap;
    private mapState: MapState;
    private geomStyles: unknown;

    
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
    * @param {String} targetDOMId - id of target DOM element 
    * @return {Boolean} true on success, false otherwise
    */
    public createMap(targetDOMId: string): boolean {
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
            target: targetDOMId,
            view: new View({
                center: this.mapState.center,
                zoom: this.mapState.zoom
            })
        });
        this.map
        return !!this.map;
    }


    /**
    * Sets center of the map. Notice: in case of degree-based CRS x is longitude, y is latitude.
    *
    * @function setCenter
    * @memberof MapManager
    * @param {Number} x - x coordinate
    * @param {Number} y - y coordinate
    * @param {String} crs - coordinates' CRS. Defaults to "EPSG:3857" (WGS 84 / Pseudo-Mercator)
    * @return {Boolean} true on success, false otherwise
    */
    public setCenter(x: number, y: number, crs = "EPSG:3857"): boolean {
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
    * @param {Unknown} geoJSON - GeoJSON object representing layer's features
    * @return {Boolean} true on success, false otherwise
    */
    public addLayer(geoJSON: unknown): boolean {
        if (this.map) {
            const vectorLayer: VectorLayer = new VectorLayer({
                source: new VectorSource({
                    features: new GeoJSON().readFeatures(<string>geoJSON),
                }),
                style: (feature: Feature) => {
                    return this.geomStyles[feature.getGeometry().getType().toUpperCase()];
                }
            });
            this.map.addLayer(vectorLayer);
            return true;
        }
        return false;
    }


    /**
    * Draws feature on the map.
    *
    * @function drawFeature
    * @memberof MapManager
    * @param {String} featureType - type of feature to draw. Can be "Point", "LineString", "MultiLineString", "Polygon", "MultiPolygon", "Circle". Case insensitive.
    * @return {Boolean} true on success, false otherwise
    */
    public drawFeature(featureType: string): boolean {
        if (this.map) {
            const vectorSource: VectorSource = new VectorSource({ wrapX: false });
            const vectorLayer: VectorLayer = new VectorLayer({ 
                source: vectorSource,
                style: () => {
                    return this.geomStyles[featureType.toUpperCase()];
                }
            });
            this.map.addLayer(vectorLayer);
            const draw: Draw = new Draw({
                source: vectorSource,
                type: <GeometryType>featureType,
            });
            draw.on("drawend", () => {
                this.map.removeInteraction(draw);
            });
            this.map.addInteraction(draw);
            return true;
        }
        return false;
    }
    

    /**
    * Returns default fill patterns.
    * @static
    * @function getDefaultFillPatterns
    * @memberof MapManager
    * @return {Array} array of default fill patterns
    */
    public static getDefaultFillPatterns(): string[] {
        const ret: string[] = [];
        for (const i in FillPattern.prototype.patterns) {
            const p = new FillPattern({ pattern: i });
            ret.push(p.getImage().toDataURL());
        }
        return ret;
    }
        
}


