import stringify from 'json-stringify-safe';
import geojsonvt from 'geojson-vt';
import OlVectorTileLayer from "ol/layer/VectorTile";
import OlVectorTileSource from "ol/source/VectorTile";
import { LoadFunction, UrlFunction } from "ol/Tile";
import { Layer as OlLayer } from "ol/layer";
import OlGeoJSON from "ol/format/GeoJSON";
import OlMVT from "ol/format/MVT";
import OlProjection from "ol/proj/Projection";
import { compose, create, toString as toTransformString } from 'ol/transform';
import { FrameState as OlFrameState } from 'ol/Map';
import AbstractLayer from "../AbstractLayer";
import StyleFunction from "../../Style/StyleFunctionType";
import { FeaturePopupCssStyle } from "../../Style/FeaturePopupCssStyle";
import { OlBaseVectorLayer } from "../../Type/Type";
import VectorTileSourceFormat from '../../Source/VectorTileSourceFormat';

/** VectorTileLayer */
export default class VectorTileLayer extends AbstractLayer{
    private featurePopupTemplate = "";
    private featurePopupCss = "";
    private tileIndex;
    private format: OlGeoJSON | OlMVT = new OlMVT();
    private vertexHighlightStyle = null;

    private container;
    private transformContainer;
    private canvas;
    private mainThreadFrameState;
    private rendering;
    private workerFrameState;
    
    
    private static readonly DEFAULT_SRS_ID = 4326;
    
    /**
     * @param layer - OL layer
     * @param opts - options
     */
    constructor(layer?: OlLayer, opts?: unknown) {
        super();
        /* if (opts["json"]) {
            this.setTileIndex(opts["json"], this.srsId);
        } */
        opts["format"] = opts["format"] || VectorTileSourceFormat.MVT;
        if (layer) {
            this.layer = layer;
        } else {
            if (opts["format"] == VectorTileSourceFormat.MVT && opts["use_worker"]) { 
                //const worker = opts["format"] === "mvt" ? new Worker("../Worker/VectorTileRenderWorker.ts") : new Worker("../Worker/VectorTileJSONRenderWorker.ts");
                const worker = new Worker("../Worker/VectorTileRenderWorker.ts");
                this.layer = new OlLayer({
                    render: (frameState: OlFrameState) => {
                        if (!this.container) {
                            this.container = document.createElement("div");
                            this.container.style.position = "absolute";
                            this.container.style.width = "100%";
                            this.container.style.height = "100%";
                            this.transformContainer = document.createElement("div");
                            this.transformContainer.style.position = "absolute";
                            this.transformContainer.style.width = "100%";
                            this.transformContainer.style.height = "100%";
                            this.container.appendChild(this.transformContainer);
                            this.canvas = document.createElement("canvas");
                            this.canvas.style.position = "absolute";
                            this.canvas.style.left = "0";
                            this.canvas.style.transformOrigin = "top left"
                            this.transformContainer.appendChild(this.canvas);
                        }
                        this.mainThreadFrameState = frameState;
                        this.updateContainerTransform();
                        if (!this.rendering) {
                            this.rendering = true;
                            worker.postMessage({
                                action: "render",
                                layerSrsId: this.srsId,
                                request: opts["request"],
                                format: opts["format"],
                                style: opts["style"],
                                mapSRS: "EPSG:" + this.getMap().getSRSId().toString(),
                                frameState: JSON.parse(stringify(frameState)),
                            });
                        } else {
                            frameState.animate = true;
                        }
                        return this.container;
                    }
                });
                worker.addEventListener("message", (message) => {
                    if (message.data.action === 'loadImage') {
                        // Image loader for ol-mapbox-style
                        const image = new Image();
                        image.crossOrigin = 'anonymous';
                        image.addEventListener('load', function () {
                            createImageBitmap(image, 0, 0, image.width, image.height).then(
                                (imageBitmap) => {
                                    worker.postMessage(
                                        {
                                            action: 'imageLoaded',
                                            image: imageBitmap,
                                            src: message.data.src
                                        },
                                        [imageBitmap]
                                    );
                                }
                            );
                        });
                        image.src = message.data.src;
                    } else if (message.data.action === "requestRender") {
                        // Worker requested a new render frame
                        this.getMap().getMap().render();
                    } else if (this.canvas && message.data.action === "rendered") {
                        requestAnimationFrame(() => {
                            const imageData = message.data.imageData;
                            this.canvas.width = imageData.width;
                            this.canvas.height = imageData.height;
                            this.canvas.getContext("2d").drawImage(imageData, 0, 0);
                            this.canvas.style.transform = message.data.transform;
                            this.workerFrameState = message.data.frameState;
                            this.updateContainerTransform();
                        });
                        this.rendering = false;
                    }
                });
            } else {
                this.layer = new OlVectorTileLayer({
                    //declutter: true
                });
            }
        }
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
        }
    }

    /**
     * Sets layer's source format
     * @param format - source format
     */
    public setFormat(format: string): void {
        format = format ? format : VectorTileSourceFormat.MVT;
        if (format == VectorTileSourceFormat.GeoJSON) {
            this.format = new OlGeoJSON({
                dataProjection: new OlProjection({
                    code: 'TILE_PIXELS',
                    units: 'tile-pixels',
                    extent: [0, 0, 4096, 4096],
                })
            });
        } else if (format == VectorTileSourceFormat.MVT) {
            this.format = new OlMVT();
        }
    }

    /**
     * Returns layer's source URLs
     * @return layer's source URLs
     */
    public getUrls(): string[] {
        return (<OlVectorTileSource> this.layer.getSource()).getUrls();
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
     * @param json - GeoJSON object to create an index from
     * @param srsId - SRS Id of GeoJSON data
     */
    public setTileIndex(json: unknown, srsId: number): void {
        if (srsId != 4326) {
            const format = new OlGeoJSON();
            const features = format.readFeatures(json, {dataProjection: "EPSG:" + srsId.toString(), featureProjection: "EPSG:4326"});
            json = format.writeFeaturesObject(features);
        }
        console.log("tileIndex")
        this.tileIndex = geojsonvt(json, {
            maxZoom: 24,
            indexMaxZoom: 24,
            indexMaxPoints: 0,
            //tolerance: 100,
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
    public getFormat(): OlGeoJSON | OlMVT {
        return this.format;
    }

    /**
     * Sets layer's style
     * @param style - style function
     */
    public setStyle(style: StyleFunction): void { 
        (<OlBaseVectorLayer> this.layer)?.setStyle?.(style);
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
     * Sets vertex highlight style
     * @param style - vertex highlight style
     */
    public setVertexHighlightStyle(style: unknown): void  {
        this.vertexHighlightStyle = style;
    }

    private updateContainerTransform() {
        if (this.workerFrameState) {
            const viewState = this.mainThreadFrameState.viewState;
            const renderedViewState = this.workerFrameState.viewState;
            const center = viewState.center;
            const resolution = viewState.resolution;
            const rotation = viewState.rotation;
            const renderedCenter = renderedViewState.center;
            const renderedResolution = renderedViewState.resolution;
            const renderedRotation = renderedViewState.rotation;
            const transform = create();
            // Skip the extra transform for rotated views, because it will not work
            // correctly in that case
            if (!rotation) {
                compose(
                    transform,
                    (renderedCenter[0] - center[0]) / resolution,
                    (center[1] - renderedCenter[1]) / resolution,
                    renderedResolution / resolution,
                    renderedResolution / resolution,
                    rotation - renderedRotation,
                    0,
                    0
                );
            }
            this.transformContainer.style.transform = toTransformString(transform);
        }
    } 
}