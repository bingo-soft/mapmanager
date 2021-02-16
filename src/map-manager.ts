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
import { Icon } from "ol/style";
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
    */
    public createMap(targetDOMId: string): void {
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
    * Returns data URIs containing a representation of the images of default fill patterns.
    * 
    * @function getDefaultFillPatterns
    * @static
    * @memberof MapManager
    * @return {Map} map of data URIs of default fill patterns
    */
    public static getDefaultFillPatterns(): Map<string, string> {
        const ret: Map<string, string> = new Map<string, string>();
        ret.set("empty", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVQYV2P4DwABAQEAWk1v8QAAAABJRU5ErkJggg==");
        for (const i in FillPattern.prototype.patterns) {
            const p = new FillPattern({ pattern: i });
            ret.set(i, p.getImage().toDataURL());
        }
        return ret;
    }


    /**
    * Returns a data URI containing a representation of the image of pattern with specified parameters.
    * 
    * @function getPatternDataURL
    * @static
    * @memberof MapManager
    * @param {String} patternName - pattern name.
    * @param {String} imageSrc - path to image file.
    * @param {Number} size - line size for hash/dot/circle/cross pattern.
    * @param {Number} spacing - spacing for hash/dot/circle/cross pattern.
    * @param {Number | Boolean} angle - angle for hash pattern, true for 45deg dot/circle/cross.
    * @return {String} data URI containing a representation of the image
    */
    public static getPatternDataURL(patternName: string, imageSrc: string, size: number, spacing: number, angle: number | boolean): string {
        const p: FillPattern = new FillPattern({
            pattern: patternName,
            image: new Icon({ src: imageSrc }),
            size: size,
            spacing: spacing,
            angle: angle
        });
        return p.getImage().toDataURL();
    }
}


