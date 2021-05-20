import MapManager from "../../src/MapManager";
import Map from "../../src/Domain/Model/Map/Map";
import BaseLayer from "../../src/Domain/Model/Map/BaseLayer";
import LayerInterface from "../../src/Domain/Model/Layer/LayerInterface";
import SourceType from "../../src/Domain/Model/Source/SourceType";
import { HttpMethod } from "../../src/Infrastructure/Http/HttpMethod";

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

/* Vector layer */
const opts = {
    "srs_handling": {
        "native_coordinate_system_id": 3857,
        "declared_coordinate_system_id": 3857,
        "srs_handling_type": "forced_declared"
    },
    "request": {
        "method": HttpMethod.GET,
        "base_url": "http://bingosoft-office.ru:58080/geoserver/rgisno/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=rgisno%3Ann_gp&outputFormat=application%2Fjson",
        "headers": null,
    },
    "style": {
        "polygon": {
            "color":"#0E38CF",
            "opacity":20,
            "background_color":"#FFF",
        }
    },
    "load_callback": () => {
        console.log("Layer loaded");
        MapManager.fitLayer(map, layer);
    }
}
const layer: LayerInterface = MapManager.createLayer(SourceType.Vector, opts);

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
