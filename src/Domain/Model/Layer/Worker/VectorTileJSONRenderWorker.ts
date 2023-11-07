//import MVT from "ol/format/MVT";
import OlTileQueue, { getTilePriority as tilePriorityFunction } from "ol/TileQueue";
import OlVectorTileLayer from "ol/layer/VectorTile";
import OlVectorTileSource from "ol/source/VectorTile";
import stringify from "json-stringify-safe";
import { get } from "ol/proj";
import { inView } from "ol/layer/Layer";
import OlVectorTile from "ol/VectorTile";
import { TileCoord as OlTilecoord } from 'ol/tilecoord';
import OlGeoJSON from "ol/format/GeoJSON";
import OlProjection from "ol/proj/Projection";
import geojsonvt from 'geojson-vt';
import StyleBuilder from "../../Style/StyleBuilder";
import StringUtil from "../../../../Infrastructure/Util/StringUtil";

let frameState, rendererTransform, pixelRatio;
const canvas = new OffscreenCanvas(1, 1);
// OffscreenCanvas does not have a style, so we mock it
(<any> canvas).style = {};
const context = canvas.getContext("2d");


let layer = null;

// Minimal map-like functionality for rendering
const tileQueue = new OlTileQueue(
    (tile, tileSourceKey, tileCenter, tileResolution) =>
        tilePriorityFunction(
            frameState,
            tile,
            tileSourceKey,
            tileCenter,
            tileResolution
        ),
    () => postMessage({action: "requestRender"})
);

const maxTotalLoading = 8;
const maxNewLoads = 2;

onmessage = (event) => {
    if (event.data.action !== "render") {
        return;
    }
    frameState = event.data.frameState;
    if (!pixelRatio) {
        pixelRatio = frameState.pixelRatio;

        let json = event.data.json;
        console.log("event.data.json", event.data.json)
        if (event.data.layerSrsId != 4326) {
            console.log("layerSrsId", event.data.layerSrsId)
            const format = new OlGeoJSON();
            const features = format.readFeatures(event.data.json, {dataProjection: "EPSG:" + event.data.layerSrsId.toString(), featureProjection: "EPSG:4326"});
            console.log("features", features)
            json = format.writeFeaturesObject(features);
        }
        console.log("json", json)
        const tileIndex = geojsonvt(json, {
            maxZoom: 24,
            indexMaxZoom: 24,
            indexMaxPoints: 0,
            //tolerance: 100,
            extent: 4096
        });
        console.log("tileIndex", tileIndex);

        const style = new StyleBuilder(event.data.style).build();
        const format = new OlGeoJSON({
            dataProjection: new OlProjection({
                code: 'TILE_PIXELS',
                units: 'tile-pixels',
                extent: [0, 0, 4096, 4096],
            }),
        });
        const source = new OlVectorTileSource({
            format: format
            //url: event.data.request.base_url
        });
        source.setTileUrlFunction((tileCoord: OlTilecoord) => {
            return JSON.stringify(tileCoord);
        });
        source.setTileLoadFunction((tile: OlVectorTile, url: string) => {
            const tileCoord = JSON.parse(url);
            //const tileIndex = event.data.tileIndex;
            const data = tileIndex.getTile(
                tileCoord[0],
                tileCoord[1],
                tileCoord[2]
            );
            console.log("data", data)
            const geojson = JSON.stringify({
                type: 'FeatureCollection',
                features: data ? data.features : [],
            }, StringUtil.replacer);
            //const format: any = layer.getFormat();
            
            const features = format.readFeatures(geojson, {
                extent: source.getTileGrid().getTileCoordExtent(tileCoord),
                featureProjection: "EPSG:" + event.data.mapSRS.toString()
            });
            console.log("features", features)
            tile.setFeatures(features);
        });
        layer = new OlVectorTileLayer({
            declutter: true,
            source: source, 
            style: style
        });
        layer.getRenderer().useContainer = function (target, transform) {
            this.containerReused = this.getLayer() !== layer;
            this.canvas = canvas;
            this.context = context;
            this.container = {
                firstElementChild: canvas,
                style: {
                    opacity: layer.getOpacity(),
                },
            };
            rendererTransform = transform;
        };
        postMessage({action: "requestRender"});
    }
    frameState.tileQueue = tileQueue;
    frameState.viewState.projection = get(event.data.mapSRS);
    if (inView(layer.getLayerState(), frameState.viewState)) {
        const renderer = layer.getRenderer();
        renderer.renderFrame(frameState, canvas);
    }
    if (layer.getRenderer().context) {
        layer.renderDeclutter(frameState);
    }
    if (tileQueue.getTilesLoading() < maxTotalLoading) {
        tileQueue.reprioritize();
        tileQueue.loadMoreTiles(maxTotalLoading, maxNewLoads);
    }
    const imageData = canvas.transferToImageBitmap();
    postMessage({
            action: "rendered",
            imageData: imageData,
            transform: rendererTransform,
            frameState: JSON.parse(stringify(frameState)),
        },
        <WindowPostMessageOptions> [imageData]
    );
};

