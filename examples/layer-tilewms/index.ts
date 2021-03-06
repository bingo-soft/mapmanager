import MapManager from "../../src/MapManager";
import Map from "../../src/Domain/Model/Map/Map";
import BaseLayer from "../../src/Domain/Model/Map/BaseLayer";
import LayerInterface from "../../src/Domain/Model/Layer/LayerInterface";
import SourceType from "../../src/Domain/Model/Source/SourceType";

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

/* TileWMS layer - please set a correct url */
const opts = {
    url: "http://hostname/geoserver/ws/wms?service=WMS&version=1.1.0&request=GetMap&layers=layername&srs=EPSG%3A3857&format=image%2Fpng"
}
const layer: LayerInterface = MapManager.createLayer(SourceType.TileWMS, opts);

let added: boolean = false;

/* Set buttons click handlers */
const btLayerToggle: HTMLElement = document.getElementById("layer-toggle-btn");
btLayerToggle.onclick = function(e: any) {
    if (!added) {
        MapManager.addLayer(map, layer);
        e.target.style.backgroundColor = "#777";
        e.target.style.color = "#fff";
        added = true;
    } else {
        MapManager.removeLayer(map, layer);
        e.target.style.backgroundColor = "initial";
        e.target.style.color = "initial";
        added = false;
    }
}
