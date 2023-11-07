import MVT from "ol/format/MVT";
import TileQueue, { getTilePriority as tilePriorityFunction } from "ol/TileQueue";
import VectorTileLayer from "ol/layer/VectorTile";
import VectorTileSource from "ol/source/VectorTile";
import stringify from "json-stringify-safe";
import { get } from "ol/proj";
import { inView } from "ol/layer/Layer";
import OlVectorTile from "ol/VectorTile";
import OlFeature from "ol/Feature";
import  { Tile as OlTileLayer } from "ol/layer";
import { OSM as OlOSM } from "ol/source";
import StyleBuilder from "../../Style/StyleBuilder";
import VectorLayerFeaturesLoadQuery from "../../../../Application/Query/VectorLayerFeaturesLoadQuery";
import VectorLayerRepository from "../../../../Infrastructure/Repository/VectorLayerRepository";

(<unknown> self.Image) = EventTarget;

let frameState, rendererTransform, pixelRatio;
const canvas = new OffscreenCanvas(1, 1);
// OffscreenCanvas does not have a style, so we mock it
(<any> canvas).style = {};
const context = canvas.getContext("2d");


let layer = null;
const layers = [];

// Minimal map-like functionality for rendering
const tileQueue = new TileQueue(
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
        const style = new StyleBuilder(event.data.style).build();
        const source = new VectorTileSource({
            format: new MVT(),
            url: event.data.request.base_url
        });
        source.setTileLoadFunction((tile: OlVectorTile, url: string) => {
            tile.setLoader(async function(extent, resolution, projection) {
                const payload = {
                    base_url: url,
                    method: event.data.request.method,
                    headers: event.data.request.headers,
                    data: event.data.request.data,
                    responseType: "arraybuffer",
                    axios_params: event.data.request.axios_params
                };
                if (event.data.request.method.toLowerCase() == "post") {
                    if (event.data.request.data) {
                        const data = new FormData();
                        Object.keys(event.data.request.data).forEach((key: string): void => {
                            data.append(key, JSON.stringify(event.data.request.data[key]));
                        });
                        payload["data"] = data;
                    }
                }
                const query = new VectorLayerFeaturesLoadQuery(new VectorLayerRepository());
                await query.execute(payload)
                .then(function(data) {
                    const format = tile.getFormat();
                    const features = format.readFeatures(data, {
                        extent: extent,
                        featureProjection: projection
                    });
                    tile.setFeatures(<OlFeature[]> features);
                });
            });
        });
        layer = new VectorTileLayer({
            declutter: true,
            source: source, 
            style: style,
            zIndex: 10
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
        layers.push(layer);

        /* layer = new OlTileLayer({
            source: new OlOSM({
              //transition: 0,
              tileLoadFunction: function (tile, src) {
                postMessage({
                  action: 'loadImage',
                  src: src,
                });
                addEventListener('message', (event) => {
                  if (event.data.src == src) {
                    (<any> tile).setImage(event.data.image);
                  }
                });
              }
            }),
            zIndex: 1
          });
          layer.getRenderer().useContainer = function (target, transform) {
            this.containerReused = this.getLayer() !== layers[0];
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

          layers.push(layer); */




        postMessage({action: "requestRender"});
    }


    frameState.tileQueue = tileQueue;
    
    //frameState.viewState.projection = get(event.data.mapSRS);
    frameState.viewState.projection = get(event.data.mapSRS);
    /* if (inView(layer.getLayerState(), frameState.viewState)) {
        const renderer = layer.getRenderer();
        renderer.renderFrame(frameState, canvas);
    }
    if (layer.getRenderer().context) {
        layer.renderDeclutter(frameState);
    } */
    
    
    layers.forEach((layer) => {
        if (inView(layer.getLayerState(), frameState.viewState)) {
          const renderer = layer.getRenderer();
          renderer.renderFrame(frameState, canvas);
        }
    });
    layers.forEach(
        (layer) => layer.getRenderer().context /* && layer.renderDeclutter(frameState) */
    );

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

