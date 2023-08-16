import geojsonvt from 'geojson-vt';
import OlBaseEvent from "ol/events/Event";
import { MapBrowserEvent as OlMapBrowserEvent } from "ol";
import OlVectorTileLayer from "ol/layer/VectorTile";
import OlVectorTileSource from "ol/source/VectorTile";
import { LoadFunction, UrlFunction } from "ol/Tile";
import { Layer as OlLayer } from "ol/layer";
import OlFeature from "ol/Feature";
import OlGeoJSON from "ol/format/GeoJSON";
import OlMVT from "ol/format/MVT";
import OlProjection from "ol/proj/Projection";
import AbstractLayer from "../AbstractLayer";
import StyleFunction from "../../Style/StyleFunctionType";
import { FeaturePopupCssStyle } from "../../Style/FeaturePopupCssStyle";
import { OlBaseVectorLayer, OlVectorLayer } from "../../Type/Type";
import VectorTileSourceFormat from '../../Source/VectorTileSourceFormat';
import FeatureClickFunction from '../FeatureClickFunctionType';
import FeatureCollection from '../../Feature/FeatureCollection';
import Feature from '../../Feature/Feature';
import EventType from '../../EventHandlerCollection/EventType';

/** VectorTileLayer */
export default class VectorTileLayer extends AbstractLayer{
    private featurePopupTemplate = "";
    private featurePopupCss = "";
    private tileIndex;
    private format;
    private vertexHighlightStyle = null;
    
    private static readonly DEFAULT_SRS_ID = 4326;
    
    /**
     * @param layer - OL layer
     * @param opts - options
     */
    constructor(layer?: OlLayer, opts?: unknown) {
        super();
        this.layer = layer ? layer : new OlVectorTileLayer({
            //declutter: true
        });
        this.srsId = VectorTileLayer.DEFAULT_SRS_ID;
        if (typeof opts !== "undefined") {
            if (Object.prototype.hasOwnProperty.call(opts, "srs_handling")) {
                const srsH: unknown = opts["srs_handling"];
                this.srsId = (srsH["srs_handling_type"] == "forced_declared" ? srsH["declared_coordinate_system_id"] : srsH["native_coordinate_system_id"]);
            }
            if (Object.prototype.hasOwnProperty.call(opts, "min_zoom") && typeof opts["min_zoom"] == "number") {
                this.layer.setMinZoom(opts["min_zoom"]-1);
            }
            if (Object.prototype.hasOwnProperty.call(opts, "max_zoom") && typeof opts["max_zoom"] == "number") {
                this.layer.setMaxZoom(opts["max_zoom"]);
            }
            //this.setFormat(opts["format"]);
        }
    }

    /**
     * Sets layer's source format
     * @param format - source format
     */
    public setFormat(format: string): void {
        format = format ? format : VectorTileSourceFormat.GeoJSON;
        if (format == VectorTileSourceFormat.GeoJSON) {
            this.format = new OlGeoJSON({
                dataProjection: new OlProjection({
                    code: 'TILE_PIXELS',
                    units: 'tile-pixels',
                    extent: [0, 0, 4096, 4096],
                }),
            });
        } else if (format == VectorTileSourceFormat.MVT) {
            this.format = new OlMVT();
        }
    }

    /**
     * Sets layer's source url
     * @param url - source url
     */
    public setUrl(url: string): void {
        (<OlVectorTileSource> this.layer.getSource()).setUrl(url);
    }

    /**
     * Sets layer's tile loader
     * @param loader - tile url function
     */
    public setTileUrlFunction(loader: UrlFunction): void {
        (<OlVectorTileSource> this.layer.getSource()).setTileUrlFunction(loader);
    }

    /**
     * Sets layer's tile loader
     * @param loader - loader function
     */
    public setTileLoadFunction(loader: LoadFunction): void {
        (<OlVectorTileSource> this.layer.getSource()).setTileLoadFunction(loader);
    }

    /**
     * Sets layer's tile index
     * @param json - json object to create an index from
     */
    public setTileIndex(json: unknown): void {
        this.tileIndex = geojsonvt(json, {
            maxZoom: 24,
            extent: 4096
        });
    }

    /**
     * Returns layer's tile index
     * @return layer's tile index
     */
    public getTileIndex(): unknown {
        return this.tileIndex;
    }

    /**
     * Returns layer's tile format
     * @return layer's tile format
     */
    public getFormat(): OlGeoJSON {
        return this.format;
    }

    /**
     * Sets layer's style
     * @param style - style function
     */
    public setStyle(style: StyleFunction): void { 
        (<OlBaseVectorLayer> this.layer).setStyle(style);
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
     * Returns feature popup CSS
     * @return feature popup CSS
     */
    public getFeaturePopupCss(): string  {
        return this.featurePopupCss;
    }
    
    /**
     * Sets feature popup CSS
     * @param css - feature popup CSS
     */
    public setFeaturePopupCss(css: string | null): void  {
        if (typeof css === "string" && css.trim().length != 0) {
            this.featurePopupCss = css;
        } else {
            this.featurePopupCss = FeaturePopupCssStyle;
        }
    }

    /**
     * Sets feature click callback 
     * @param callback - feature callback function
     */
    public setFeatureClickCallback(callback: FeatureClickFunction): void {
        const listener = (e: OlBaseEvent) => {
            const features = new FeatureCollection();
            const olMap = this.getMap().getMap();
            olMap.forEachFeatureAtPixel((<OlMapBrowserEvent<UIEvent>>e).pixel, (feature: OlFeature) => {
                features.add(new Feature(feature));
            });
            callback(features);
        }
        const map = this.getMap();
        if (typeof callback !== "function") {
            map.getEventHandlers().remove("VTFeatureClickEventHandler"); 
            return;
        }
        map.getEventHandlers().add(EventType.Click, "VTFeatureClickEventHandler", listener); 
    }

    /**
     * Sets vertex highlight style
     * @param style - vertex highlight style
     */
    public setVertexHighlightStyle(style: unknown): void  {
        this.vertexHighlightStyle = style;
    }

}