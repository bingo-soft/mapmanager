import MapManager from "../../src/MapManager";
import Map from "../../src/Domain/Model/Map/Map";
import BaseLayer from "../../src/Domain/Model/Map/BaseLayer";
import LayerInterface from "../../src/Domain/Model/Layer/LayerInterface";
import InteractionType from "../../src/Domain/Model/Interaction/InteractionType";
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
    zoom: 13,
    "source_change_callback": () => {
        const dirtyLayers = MapManager.getDirtyLayers(map);
        console.log("dirty layers: ", dirtyLayers);
    }
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

/* Set buttons click handlers */

const btSave: HTMLElement = document.getElementById("save-btn");
btSave.onclick = function(e: any) {
    const dirtyLayers = MapManager.getDirtyLayers(map);
    console.log("dirty layers: ", dirtyLayers);
    MapManager.clearDirtyFeatures(layer);
}


const btDrawPoint: HTMLElement = document.getElementById("draw-point-btn");
btDrawPoint.onclick = function(e: any) {
    MapManager.setNormalInteraction(map);
    MapManager.setDrawInteraction(map, layer, {
        "geometry_type": "Point"
    });
}

const btSelectByClick: HTMLElement = document.getElementById("select-byclick-btn");
btSelectByClick.onclick = function(e: any) {
    doSelect(e, "singleclick");
}
const btSelectByRectangle: HTMLElement = document.getElementById("select-byrectangle-btn");
btSelectByRectangle.onclick = function(e: any) {
    doSelect(e, "rectangle");
}

let selectedFeatures: FeatureCollection;

/* Select handler */

const doSelect = function(e: any, selectionType: string) {
    e.target.style.backgroundColor = "#777";
    e.target.style.color = "#fff";
    const regime: InteractionType = MapManager.getInteractionType(map);
    if (regime == InteractionType.Normal) {
        MapManager.setSelectInteraction(map, {
            "selection_type": selectionType,
            "layers": null,
            "select_callback": (features: FeatureCollection) => {
                selectedFeatures = features;
                console.log(features);
            }
        })
    } else {
        e.target.style.backgroundColor = "initial";
        e.target.style.color = "initial";
        MapManager.setNormalInteraction(map);
    }
}

/* Feature deletion */
const btRemoveFeatures: HTMLElement = document.getElementById("delete-feature-btn");
btRemoveFeatures.onclick = function(e: any) {
    MapManager.removeFeatures(map, selectedFeatures); 
}