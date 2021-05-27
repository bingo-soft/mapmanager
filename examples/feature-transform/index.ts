import MapManager from "../../src/MapManager";
import Map from "../../src/Domain/Model/Map/Map";
import BaseLayer from "../../src/Domain/Model/Map/BaseLayer";
import LayerInterface from "../../src/Domain/Model/Layer/LayerInterface";
import FeatureCollection from "../../src/Domain/Model/Feature/FeatureCollection";

const geojsonObject = '{ "type": "FeatureCollection", "features": [ { "type": "Feature", "geometry": { "type": "Point", "coordinates": [ 43.91243896752929, 56.32925921113059 ] }, "properties": { } }, { "type": "Feature", "geometry": { "type": "Point", "coordinates": [ 43.918962099853516, 56.33506428695259 ] }, "properties": { } }, { "type": "Feature", "geometry": { "type": "LineString", "coordinates": [ [ 43.92376861840821, 56.329925412221826 ], [ 43.92806015283203, 56.3157423355226 ] ] }, "properties": { } }, { "type": "Feature", "geometry": { "type": "Polygon", "coordinates": [ [ [ 43.933038332763665, 56.33382721368193 ], [ 43.94917450219726, 56.325737669335865 ], [ 43.94934616357422, 56.34029761476677 ], [ 43.933038332763665, 56.33382721368193 ] ] ] }, "properties": { } }, { "type": "Feature", "properties": {}, "geometry": { "type": "Polygon", "coordinates": [ [ [ 43.934926986694336, 56.338665269145984 ], [ 43.9372444152832, 56.32848297204523 ], [ 43.94574165344238, 56.32515172442328 ], [ 43.95767211914062, 56.33457364448523 ], [ 43.934926986694336, 56.338665269145984 ] ] ] } } ] }';

/* Create and initialize map */
const optsMap = { 
    base_layer: BaseLayer.OSM,
    declared_coordinate_system_id: 3857,
    center: {
        x: 44.008741,
        y: 56.319241,
        declared_coordinate_system_id: 4326
    }, 
    zoom: 13
}
const map: Map = MapManager.createMap("map", optsMap);

/* Create layer */
const opts1 = {
    "srs_handling": {
        "native_coordinate_system_id": 4326,
        "declared_coordinate_system_id": 3857,
        "srs_handling_type": "reproject"
    }, 
    "style": {
        "point": {
            "marker_type":"simple_point",
            "color":"#00ff00",
            "opacity": 100,
            "size": 5
         },
        "linestring":{},
        "polygon":{}
    }
}
const layer: LayerInterface = MapManager.createLayerFromGeoJSON(geojsonObject, opts1);
MapManager.addLayer(map, layer);

let regime: string = "normal";

const btFeatureTransform: HTMLElement = document.getElementById("feature-transform-btn");
btFeatureTransform.onclick = function(e: any) {
    if (regime == "normal") {
        e.target.style.backgroundColor = "#777";
        e.target.style.color = "#fff";
        regime = "edit";
        MapManager.setTransformInteraction(map, {
            "selection_type": "singleclick",
            "source": layer,
            "modify_callback": function(features: FeatureCollection): void {
                console.log(features);
            }
        });
    } else {
        e.target.style.backgroundColor = "initial";
        e.target.style.color = "initial";
        regime = "normal";
        MapManager.setNormalInteraction(map);
    }
}