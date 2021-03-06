import MapManager from "../../src/MapManager";
import Map from "../../src/Domain/Model/Map/Map";
import BaseLayer from "../../src/Domain/Model/Map/BaseLayer";
import EventType from "../../src/Domain/Model/EventHandlerCollection/EventType";
import CursorType from "../../src/Domain/Model/Map/CursorType";

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
    controls: ["zoom", "overview"]
}
const map: Map = MapManager.createMap("map", optsMap);

/* Set map cursor type */
MapManager.setCursor(map, CursorType.SelectByArea);

/* Set an event handler to get cursor coordinates */
MapManager.setEventHandler(map, EventType.PointerMove, "GetCursorCoords", function(data: any): void {
    const pixelCoords: number[] = map.getCoordinateFromPixel(data.pixel);
    const srsCoords: number[] = MapManager.transformCoordinates(pixelCoords, map.getSRSId(), 4326);
    console.log(srsCoords);
});

/* Example how to unregister an event handler 
MapManager.getEventHandlers(map).remove("GetCursorCoords");
*/

