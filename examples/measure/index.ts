import MapManager from "../../src/MapManager";
import Map from "../../src/Domain/Model/Map/Map";
import BaseLayer from "../../src/Domain/Model/Map/BaseLayer";
import InteractionType from "../../src/Domain/Model/Interaction/InteractionType";
import MeasureType from "../../src/Domain/Model/Interaction/MeasureType";

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

/* Set measure handlers */
const btMeasureDistance: HTMLElement = document.getElementById("measure-distance-btn");
const btMeasureArea: HTMLElement = document.getElementById("measure-area-btn");
btMeasureDistance.onclick = measureHanler;
btMeasureArea.onclick = measureHanler;
function measureHanler(e: any) {
    const interactionType: InteractionType = MapManager.getInteractionType(map);
    if (interactionType == InteractionType.Normal) {
        e.target.style.backgroundColor = "#777";
        e.target.style.color = "#fff";
        let measureType: MeasureType;
        switch (e.target.id) {
            case "measure-distance-btn":
                measureType = MeasureType.Distance;
                break;
            case "measure-area-btn":
                measureType = MeasureType.Area;
                break;
            default:
        }
        if (measureType) {
            const optsMeasure = {
                "measure_type": measureType,
                "measure_units": {
                    distance: "m.",
                    area: "sq.m."
                }
            }
            MapManager.setMeasureInteraction(map, optsMeasure);
        }
    } else {
        e.target.style.backgroundColor = "initial";
        e.target.style.color = "initial";
        MapManager.setNormalInteraction(map);
    }
}

/* Set clear measure handler */
const btMeasureClear: HTMLElement = document.getElementById("measure-clear-btn");
btMeasureClear.onclick = measureClearHanler;
function measureClearHanler(e: any) {
    MapManager.clearMeasureResult(map);
}

