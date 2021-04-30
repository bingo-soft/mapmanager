import MapManager from "../../src/MapManager";
import Map from "../../src/Domain/Model/Map/Map";
import BaseLayer from "../../src/Domain/Model/Map/BaseLayer";
import { MeasureType } from "../../src/Infrastructure/Util/Measure";

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

/* Set measure buttons click handler */
const btMeasureDistance: HTMLElement = document.getElementById("measure-distance-btn");
const btMeasureArea: HTMLElement = document.getElementById("measure-area-btn");
btMeasureDistance.onclick = measureHanler;
btMeasureArea.onclick = measureHanler;
function measureHanler(e: any) {
    let measureType: MeasureType;
    let units: string;
    switch (e.target.id) {
        case "measure-distance-btn":
            measureType = MeasureType.Distance;
            units = " m.";
            break;
        case "measure-area-btn":
            measureType = MeasureType.Area;
            units = " sq.m.";
            break;
        default:
    }
    if (measureType) {
        MapManager.startMeasure(measureType, map, function(result: number, toolTipCoord: number[]): void {
            const measureTooltip: HTMLElement = document.createElement("div");
            measureTooltip.className = "tooltip tooltip-static";
            measureTooltip.innerHTML = result + units;
            MapManager.createOverlay(map, measureTooltip, toolTipCoord, [0, -7]);
        });
    }
}