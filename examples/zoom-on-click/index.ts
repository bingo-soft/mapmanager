import MapManager from "../../src/MapManager";
import Map from "../../src/Domain/Model/Map/Map";
import BaseLayer from "../../src/Domain/Model/Map/BaseLayer";

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


/* Set buttons click handlers */
const btZoomInClick: HTMLElement = document.getElementById("zoom-in");
btZoomInClick.onclick = function(e: any) {
    zoom(e, "in");
}

const btZoomOutClick: HTMLElement = document.getElementById("zoom-out");
btZoomOutClick.onclick = function(e: any) {
    zoom(e, "out");
}

/* Select handler */
const zoom = function(e: any, zoomType: string) {
    MapManager.setZoomInteraction(map, {
        "type": zoomType
    });
}